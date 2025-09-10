"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Loader2, Database, Search, Info } from "lucide-react";

export default function DebugCondosPage() {
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    setDebugData(null);

    try {
      const response = await fetch('/api/admin/debug-condos');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados de debug');
      }

      setDebugData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const testFeaturedAPI = async () => {
    try {
      const response = await fetch('/api/condominiums/featured?cityId=3205309&limit=6');
      const data = await response.json();
      
      console.log("Featured API Response:", data);
      alert(`Featured API: ${response.ok ? 'Success' : 'Error'} - ${JSON.stringify(data, null, 2)}`);
    } catch (err) {
      console.error("Featured API Error:", err);
      alert(`Featured API Error: ${err}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Search className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Debug Condomínios
            </h1>
            <p className="text-gray-600">
              Verificar dados de condomínios no banco de dados
            </p>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={fetchDebugData}
                disabled={loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Verificar Dados no BD
                  </>
                )}
              </Button>

              <Button
                onClick={testFeaturedAPI}
                variant="outline"
                size="lg"
                className="w-full"
              >
                <Search className="mr-2 h-4 w-4" />
                Testar API Featured
              </Button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-2">Erro</h3>
                <pre className="text-red-800 text-sm whitespace-pre-wrap">{error}</pre>
              </div>
            )}

            {debugData && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Informações Gerais</h3>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p><strong>Agency ID:</strong> {debugData.agencyId}</p>
                    <p><strong>Timestamp:</strong> {debugData.timestamp}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Condomínios</h4>
                    <div className="text-sm text-green-800">
                      <p><strong>Total:</strong> {debugData.condominiums.count}</p>
                      {debugData.condominiums.error && (
                        <p className="text-red-600"><strong>Erro:</strong> {debugData.condominiums.error}</p>
                      )}
                      {debugData.condominiums.data.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Exemplos:</p>
                          <ul className="list-disc list-inside">
                            {debugData.condominiums.data.map((condo: any, idx: number) => (
                              <li key={idx} className="text-xs">
                                {condo.name} ({condo.is_launch ? 'Lançamento' : 'Normal'})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Localizações</h4>
                    <div className="text-sm text-yellow-800">
                      <p><strong>Total:</strong> {debugData.locations.count}</p>
                      <p><strong>Condomínios:</strong> {debugData.locations.condominiumLocations}</p>
                      {debugData.locations.error && (
                        <p className="text-red-600"><strong>Erro:</strong> {debugData.locations.error}</p>
                      )}
                      {debugData.locations.data.length > 0 && (
                        <div className="mt-2">
                          <p className="font-medium">Exemplos:</p>
                          <ul className="list-disc list-inside">
                            {debugData.locations.data.map((loc: any, idx: number) => (
                              <li key={idx} className="text-xs">
                                {loc.neighborhood} (Cidade: {loc.city_id})
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                    <h4 className="font-semibold text-secondary mb-2">Mídia</h4>
                    <div className="text-sm text-secondary">
                      <p><strong>Total:</strong> {debugData.media.count}</p>
                      <p><strong>Condomínios:</strong> {debugData.media.condominiumMedia}</p>
                      {debugData.media.error && (
                        <p className="text-red-600"><strong>Erro:</strong> {debugData.media.error}</p>
                      )}
                    </div>
                  </div>
                </div>

                {debugData.searchTable.exists && (
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-900 mb-2">Tabela condominium_search</h4>
                    <div className="text-sm text-indigo-800">
                      <p><strong>Existe:</strong> Sim</p>
                      <p><strong>Registros:</strong> {debugData.searchTable.data?.length || 0}</p>
                    </div>
                  </div>
                )}

                {debugData && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Dados Completos (JSON)</h4>
                    <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-2 rounded border">
                      {JSON.stringify(debugData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="text-center pt-4">
              <a 
                href="/admin/insert-mock-data" 
                className="text-blue-600 hover:text-blue-800 underline mr-4"
              >
                ← Inserir Dados Mock
              </a>
              <a 
                href="/" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Página Inicial
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
