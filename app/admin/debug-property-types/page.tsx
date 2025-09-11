"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "../../../components/ui/button";
import { Loader2, Database } from "lucide-react";

export default function DebugPropertyTypesPage() {
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    setDebugData(null);

    try {
      const response = await fetch('/api/admin/debug-property-types');
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

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-8">
            <Database className="mx-auto h-12 w-12 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Debug Property Types
            </h1>
            <p className="text-gray-600">
              Verificar valores de property_type no banco de dados
            </p>
          </div>

          <div className="space-y-6">
            <div className="text-center">
              <Button
                onClick={fetchDebugData}
                disabled={loading}
                size="lg"
                className="w-full max-w-md"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Verificar Property Types
                  </>
                )}
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
                    <p><strong>Agency ID:</strong> {debugData.agency_id}</p>
                    <p><strong>Total Listings com Property Type:</strong> {debugData.total_listings_with_property_type}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">Property Types (Listing Table)</h4>
                    <div className="text-sm text-green-800">
                      <p><strong>Valores únicos:</strong></p>
                      <ul className="list-disc list-inside mt-2">
                        {debugData.unique_property_types_from_listing.map((type: string, idx: number) => (
                          <li key={idx} className="font-mono">{type}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 mb-2">Property Types (Search View)</h4>
                    <div className="text-sm text-yellow-800">
                      <p><strong>Valores únicos:</strong></p>
                      <ul className="list-disc list-inside mt-2">
                        {debugData.unique_property_types_from_search_view.map((type: string, idx: number) => (
                          <li key={idx} className="font-mono">{type}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {debugData.sample_listings.length > 0 && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Exemplos de Listings</h4>
                    <div className="text-sm text-gray-800">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">ID</th>
                              <th className="text-left p-2">Title</th>
                              <th className="text-left p-2">Property Type</th>
                              <th className="text-left p-2">Transaction Type</th>
                            </tr>
                          </thead>
                          <tbody>
                            {debugData.sample_listings.map((listing: any, idx: number) => (
                              <tr key={idx} className="border-b">
                                <td className="p-2 font-mono">{listing.listing_id.substring(0, 8)}...</td>
                                <td className="p-2">{listing.title}</td>
                                <td className="p-2 font-mono">{listing.property_type}</td>
                                <td className="p-2">{listing.transaction_type}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Dados Completos (JSON)</h4>
                  <pre className="text-xs text-gray-700 overflow-auto max-h-96 bg-white p-2 rounded border">
                    {JSON.stringify(debugData, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            <div className="text-center pt-4">
              <Link 
                href="/admin" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                ← Voltar ao Admin
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
