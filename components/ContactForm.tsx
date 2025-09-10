"use client";

import { useState } from "react";
import { Phone, Loader2 } from "lucide-react";

interface ContactFormProps {
  propertyTitle?: string;
  propertyId?: string;
}

export default function ContactForm({ propertyTitle, propertyId }: ContactFormProps) {
  const formUrl = propertyId 
    ? `https://sucesso.homio.com.br/widget/form/QHnK89mUPLfxN3OcVJQu?cod_imovel=${propertyId}`
    : "https://sucesso.homio.com.br/widget/form/QHnK89mUPLfxN3OcVJQu";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return;
    setSubmitting(true);
    try {
      window.open(formUrl, "_blank");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Phone className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold text-gray-900">Entrar em Contato</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Nome Completo</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nome Completo"
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-primary">Telefone *</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="27000000000"
            required
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-3 font-medium hover:bg-primary/90 transition-colors disabled:opacity-70"
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enviando
            </>
          ) : (
            <>Entrar em contato</>
          )}
        </button>
      </form>

      <a href={formUrl} target="_blank" rel="noopener noreferrer" className="block text-center text-sm text-primary mt-3 hover:underline">Abrir formulário completo</a>
    </div>
  );
}
