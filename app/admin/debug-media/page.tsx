"use client";

import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { Loader2, Database, Image, CheckCircle, XCircle, AlertCircle } from "lucide-react";

export default function DebugMediaPage() {
  const [loading, setLoading] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDebugData = async () => {
    setLoading(true);
    setError(null);
    setDebugData(null);

    try {
      console.log("=== FETCHING DEBUG MEDIA DATA ===");
      
      const response = await fetch('/api/admin/debug-media');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar dados de debug');
      }

      console.log("Debug data received:", data);
      setDebugData(data);
    } catch (err) {
      console.error("Debug fetch error:", err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Image className="w-8 h-8 text-secondary" />
            <h1 className="text-2xl font-bold text-gray-900">Debug - Dados de Mídia</h1>
          </div>

          <div className="space-y-6">
            {/* Botão de Ação */}
            <div className="flex gap-4">
              <Button
                onClick={fetchDebugData}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Database className="w-4 h-4" />
                )}
                {loading ? "Analisando..." : "Analisar Dados de Mídia"}
              </Button>
            </div>

            {/* Resultado do Debug */}
            {debugData && (
              <div className="space-y-4">
                {/* Resumo */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Resumo da Análise</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
                    <div>
                      <p><strong>Agency ID:</strong> {debugData.agency_id}</p>
                      <p><strong>Total de Mídias:</strong> {debugData.total_media_items}</p>
                    </div>
                    <div>
                      <p><strong>Listings da Agência:</strong> {debugData.agency_listings}</p>
                      <p><strong>Resultados JOIN:</strong> {debugData.join_query_results}</p>
                    </div>
                    <div>
                      <p><strong>Status:</strong> {
                        debugData.total_media_items > 0 && debugData.agency_listings > 0 
                          ? "✅ Dados encontrados" 
                          : "⚠️ Dados insuficientes"
                      }</p>
                    </div>
                  </div>
                </div>

                {/* Mídias Existentes */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900 mb-2">Mídias Existentes ({debugData.total_media_items})</h4>
                  {debugData.sample_media_items.length > 0 ? (
                    <div className="space-y-2">
                      {debugData.sample_media_items.map((media: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded border text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">ID: {media.id}</span>
                            {media.is_primary && (
                              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">PRIMARY</span>
                            )}
                          </div>
                          <p><strong>Listing ID:</strong> {media.listing_id}</p>
                          <p><strong>URL:</strong> <span className="break-all text-blue-600">{media.url}</span></p>
                          <p><strong>Caption:</strong> {media.caption}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-green-800">Nenhuma mídia encontrada na tabela</p>
                  )}
                </div>

                {/* Listings da Agência */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900 mb-2">Listings da Agência ({debugData.agency_listings})</h4>
                  {debugData.sample_listings.length > 0 ? (
                    <div className="space-y-2">
                      {debugData.sample_listings.map((listing: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded border text-sm">
                          <p><strong>ID:</strong> {listing.listing_id}</p>
                          <p><strong>Título:</strong> {listing.title}</p>
                          <p><strong>Agency ID:</strong> {listing.agency_id}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-orange-800">Nenhum listing encontrado para esta agência</p>
                  )}
                </div>

                {/* Resultado da Query JOIN */}
                <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
                  <h4 className="font-semibold text-secondary mb-2">Resultado da Query JOIN ({debugData.join_query_results})</h4>
                  {debugData.sample_join_data.length > 0 ? (
                    <div className="space-y-2">
                      {debugData.sample_join_data.map((item: any, idx: number) => (
                        <div key={idx} className="bg-white p-3 rounded border text-sm">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium">{item.title}</span>
                            <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                              {item.media_item?.length || 0} imagens
                            </span>
                          </div>
                          <p><strong>Listing ID:</strong> {item.listing_id}</p>
                          {item.media_item && item.media_item.length > 0 ? (
                            <div className="mt-2">
                              <p className="font-medium">Imagens:</p>
                              <ul className="list-disc list-inside ml-4">
                                {item.media_item.map((media: any, mediaIdx: number) => (
                                  <li key={mediaIdx} className="break-all">
                                    {media.url} {media.is_primary && "(PRIMARY)"}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-red-600">❌ Nenhuma imagem associada</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-secondary">Nenhum resultado da query JOIN</p>
                  )}
                </div>

                {/* Diagnóstico */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Diagnóstico</h4>
                  <div className="text-sm text-yellow-800 space-y-1">
                    {debugData.total_media_items === 0 && (
                      <p>❌ <strong>Problema:</strong> Não há mídias na tabela media_item</p>
                    )}
                    {debugData.agency_listings === 0 && (
                      <p>❌ <strong>Problema:</strong> Não há listings para esta agência</p>
                    )}
                    {debugData.total_media_items > 0 && debugData.agency_listings > 0 && debugData.join_query_results === 0 && (
                      <p>❌ <strong>Problema:</strong> Mídias existem mas não estão associadas aos listings da agência</p>
                    )}
                    {debugData.join_query_results > 0 && (
                      <p>✅ <strong>Status:</strong> Query JOIN funcionando - mídias estão sendo retornadas</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Erro */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <h3 className="font-semibold text-red-900">Erro</h3>
                </div>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            {/* Instruções */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Instruções:</h3>
              <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                <li>Clique em "Analisar Dados de Mídia" para verificar o estado atual</li>
                <li>Verifique se existem mídias na tabela media_item</li>
                <li>Verifique se existem listings para sua agência</li>
                <li>Verifique se a query JOIN está retornando dados</li>
                <li>Use "Testar API" para ver os logs detalhados da API de listing</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
