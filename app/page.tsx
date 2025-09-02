"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Header from "../components/Header";
import HeroSearchBar from "../components/HeroSearchBar";
import FeaturedProperties from "../components/FeaturedProperties";
import FeaturedCondominiums from "../components/FeaturedCondominiums";
import Footer from "../components/Footer";
import { buildListingsUrl } from "../lib/navigation";

export default function Home() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    tipo: "",
    localizacao: "",
    operacao: "comprar",
    bairro: "",
  });

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  function handleSearch() {
    const url = buildListingsUrl(filters as Record<string, string>);
    router.push(url);
  }

  const DEFAULT_CITY_ID = 3205309; // Vitória - ES

  return (
    <>
      <div className="min-h-screen relative">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2073&q=80')"
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <Header />
        
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Para você morar bem
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              Compre ou alugue com agilidade, segurança e sem burocracia
            </p>
          </div>
          
          <HeroSearchBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
          />
          
          <div className="mt-8 text-center">
            <a 
              href="#" 
              className="text-white underline text-lg hover:text-white/80 transition-colors"
            >
              Anuncie seu imóvel conosco
            </a>
          </div>
        </div>
      </div>
      
      <FeaturedProperties />
      
      <FeaturedCondominiums />
      
      <Footer />
    </>
  );
} // first commit
