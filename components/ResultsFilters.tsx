"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";
import { Plus, Search, X } from "lucide-react";

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
  onSearch: () => void;
};

export default function ResultsFilters({ filters, onFilterChange, onClearFilters, onSearch }: ResultsFiltersProps) {
  return (
    <div className="space-y-4 w-80">
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
              type="number"
              value={filters.precoMin}
              onChange={(e) => onFilterChange("precoMin", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">Preço Máximo</label>
            <input
              type="number"
              value={filters.precoMax}
              onChange={(e) => onFilterChange("precoMax", e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary text-sm"
              placeholder="Sem limite"
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

      <div className="flex gap-3">
        <Button variant="outline" onClick={onClearFilters} className="flex-1">
          <X className="mr-2 h-4 w-4" />
          Limpar
        </Button>
        <Button onClick={onSearch} className="flex-1">
          <Search className="mr-2 h-4 w-4" />
          Buscar Imóveis
        </Button>
      </div>
    </div>
  );
} 