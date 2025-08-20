"use client";

import Link from "next/link";
import { Database, Search, MapPin, Plus, Home, Settings } from "lucide-react";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Settings className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Painel Administrativo
            </h1>
            <p className="text-gray-600">
              Ferramentas para gerenciar dados de condomínios
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Link 
              href="/admin/test-api"
              className="block p-6 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="flex items-center mb-3">
                <Plus className="h-8 w-8 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-green-900">Testar API</h3>
              </div>
              <p className="text-green-800 text-sm">
                Testar a API de condomínios em destaque com dados existentes.
              </p>
            </Link>

            <Link 
              href="/admin/debug-condos"
              className="block p-6 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="flex items-center mb-3">
                <Search className="h-8 w-8 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-blue-900">Debug Dados</h3>
              </div>
              <p className="text-blue-800 text-sm">
                Verificar dados existentes no banco de dados.
              </p>
            </Link>

            <Link 
              href="/"
              className="block p-6 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center mb-3">
                <Home className="h-8 w-8 text-orange-600 mr-3" />
                <h3 className="text-lg font-semibold text-orange-900">Página Inicial</h3>
              </div>
              <p className="text-orange-800 text-sm">
                Ver o resultado na seção "Condomínios em Destaque".
              </p>
            </Link>
          </div>

          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Status do Projeto</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">✅ API de Condomínios em Destaque</span>
                <span className="text-green-600 text-sm">Funcional</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">✅ Componentes de UI</span>
                <span className="text-green-600 text-sm">Completos</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800">✅ Integração com Supabase</span>
                <span className="text-green-600 text-sm">Usando condominium_search</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-800">⚠️ Dados de Vitória</span>
                <span className="text-yellow-600 text-sm">Precisam ser inseridos</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Próximos Passos</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li><strong>Execute "Testar API"</strong> para verificar se a API funciona com dados existentes</li>
              <li>Se a API retornar dados, vá para "Página Inicial" ver o resultado</li>
              <li>Use "Debug Dados" se precisar investigar problemas</li>
              <li>A seção "Condomínios em Destaque" deve aparecer com os dados disponíveis!</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>💡 Dica:</strong> O projeto já tem dados funcionais de Belo Horizonte. 
                A API foi ajustada para mostrar todos os lançamentos disponíveis, 
                independente da cidade.
              </p>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-semibold text-yellow-900 mb-2">Para Adicionar Dados de Vitória:</h4>
              <p className="text-yellow-800 text-sm">
                1. Use o arquivo <code>supabase/mock_data/insert_vitoria_condos.sql</code><br/>
                2. Execute as queries no SQL Editor do Supabase<br/>
                3. Execute na ordem: condomínios → localizações → mídias → verificação
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
