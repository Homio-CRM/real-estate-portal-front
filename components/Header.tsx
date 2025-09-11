import Link from 'next/link';
import Image from 'next/image';

export default function Header() {
  return (
    <header className="w-full absolute top-0 left-0 z-10 flex items-center h-24 px-8">
      <div className="flex items-center">
        <Link href="/">
          <Image 
            src="https://static.arboimoveis.com.br/white-label-assets/3787J_VIM/logomarca_vitoria_imoveis_11667839493275.png" 
            alt="Vitória Imóveis" 
            width={200}
            height={64}
            className="h-16 w-auto cursor-pointer" 
          />
        </Link>
      </div>
    </header>
  );
} 