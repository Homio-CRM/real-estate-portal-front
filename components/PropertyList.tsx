import PropertyCarousel from "./PropertyCarousel";

type Property = {
  title: string;
  address: string;
  area: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  price: string;
  iptu?: string;
  image: string;
  forRent?: boolean;
};

type PropertyListProps = {
  filters: {
    tipo: string;
    localizacao: string;
    operacao: string;
  };
};

const mockProperties: Property[] = [
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

export type { PropertyListProps };
export function PropertyList({ filters }: PropertyListProps) {
  const filtered = mockProperties.filter((property) => {
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
  return <PropertyCarousel properties={filtered} />;
} 