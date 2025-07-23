"use client";

type PropertyFiltersProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const tabs = [
  { label: "Comprar", value: "comprar" },
  { label: "Alugar", value: "alugar" },
];

export default function PropertyFilters({ activeTab, onTabChange }: PropertyFiltersProps) {
  return (
    <section className="w-full bg-background py-6 px-4 rounded-b-3xl shadow-sm">
      <div className="flex gap-8 border-b border-border mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            className={`pb-2 px-2 text-lg font-medium transition-colors ${activeTab === tab.value ? "text-primary border-b-2 border-primary" : "text-foreground border-b-2 border-transparent"}`}
            onClick={() => onTabChange(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex flex-col w-full md:w-1/4">
          <label className="mb-1 text-sm text-muted-foreground">Tipo de imóvel</label>
          <select className="border border-border rounded px-3 py-2 bg-background text-foreground">
            <option>Todos os imóveis</option>
            <option>Casa</option>
            <option>Apartamento</option>
            <option>Terreno</option>
          </select>
        </div>
        <div className="flex flex-col w-full md:w-2/4">
          <label className="mb-1 text-sm text-muted-foreground">Onde deseja morar?</label>
          <input
            type="text"
            placeholder="Digite o nome da rua, bairro ou cidade"
            className="border border-border rounded px-3 py-2 bg-background text-foreground"
          />
        </div>
        <button className="mt-6 md:mt-5 h-12 px-8 rounded bg-primary text-primary-foreground font-semibold text-base">Buscar</button>
      </div>
    </section>
  );
} 