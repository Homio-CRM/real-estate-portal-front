import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function BackToSearchButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push('/')}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
    >
      <ArrowLeft size={20} />
      Voltar a busca
    </button>
  );
}

