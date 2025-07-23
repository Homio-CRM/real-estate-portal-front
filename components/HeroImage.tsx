export default function HeroImage() {
  return (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-muted flex items-center rounded-br-3xl overflow-hidden">
      <img
        src="/globe.svg"
        alt="Imagem destaque"
        className="object-cover w-full h-full"
        style={{ objectPosition: 'left center' }}
      />
    </div>
  );
} 