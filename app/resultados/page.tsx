"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, ReactNode } from "react";
import { PropertyList, PropertyListProps } from "../../components/PropertyList";
import Header from "../../components/Header";
import LoadingModal from "../../components/LoadingModal";

export default function Resultados() {
  const searchParams = useSearchParams();
  const filters: PropertyListProps["filters"] = {
    tipo: searchParams.get("tipo") || "",
    localizacao: searchParams.get("localizacao") || "",
    operacao: searchParams.get("operacao") || "comprar",
  };
  const [loading, setLoading] = useState(true);
  const [hasResults, setHasResults] = useState<boolean | null>(null);

  useEffect(() => {
    setLoading(true);
    setHasResults(null);
    setTimeout(() => {
      // Simula busca: verifica se algum imóvel seria retornado
      const mock = [
        {
          title: "Vila São João, Irati",
          address: "Rua Francisco Letchacovski",
          area: "48",
          bedrooms: 1,
          bathrooms: 1,
          parking: 2,
          price: "R$ 299.000",
          iptu: "R$ 183",
          image: "/house1.jpg",
        },
        {
          title: "Loteamento Green Ville, Atibaia",
          address: "Rua Quaresmeira Roxa",
          area: "295",
          bedrooms: 4,
          bathrooms: 4,
          parking: 5,
          price: "Aluguel de R$ 11.000/mês",
          image: "/house2.jpg",
          forRent: true,
        },
        {
          title: "Itacimirim (Monte Gordo), Camaçari",
          address: "Rua 8",
          area: "65",
          bedrooms: 3,
          bathrooms: 3,
          parking: 3,
          price: "R$ 195.000",
          image: "/house3.jpg",
        },
        {
          title: "Mansões Recreio Estrela",
          address: "Quadra 122",
          area: "2000",
          bedrooms: 3,
          bathrooms: 3,
          parking: 3,
          price: "R$ 450.000",
          iptu: "R$ 700",
          image: "/house4.jpg",
        },
      ];
      const filtered = mock.filter((property) => {
        if (filters.operacao === "comprar") {
          if (property.forRent) return false;
        }
        if (filters.operacao === "alugar") {
          if (!property.forRent) return false;
        }
        if (filters.tipo && filters.tipo !== "") {
          if (
            filters.tipo === "Casa" && property.title.toLowerCase().indexOf("casa") === -1 && property.address.toLowerCase().indexOf("casa") === -1
          ) return false;
          if (
            filters.tipo === "Apartamento" && property.title.toLowerCase().indexOf("apartamento") === -1 && property.address.toLowerCase().indexOf("apartamento") === -1
          ) return false;
          if (
            filters.tipo === "Terreno" && property.title.toLowerCase().indexOf("terreno") === -1 && property.address.toLowerCase().indexOf("terreno") === -1
          ) return false;
        }
        if (filters.localizacao && filters.localizacao !== "") {
          const loc = filters.localizacao.toLowerCase();
          if (
            property.address.toLowerCase().indexOf(loc) === -1 &&
            property.title.toLowerCase().indexOf(loc) === -1
          ) return false;
        }
        return true;
      });
      setHasResults(filtered.length > 0);
      setLoading(false);
    }, 900);
  }, [filters.tipo, filters.localizacao, filters.operacao]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-7xl mx-auto py-8">
        {loading && <LoadingModal />}
        {!loading && hasResults && <PropertyList filters={filters} />}
        {!loading && hasResults === false && (
          <div className="w-full flex flex-col items-center justify-center py-16 text-lg text-muted-foreground font-medium">
            Nenhum imóvel encontrado para os filtros selecionados.
          </div>
        )}
      </div>
    </div>
  );
} 