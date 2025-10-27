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
            backgroundImage: "url('/Vitoria_nx171007000006.jpg')"
          }}
        >
          <div className="absolute inset-0 bg-black/40"></div>
        </div>
        
        <Header />
        
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 leading-tight">
              Para você morar bem
            </h1>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-2xl mx-auto px-2">
              Compre ou alugue com agilidade, segurança e sem burocracia
            </p>
          </div>
          
          <div className="w-full max-w-6xl">
            <HeroSearchBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
            />
          </div>
          
          <div className="mt-6 md:mt-8 text-center">
            <a 
              href="#" 
              className="text-white underline text-sm sm:text-base md:text-lg hover:text-white/80 transition-colors"
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
