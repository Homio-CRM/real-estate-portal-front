"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { X } from "lucide-react";

type ResultsFiltersProps = {
  filters: {
    tipo: string;
    operacao: string;
    quartos: string;
    banheiros: string;
    vagas: string;
    precoMin: string;
    precoMax: string;
    areaMin: string;
    areaMax: string;
    anoMin: string;
    anoMax: string;
    caracteristicas: string[];
  };
  onFilterChange: (key: string, value: string | string[]) => void;
  onClearFilters: () => void;
};

function formatCurrency(value: string): string {
  if (!value) return "";
  
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, "");
  
  if (numbers === "") return "";
  
  // Converte para número e formata
  const num = parseInt(numbers);
  return num.toLocaleString("pt-BR");
}

function parseCurrency(value: string): number {
  if (!value) return 0;
  const numbers = value.replace(/\D/g, "");
  return parseFloat(numbers) || 0;
}

export default function ResultsFilters({ filters, onFilterChange, onClearFilters }: ResultsFiltersProps) {
  const [precoMinDisplay, setPrecoMinDisplay] = useState(filters.precoMin);
  const [precoMaxDisplay, setPrecoMaxDisplay] = useState(filters.precoMax);

  // Sincronizar estados de exibição quando os filtros mudam
  useEffect(() => {
    if (filters.precoMin) {
      setPrecoMinDisplay(formatCurrency(filters.precoMin));
    } else {
      setPrecoMinDisplay("");
    }
  }, [filters.precoMin]);

  useEffect(() => {
    if (filters.precoMax) {
      setPrecoMaxDisplay(formatCurrency(filters.precoMax));
    } else {
      setPrecoMaxDisplay("");
    }
  }, [filters.precoMax]);

  const handlePrecoMinChange = (value: string) => {
    const formatted = formatCurrency(value);
    setPrecoMinDisplay(formatted);
    
    // Só atualiza o filtro se o valor for válido
    if (formatted) {
      const numericValue = parseCurrency(formatted);
      if (numericValue > 0) {
        onFilterChange("precoMin", numericValue.toString());
      }
    } else {
      onFilterChange("precoMin", "");
    }
  };

  const handlePrecoMaxChange = (value: string) => {
    const formatted = formatCurrency(value);
    setPrecoMaxDisplay(formatted);
    
    // Só atualiza o filtro se o valor for válido
    if (formatted) {
      const numericValue = parseCurrency(formatted);
      if (numericValue > 0) {
        onFilterChange("precoMax", numericValue.toString());
      }
    } else {
      onFilterChange("precoMax", "");
    }
  };

  return (
    <div className="space-y-4 w-full lg:w-80">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Tipo de Transação</h4>
        <Select value={filters.operacao || "todos"} onValueChange={(value: string) => onFilterChange("operacao", value === "todos" ? "" : value)}>
          <SelectTrigger>
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            <SelectItem value="comprar">Comprar</SelectItem>
            <SelectItem value="alugar">Alugar</SelectItem>
            <SelectItem value="lancamento">Lançamento</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Tipos de Propriedade</h4>
        <div className="space-y-2">
          {[
            "Apartamento",
            "Casa", 
            "Kitnet",
            "Loft",
            "Cobertura",
            "Casa Geminada",
            "Terreno",
            "Comercial",
            "Escritório",
            "Loja",
            "Galpão"
          ].map((propertyType) => (
            <label key={propertyType} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox
                checked={filters.tipo === propertyType}
                onCheckedChange={() => onFilterChange("tipo", filters.tipo === propertyType ? "" : propertyType)}
              />
              <span className="text-sm text-gray-700">{propertyType}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Características</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-2">Quartos</label>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5+"].map((qtd) => (
                <button
                  key={qtd}
                  type="button"
                  onClick={() => onFilterChange("quartos", filters.quartos === qtd ? "" : qtd)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.quartos === qtd
                      ? "border-2 border-primary text-primary bg-primary/5"
                      : "border border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {qtd}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">Banheiros</label>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5+"].map((qtd) => (
                <button
                  key={qtd}
                  type="button"
                  onClick={() => onFilterChange("banheiros", filters.banheiros === qtd ? "" : qtd)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.banheiros === qtd
                      ? "border-2 border-primary text-primary bg-primary/5"
                      : "border border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {qtd}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm text-gray-700 mb-2">Vagas de Garagem</label>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4", "5+"].map((qtd) => (
                <button
                  key={qtd}
                  type="button"
                  onClick={() => onFilterChange("vagas", filters.vagas === qtd ? "" : qtd)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filters.vagas === qtd
                      ? "border-2 border-primary text-primary bg-primary/5"
                      : "border border-gray-300 text-gray-700 hover:border-gray-400 bg-white"
                  }`}
                >
                  {qtd}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Faixa de Preço (R$)</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço Mínimo</label>
            <input
              type="text"
              value={precoMinDisplay}
              onChange={(e) => handlePrecoMinChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="R$ 100.000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço Máximo</label>
            <input
              type="text"
              value={precoMaxDisplay}
              onChange={(e) => handlePrecoMaxChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="R$ 1.000.000"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Área (m²)</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Área Mínima</label>
            <input
              type="number"
              value={filters.areaMin}
              onChange={(e) => onFilterChange("areaMin", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Área Máxima</label>
            <input
              type="number"
              value={filters.areaMax}
              onChange={(e) => onFilterChange("areaMax", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="Sem limite"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Ano de Construção</h4>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ano Mínimo</label>
            <input
              type="number"
              value={filters.anoMin}
              onChange={(e) => onFilterChange("anoMin", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="Ex: 2000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Ano Máximo</label>
            <input
              type="number"
              value={filters.anoMax}
              onChange={(e) => onFilterChange("anoMax", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="Ex: 2024"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Características</h4>
        <div className="space-y-2">
          {[
            "Piscina",
            "Academia", 
            "Salão de Festas",
            "Churrasqueira",
            "Quadra Poliesportiva",
            "Quadra de Tênis",
            "Sauna",
            "Espaço Gourmet"
          ].map((feature) => (
            <label key={feature} className="flex items-center space-x-2 cursor-pointer">
              <Checkbox 
                checked={filters.caracteristicas.includes(feature)}
                onCheckedChange={() => {
                  const newCaracteristicas = filters.caracteristicas.includes(feature)
                    ? filters.caracteristicas.filter(f => f !== feature)
                    : [...filters.caracteristicas, feature];
                  onFilterChange("caracteristicas", newCaracteristicas);
                }}
              />
              <span className="text-sm text-gray-700">{feature}</span>
            </label>
          ))}
          <button className="text-sm text-gray-700 hover:text-gray-900 transition-colors mt-2">
            Mostrar mais (21)
          </button>
        </div>
      </div>

      <Button variant="outline" onClick={onClearFilters} className="w-full">
        <X className="mr-2 h-4 w-4" />
        Limpar Filtros
      </Button>
    </div>
  );
} 