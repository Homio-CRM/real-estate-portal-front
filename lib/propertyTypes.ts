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
    // DB enum values
    residential_apartment: "Apartamento",
    residential_home: "Casa",
    residential_condo: "Condomínio",
    residential_village_house: "Casa Geminada",
    residential_farm_ranch: "Casa",
    residential_penthouse: "Cobertura",
    residential_agricultural: "Terreno",
    residential_flat: "Apartamento",
    residential_kitnet: "Kitnet",
    residential_studio: "Kitnet",
    residential_land_lot: "Terreno",
    residential_sobrado: "Casa",
    commercial_consultorio: "Escritório",
    commercial_edificio_residencial: "Apartamento",
    commercial_industrial: "Comercial",
    commercial_garage: "Comercial",
    commercial_hotel: "Comercial",
    commercial_building: "Comercial",
    commercial_corporate_floor: "Comercial",
    commercial_land_lot: "Terreno",
    commercial_business: "Comercial",
    commercial_studio: "Kitnet",
    commercial_office: "Escritório",
    commercial_edificio_comercial: "Comercial",
  };
  return map[key] || propertyType;
}

export function translatePropertyTypeToDB(propertyTypePt: string): string {
  const map: Record<string, string> = {
    Casa: "residential_home",
    Apartamento: "residential_apartment",
    Condomínio: "residential_condo",
    Kitnet: "residential_kitnet",
    Loft: "loft",
    Cobertura: "residential_penthouse",
    "Casa Geminada": "residential_village_house",
    Terreno: "residential_land_lot",
    Comercial: "commercial",
    Escritório: "commercial_office",
    Loja: "commercial",
    Galpão: "commercial_industrial",
  };
  return map[propertyTypePt] || propertyTypePt;
}

export function translatePropertyTypeFromDB(propertyTypeDB: string): string {
  return translatePropertyType(propertyTypeDB);
}

export function getAllPropertyTypes(): Array<{ dbValue: string; displayValue: string }> {
  const allTypes = [
    { dbValue: "residential_apartment", displayValue: "Apartamento" },
    { dbValue: "residential_home", displayValue: "Casa" },
    { dbValue: "residential_condo", displayValue: "Condomínio" },
    { dbValue: "residential_village_house", displayValue: "Casa Geminada" },
    { dbValue: "residential_farm_ranch", displayValue: "Casa" },
    { dbValue: "residential_penthouse", displayValue: "Cobertura" },
    { dbValue: "residential_agricultural", displayValue: "Terreno" },
    { dbValue: "residential_flat", displayValue: "Apartamento" },
    { dbValue: "residential_kitnet", displayValue: "Kitnet" },
    { dbValue: "residential_studio", displayValue: "Kitnet" },
    { dbValue: "residential_land_lot", displayValue: "Terreno" },
    { dbValue: "residential_sobrado", displayValue: "Casa" },
    { dbValue: "commercial_consultorio", displayValue: "Escritório" },
    { dbValue: "commercial_edificio_residencial", displayValue: "Apartamento" },
    { dbValue: "commercial_industrial", displayValue: "Galpão" },
    { dbValue: "commercial_garage", displayValue: "Garagem" },
    { dbValue: "commercial_hotel", displayValue: "Hotel" },
    { dbValue: "commercial_building", displayValue: "Edifício Comercial" },
    { dbValue: "commercial_corporate_floor", displayValue: "Andar Corporativo" },
    { dbValue: "commercial_land_lot", displayValue: "Terreno Comercial" },
    { dbValue: "commercial_business", displayValue: "Comércio" },
    { dbValue: "commercial_studio", displayValue: "Kitnet" },
    { dbValue: "commercial_office", displayValue: "Escritório" },
    { dbValue: "commercial_edificio_comercial", displayValue: "Edifício Comercial" },
  ];

  const uniqueTypes = new Map<string, { dbValue: string; displayValue: string }>();
  allTypes.forEach(({ dbValue, displayValue }) => {
    if (!uniqueTypes.has(displayValue)) {
      uniqueTypes.set(displayValue, { dbValue, displayValue });
    }
  });

  return Array.from(uniqueTypes.values());
}

export function translatePropertyTypesToDB(propertyTypesPt: string[]): string[] {
  return propertyTypesPt.map(pt => translatePropertyTypeToDB(pt)).filter(Boolean);
}

export function getDBTypesForDisplayTypes(displayTypes: string[]): string[] {
  const allTypes = getAllPropertyTypes();
  const dbTypesSet = new Set<string>();
  
  displayTypes.forEach(displayType => {
    const translated = translatePropertyTypeToDB(displayType);
    if (translated && translated !== displayType) {
      dbTypesSet.add(translated);
    }
    
    allTypes.forEach(({ dbValue, displayValue }) => {
      if (displayValue === displayType) {
        dbTypesSet.add(dbValue);
      }
    });
  });
  
  return Array.from(dbTypesSet);
}


