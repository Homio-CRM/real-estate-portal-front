import Link from 'next/link';
import Image from 'next/image';

interface HeaderProps {
  showLogo?: boolean;
}

export default function Header({ showLogo = true }: HeaderProps) {
  if (!showLogo) {
    return null;
  }

  return (
    <header className="w-full absolute top-0 left-0 z-10 flex items-center h-24 px-8">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/logomarca_vitoria_imoveis_11667839493275.png"
            alt="Vitória Imóveis"
            width={200}
            height={64}
            className="h-16 w-auto cursor-pointer"
            priority
          />
        </Link>
      </div>
    </header>
  );
} 