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
  activeTab: string;
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
    image: "/public/house1.jpg",
  },
  {
    title: "Loteamento Green Ville, Atibaia",
    address: "Rua Quaresmeira Roxa",
    area: "295",
    bedrooms: 4,
    bathrooms: 4,
    parking: 5,
    price: "Aluguel de R$ 11.000/mês",
    image: "/public/house2.jpg",
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
    image: "/public/house3.jpg",
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
    image: "/public/house4.jpg",
  },
];

export default function PropertyList({ activeTab }: PropertyListProps) {
  const filtered = mockProperties.filter((property) => {
    if (activeTab === "comprar") {
      return !property.forRent;
    }
    if (activeTab === "alugar") {
      return property.forRent;
    }
    return true;
  });
  return <PropertyCarousel properties={filtered} />;
} 