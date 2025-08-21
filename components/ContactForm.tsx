"use client";

interface ContactFormProps {
  propertyTitle?: string;
  propertyId?: string;
}

export default function ContactForm({ propertyTitle, propertyId }: ContactFormProps) {
  const formUrl = propertyId 
    ? `https://sucesso.homio.com.br/widget/form/QHnK89mUPLfxN3OcVJQu?cod_imovel=${propertyId}`
    : "https://sucesso.homio.com.br/widget/form/QHnK89mUPLfxN3OcVJQu";

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 pt-4 px-4 pb-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-0">
        Entrar em Contato
      </h3>
      
      <div className="w-full">
        <iframe
          src={formUrl}
          className="w-full h-[320px] border-0 rounded-md opacity-0 transition-opacity duration-300"
          style={{ 
            marginTop: "-34px",
            opacity: 0
          }}
          title="Formulário de Contato"
          allow="camera; microphone; geolocation"
          loading="eager"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={(e) => {
            const iframe = e.target as HTMLIFrameElement;
            setTimeout(() => {
              iframe.style.opacity = '1';
            }, 100);
          }}
        />
      </div>
    </div>
  );
}
