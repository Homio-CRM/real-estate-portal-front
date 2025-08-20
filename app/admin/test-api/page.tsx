"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Loader2, TestTube, CheckCircle, AlertCircle } from "lucide-react";

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testFeaturedAPI = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/condominiums/featured?limit=10');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro na API');
      }

      setResult({
        success: true,
        count: data.length,
        data: data,
        status: response.status
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <TestTube className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Teste da API
            </h1>
            <p className="text-gray-600">
              Testar a API de condomínios em destaque com dados existentes
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                O que vamos testar:
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• API: <code>/api/condominiums/featured</code></li>
                <li>• Busca: condominium_search (materialized view)</li>
                <li>• Filtros: agency_id + is_launch = true</li>
                <li>• Dados: existentes no banco (BH + outros)</li>
              </ul>
            </div>

            <div className="text-center">
              <Button
                onClick={testFeaturedAPI}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Testando API...
                  </>
                ) : (
                  <>
                    <TestTube className="mr-2 h-4 w-4" />
                    Testar API Featured
                  </>
                )}
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                  <h3 className="font-semibold text-red-900">Erro na API</h3>
                </div>
                <p className="text-red-800 mt-1">{error}</p>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <h3 className="font-semibold text-green-900">API Funcionando!</h3>
                    </div>
                    
                    <div className="text-sm text-green-800 space-y-2">
                      <p><strong>Status:</strong> {result.status}</p>
                      <p><strong>Condomínios encontrados:</strong> {result.count}</p>
                    </div>

                    {result.count > 0 ? (
                      <div className="mt-4">
                        <h4 className="font-medium text-green-900 mb-2">Condomínios em Destaque:</h4>
                        <div className="space-y-3">
                          {result.data.map((condo: any, index: number) => (
                            <div key={index} className="bg-white border border-green-200 rounded p-3">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium text-gray-900">{condo.name}</h5>
                                  <p className="text-sm text-gray-600">{condo.display_address}</p>
                                  <p className="text-sm text-blue-600">{condo.price}</p>
                                </div>
                                <div className="text-right text-xs text-gray-500">
                                  <div>Cidade: {condo.city_id}</div>
                                  <div>Lançamento: {condo.is_launch ? 'Sim' : 'Não'}</div>
                                </div>
                              </div>
                              {condo.description && (
                                <p className="text-xs text-gray-600 mt-2 line-clamp-2">
                                  {condo.description}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-yellow-800 text-sm">
                          Nenhum condomínio em destaque encontrado. 
                          Verifique se existem dados com is_launch = true.
                        </p>
                      </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-green-200">
                      <p className="text-sm text-green-700">
                        🎉 Se há condomínios listados acima, a seção na página inicial deve funcionar!
                      </p>
                      <div className="mt-2 space-x-4">
                        <a 
                          href="/" 
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          ← Ver página inicial
                        </a>
                        <a 
                          href="/admin" 
                          className="text-sm text-blue-600 hover:text-blue-800 underline"
                        >
                          ← Painel admin
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="font-semibold text-red-900">Falha no teste</h3>
                    <pre className="text-red-800 text-sm mt-2 whitespace-pre-wrap">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Dados JSON Completos</h3>
              {result && (
                <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-2 rounded border">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
