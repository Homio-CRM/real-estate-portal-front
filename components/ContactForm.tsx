"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

type DealType = "rent" | "sale" | "launch";
type LeadOrigin = "owner" | "owner-hero" | "owner-footer";

interface ContactFormProps {
  propertyId?: string;
  propertyPublicId?: string;
  propertyUrl?: string;
  propertyPrice?: number | null;
  dealType: DealType;
  leadOrigin?: LeadOrigin;
}

const UPSERT_CONTACT_ENDPOINT = "/api/contacts/upsert";
const CREATE_OPPORTUNITY_ENDPOINT = "/api/opportunities/create";

const getInitialUrl = (explicitUrl?: string) => {
  if (explicitUrl) {
    if (typeof window !== "undefined") {
      try {
        return new URL(explicitUrl, window.location.origin).toString();
      } catch {
      }
    }
    return explicitUrl;
  }

  if (typeof window !== "undefined") {
    return window.location.href;
  }

  return "";
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }
  const [firstName, ...rest] = parts;
  return { firstName, lastName: rest.join(" ") };
};

export default function ContactForm({
  propertyId,
  propertyPublicId,
  propertyUrl,
  propertyPrice,
  dealType,
  leadOrigin,
}: ContactFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localUrl, setLocalUrl] = useState(() => getInitialUrl(propertyUrl));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const formatPhoneWithMask = (rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "").slice(0, 11);

    if (digits.length === 0) {
      return "";
    }

    if (digits.length <= 2) {
      return `(${digits}`;
    }

    if (digits.length <= 6) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    }

    if (digits.length <= 10) {
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  useEffect(() => {
    const nextUrl = getInitialUrl(propertyUrl);
    setLocalUrl(nextUrl);
  }, [propertyUrl]);

  const defaultMessage = useMemo(() => {
    if (leadOrigin) {
      return "";
    }
    const targetUrl = localUrl || propertyUrl || "";
    if (!targetUrl) {
      return "Olá, tenho interesse no imóvel.";
    }
    return `Olá, tenho interesse no imóvel ${targetUrl}`;
  }, [leadOrigin, localUrl, propertyUrl]);

  const previousDefaultRef = useRef<string | null>(null);

  useEffect(() => {
    setMessage((current) => {
      const previousDefault = previousDefaultRef.current;
      previousDefaultRef.current = defaultMessage;

      if (!current || current.trim().length === 0) {
        return defaultMessage;
      }

      if (previousDefault && current === previousDefault) {
        return defaultMessage;
      }

      return current;
    });
  }, [defaultMessage]);

  const sanitizedPhone = useMemo(() => {
    const digits = phone.replace(/\D+/g, "");
    if (!digits) {
      return "";
    }
    if (digits.startsWith("55")) {
      return digits;
    }
    return `55${digits}`;
  }, [phone]);

  const isEmailValid = useMemo(() => {
    if (!email.trim()) {
      return false;
    }
    const pattern =
      /^(?![_.-])[a-zA-Z0-9._%+-]+(?:\.[a-zA-Z0-9._%+-]+)*@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;
    return pattern.test(email.trim());
  }, [email]);

  const canSubmit = useMemo(() => {
    const hasName = fullName.trim().length > 0;
    const hasPhone = sanitizedPhone.length >= 12;
    return hasName && hasPhone;
  }, [fullName, sanitizedPhone]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!canSubmit) {
      setErrorMessage("Informe seu nome completo e um telefone válido.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload: Record<string, unknown> = {
      name: fullName.trim(),
      tags: ["operations"],
    };

    const { firstName, lastName } = splitFullName(fullName);

    if (firstName) {
      payload.firstName = firstName;
    }
    if (lastName) {
      payload.lastName = lastName;
    }

    if (isEmailValid) {
      payload.email = email.trim();
    }

    if (sanitizedPhone) {
      payload.phone = sanitizedPhone;
    }

    try {
      const response = await fetch(UPSERT_CONTACT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data: unknown;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        const hint =
          typeof data === "object" && data !== null && "error" in data
            ? String((data as Record<string, unknown>).error)
            : "Não foi possível enviar sua mensagem. Tente novamente.";
        throw new Error(hint);
      }

      const parsed = data as Record<string, unknown> | null;

      const contactFromPayload =
        (parsed?.contact as Record<string, unknown> | undefined)?.contact ??
        parsed?.contact;

      const extractedContactId =
        typeof parsed?.contactId === "string"
          ? parsed.contactId
          : (contactFromPayload as Record<string, unknown> | undefined)?.id ??
          (parsed?.data as Record<string, unknown> | undefined)?.id ??
          (Array.isArray(parsed?.data) && parsed?.data?.[0] && typeof parsed.data[0] === "object"
            ? (parsed.data[0] as Record<string, unknown>).id
            : undefined);

      const contactIdString = extractedContactId ? String(extractedContactId) : null;

      if (!contactIdString) {
        throw new Error("Não foi possível concluir sua solicitação. Tente novamente em instantes, por favor.");
      }

      const opportunityPayload: Record<string, unknown> = {
        contactId: contactIdString,
        dealType,
        name: fullName.trim(),
        propertyUrl: localUrl ?? "",
        message: message.trim(),
      };

      if (propertyPublicId) {
        opportunityPayload.propertyPublicId = propertyPublicId;
      } else if (propertyId) {
        opportunityPayload.propertyPublicId = propertyId;
      }

      if (propertyId) {
        opportunityPayload.propertyId = propertyId;
      }

      if (typeof propertyPrice === "number" && !Number.isNaN(propertyPrice)) {
        opportunityPayload.price = propertyPrice;
      }

      if (isEmailValid) {
        opportunityPayload.email = email.trim();
      }

      if (sanitizedPhone) {
        opportunityPayload.phone = sanitizedPhone;
      }

      if (leadOrigin) {
        opportunityPayload.leadOrigin = leadOrigin;
      }

      const opportunityResponse = await fetch(CREATE_OPPORTUNITY_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(opportunityPayload),
      });

      const opportunityText = await opportunityResponse.text();
      let opportunityData: unknown;

      try {
        opportunityData = opportunityText ? JSON.parse(opportunityText) : null;
      } catch {
        opportunityData = opportunityText;
      }

      if (!opportunityResponse.ok) {
        const hint =
          typeof opportunityData === "object" &&
            opportunityData !== null &&
            "error" in opportunityData
            ? String((opportunityData as Record<string, unknown>).error)
            : "Não foi possível registrar o interesse. Tente novamente.";
        throw new Error(hint);
      }

      const parsedOpportunity = opportunityData as Record<string, unknown> | null;
      const extractedOpportunityId =
        parsedOpportunity?.opportunityId ??
        (parsedOpportunity?.opportunity as Record<string, unknown> | undefined)?.id ??
        (parsedOpportunity?.data as Record<string, unknown> | undefined)?.id ??
        (Array.isArray(parsedOpportunity?.data) &&
          parsedOpportunity?.data?.[0] &&
          typeof parsedOpportunity.data[0] === "object"
          ? (parsedOpportunity.data[0] as Record<string, unknown>).id
          : undefined);

      setSuccessMessage("Muito obrigado por entrar em contato! Nosso time retornará com você em breve.");
      setIsSubmitting(false);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Não foi possível enviar sua mensagem. Tente novamente.";
      setErrorMessage(message);
      setIsSubmitting(false);
    }
  };

  return (
    <form className="space-y-5 p-6" onSubmit={handleSubmit} noValidate>

      <div className="grid grid-cols-1 gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">
            Nome completo <span className="text-red-500">*</span>
          </span>
          <input
            type="text"
            name="fullName"
            value={fullName}
            onChange={(event) => {
              setFullName(event.target.value);
              setSuccessMessage(null);
            }}
            placeholder="Digite seu nome"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">E-mail</span>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              setSuccessMessage(null);
            }}
            placeholder="nome@email.com"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">
            Telefone <span className="text-red-500">*</span>
          </span>
          <input
            type="tel"
            name="phone"
            value={phone}
            onChange={(event) => {
              const formattedValue = formatPhoneWithMask(event.target.value);
              setPhone(formattedValue);
              setSuccessMessage(null);
            }}
            placeholder="(00) 00000-0000"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium text-gray-700">Mensagem</span>
          <textarea
            name="message"
            value={message}
            onChange={(event) => {
              setMessage(event.target.value);
              setSuccessMessage(null);
            }}
            rows={4}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      <div className="space-y-3">
        <button
          type="submit"
          disabled={isSubmitting || !canSubmit || Boolean(successMessage)}
          className={`w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed ${successMessage
            ? "bg-green-600 hover:bg-green-600 focus:ring-green-500 disabled:bg-green-600"
            : "bg-primary hover:bg-primary/90 focus:ring-primary/20 disabled:bg-primary/60"
            } ${isSubmitting ? "cursor-wait" : ""}`}
        >
          {isSubmitting ? "Enviando..." : successMessage ?? "Enviar mensagem"}
        </button>

        {errorMessage && (
          <p className="text-sm text-red-600">
            {errorMessage}
          </p>
        )}
      </div>

      <input type="hidden" name="propertyId" value={propertyId ?? ""} />
      <input type="hidden" name="propertyUrl" value={localUrl ?? ""} />
    </form>
  );
}
