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
    <header className="w-full absolute top-0 left-0 z-10 flex items-center md:items-start justify-center md:justify-start h-24 px-4 md:pl-16 md:pt-16">
      <div className="flex items-center">
        <Link href="/">
          <Image
            src="/vitória_imoveis_logo_white.svg"
            alt="Vitória Imóveis"
            width={200}
            height={64}
            className="h-10 md:h-12 w-auto cursor-pointer"
            priority
          />
        </Link>
      </div>
    </header>
  );
} 