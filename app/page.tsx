"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../components/Header";
import PropertyFilters from "../components/PropertyFilters";
import { buildResultsUrl } from "../lib/navigation";

export default function Home() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    tipo: "",
    localizacao: "",
    operacao: "comprar",
  });

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSearch() {
    const url = buildResultsUrl(filters as Record<string, string>);
    router.push(url);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto">
        <PropertyFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
}
