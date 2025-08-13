export function translatePropertyType(propertyType: string): string {
  const key = (propertyType || "").toString().toLowerCase();
  const map: Record<string, string> = {
    apartment: "Apartamento",
    house: "Casa",
    condominium: "Condomínio",
    condo: "Condomínio",
    studio: "Kitnet",
    kitnet: "Kitnet",
    loft: "Loft",
    penthouse: "Cobertura",
    cobertura: "Cobertura",
    townhouse: "Casa Geminada",
    casa_geminada: "Casa Geminada",
    land: "Terreno",
    terreno: "Terreno",
    commercial: "Comercial",
    comercial: "Comercial",
    office: "Escritório",
    escritorio: "Escritório",
    store: "Loja",
    loja: "Loja",
    warehouse: "Galpão",
    galpao: "Galpão",
  };
  return map[key] || propertyType;
}

export function translatePropertyTypeToDB(propertyTypePt: string): string {
  const map: Record<string, string> = {
    Casa: "house",
    Apartamento: "apartment",
    Condomínio: "condominium",
    Kitnet: "studio",
    Loft: "loft",
    Cobertura: "penthouse",
    "Casa Geminada": "townhouse",
    Terreno: "land",
    Comercial: "commercial",
    Escritório: "office",
    Loja: "store",
    Galpão: "warehouse",
  };
  return map[propertyTypePt] || (propertyTypePt || "").toString().toLowerCase();
}


