import Link from 'next/link';

export default function Footer() {
  return (
    <>
      <div className="border-t border-gray-100"></div>
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            
            <div className="space-y-4 text-center">
              <div>
                <img 
                  src="https://static.arboimoveis.com.br/white-label-assets/3787J_VIM/logomarca_vitoria_imoveis_11667839493275.png" 
                  alt="Vitória Imóveis" 
                  className="h-12 w-auto mx-auto" 
                />
              </div>
              <div className="text-gray-600 text-sm">
                CRECI: 3787J
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-red-600 font-bold text-lg">
                Conheça
              </h3>
              <div className="space-y-2">
                <Link href="#" className="block text-gray-600 hover:text-red-600 transition-colors">
                  Área do proprietário
                </Link>
                <Link href="#" className="block text-gray-600 hover:text-red-600 transition-colors">
                  Lançamento
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-red-600 font-bold text-lg">
                Contato
              </h3>
              <div className="space-y-2">
                <div className="text-gray-600">
                  (27) 3200-3029
                </div>
                <Link href="#" className="block text-gray-600 hover:text-red-600 transition-colors">
                  Fale conosco
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <button className="w-full bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition-colors">
                Cadastre seu imóvel
              </button>
              
              <div className="space-y-3">
                <div className="text-gray-600 text-sm">
                  Acompanhe nossas redes
                </div>
                <div className="flex space-x-3">
                  <Link href="#" className="text-red-600 hover:text-red-700 transition-colors">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200">
          <div className="max-w-7xl mx-auto px-8 py-4">
            <div className="flex flex-col items-center space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-red-600 font-semibold">© Vitoria Imóveis.</span>
                <span className="text-gray-600">Todos os direitos reservados.</span>
                <Link href="#" className="text-gray-600 underline hover:text-red-600 transition-colors">
                  Termos de uso
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
