type PropertyCardProps = {
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

export default function PropertyCard({
  title,
  address,
  area,
  bedrooms,
  bathrooms,
  parking,
  price,
  iptu,
  image,
  forRent,
}: PropertyCardProps) {
  return (
    <div className="bg-card rounded-xl shadow border border-border flex flex-col w-full h-full box-border p-4 justify-center">
      <img src={image} alt={title} className="w-full h-32 object-cover rounded-t-xl" />
      <div className="flex-1 flex flex-col gap-2 justify-center">
        <h2 className="text-lg font-semibold text-foreground truncate">{title}</h2>
        <p className="text-sm text-muted-foreground truncate">{address}</p>
        <div className="flex gap-4 text-sm text-muted-foreground mt-2">
          <span>{area} m²</span>
          <span>{bedrooms} 🛏</span>
          <span>{bathrooms} 🛁</span>
          <span>{parking} 🚗</span>
        </div>
        <div className="mt-2">
          <span className="text-base font-bold text-foreground">{price}</span>
          {iptu && <span className="ml-2 text-xs text-muted-foreground">IPTU {iptu}</span>}
        </div>
        {forRent && <span className="text-primary text-xs font-medium">Aluguel</span>}
        <div className="flex gap-2 mt-4">
          <button className="flex-1 h-10 rounded bg-primary text-primary-foreground font-semibold">Mensagem</button>
          <button className="flex-1 h-10 rounded border border-primary text-primary font-semibold">Telefone</button>
        </div>
      </div>
    </div>
  );
} 