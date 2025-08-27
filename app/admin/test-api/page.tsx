"use client";

import { useState } from "react";

export default function TestAPI() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [directQuery, setDirectQuery] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setDirectQuery(null);

    try {
      console.log("=== TESTING API DIRECTLY ===");
      
      const response = await fetch('/api/listing?cityId=3205309&transactionType=sale&limit=3');
      console.log("Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("API Response:", result);
      
      setData(result);
    } catch (err) {
      console.error("API Test Error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const testDirectQuery = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    setDirectQuery(null);

    try {
      console.log("=== TESTING DIRECT SUPABASE QUERY ===");
      
      const response = await fetch('/api/admin/test-direct-query');
      console.log("Direct query response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log("Direct Query Response:", result);
      
      setDirectQuery(result);
    } catch (err) {
      console.error("Direct Query Error:", err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test API</h1>
      
      <div className="space-x-4 mb-4">
        <button 
          onClick={testAPI}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API'}
        </button>
        
        <button 
          onClick={testDirectQuery}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct Query'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {data && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">API Response:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Analysis:</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Total items: {data.length}</li>
              {data.length > 0 && (
                <>
                  <li>First item has media: {data[0].media ? 'Yes' : 'No'}</li>
                  <li>First item media count: {data[0].media_count || 0}</li>
                  <li>First item has primary_image_url: {data[0].primary_image_url ? 'Yes' : 'No'}</li>
                  {data[0].media && (
                    <li>First item media URLs: {data[0].media.map((m: any) => m.url).join(', ')}</li>
                  )}
                </>
              )}
            </ul>
          </div>
        </div>
      )}

      {directQuery && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Direct Query Response:</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre className="text-sm overflow-auto">
              {JSON.stringify(directQuery, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}
