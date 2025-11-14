import { NextResponse } from "next/server";

type UpsertRequestBody = {
  name?: string;
  email?: string;
  phone?: string;
  tags?: string[];
};

const SUPABASE_OPERATIONS_URL = process.env.SUPABASE_OPERATIONS_URL;
const SUPABASE_OPERATIONS_ANON_KEY = process.env.SUPABASE_OPERATIONS_ANON_KEY;
const LOCATION_ID = process.env.LOCATION_ID;

const normalizePhone = (phone?: string) => {
  if (!phone) {
    return undefined;
  }

  const digits = phone.replace(/\D+/g, "");
  if (!digits) {
    return undefined;
  }

  if (digits.startsWith("55")) {
    return digits;
  }

  return `55${digits}`;
};

const splitFullName = (fullName: string) => {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) {
    return {
      firstName: parts[0] ?? "",
      lastName: "",
    };
  }

  const [firstName, ...rest] = parts;
  return {
    firstName,
    lastName: rest.join(" "),
  };
};

export async function POST(request: Request) {
  if (!SUPABASE_OPERATIONS_URL || !SUPABASE_OPERATIONS_ANON_KEY) {
    return NextResponse.json(
      { error: "Supabase Operations credentials are not configured." },
      { status: 500 },
    );
  }

  if (!LOCATION_ID) {
    return NextResponse.json(
      { error: "LOCATION_ID is not configured." },
      { status: 500 },
    );
  }

  let body: UpsertRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim();
  const phone = normalizePhone(body.phone);

  if (!name) {
    return NextResponse.json(
      { error: "O campo 'name' é obrigatório." },
      { status: 400 },
    );
  }

  if (!email && !phone) {
    return NextResponse.json(
      { error: "Informe ao menos um e-mail válido ou telefone." },
      { status: 400 },
    );
  }

  const url = `${SUPABASE_OPERATIONS_URL.replace(/\/+$/, "")}/functions/v1/ghl-upsert-contact`;
  const { firstName, lastName } = splitFullName(name);

  const payload: Record<string, unknown> = {
    locationId: LOCATION_ID,
    name,
  };

  if (firstName) {
    payload.firstName = firstName;
  }

  if (lastName) {
    payload.lastName = lastName;
  }

  if (email) {
    payload.email = email;
  }

  if (phone) {
    payload.phone = phone;
  }

  if (Array.isArray(body.tags) && body.tags.length > 0) {
    const filteredTags = body.tags.filter(
      (value): value is string => typeof value === "string" && value.trim().length > 0,
    );
    if (filteredTags.length > 0) {
      payload.tags = filteredTags;
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_OPERATIONS_ANON_KEY}`,
        apikey: SUPABASE_OPERATIONS_ANON_KEY,
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
      return NextResponse.json(
        {
          error: "Falha ao criar o contato.",
          details: data,
        },
        { status: response.status },
      );
    }

    const parsed = data as Record<string, unknown> | null;
    const extractedId =
      (parsed?.contact as Record<string, unknown> | undefined)?.id ??
      parsed?.id ??
      (parsed?.data as Record<string, unknown> | undefined)?.id ??
      (Array.isArray(parsed?.data) &&
      parsed?.data?.[0] &&
      typeof parsed.data[0] === "object"
        ? (parsed.data[0] as Record<string, unknown>).id
        : undefined);

    return NextResponse.json(
      {
        contactId: extractedId ? String(extractedId) : null,
        contact: parsed,
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Erro ao se comunicar com a API de contatos.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

