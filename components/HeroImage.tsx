import Image from 'next/image';

export default function HeroImage() {
  return (
    <div className="w-full h-64 md:h-80 lg:h-96 bg-muted flex items-center rounded-br-3xl overflow-hidden">
      <Image
        src="/globe.svg"
        alt="Imagem destaque"
        width={800}
        height={400}
        className="object-cover w-full h-full"
        style={{ objectPosition: 'left center' }}
      />
    </div>
  );
} 