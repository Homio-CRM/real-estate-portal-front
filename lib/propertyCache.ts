import { PropertyCard } from "../types/listings";
import { Location } from "./locationUtils";
import { searchPropertiesInCascade } from "./cascadeSearch";

class PropertyCache {
  private cache: Map<string, PropertyCard[]> = new Map();
  private loading: boolean = false;
  private lastLocation: Location | null = null;

  async preloadProperties(
    location: Location, 
    transactionType: "sale" | "rent" | "all" = "sale",
    propertyType?: "Casa" | "Apartamento"
  ): Promise<void> {
    if (this.loading) return;
    
    const cacheKey = `${location.lat}-${location.lng}-${transactionType}-${propertyType || 'all'}`;
    
    // Se já temos cache para esta combinação, não carregar novamente
    if (this.cache.has(cacheKey)) {
      return;
    }

    this.loading = true;
    this.lastLocation = location;

    try {
      const result = await searchPropertiesInCascade(location, 3, transactionType, propertyType);
      this.cache.set(cacheKey, result.properties);
    } catch (error) {
      console.error("❌ Erro ao pré-carregar imóveis:", error);
      this.cache.set(cacheKey, []);
    } finally {
      this.loading = false;
    }
  }

  getProperties(
    location: Location, 
    transactionType: "sale" | "rent" | "all" = "sale",
    propertyType?: "Casa" | "Apartamento"
  ): PropertyCard[] {
    const cacheKey = `${location.lat}-${location.lng}-${transactionType}-${propertyType || 'all'}`;
    const properties = this.cache.get(cacheKey) || [];
    return properties;
  }

  isLoaded(
    location: Location, 
    transactionType: "sale" | "rent" | "all" = "sale",
    propertyType?: "Casa" | "Apartamento"
  ): boolean {
    const cacheKey = `${location.lat}-${location.lng}-${transactionType}-${propertyType || 'all'}`;
    return this.cache.has(cacheKey);
  }

  clear(): void {
    this.cache.clear();
    this.loading = false;
    this.lastLocation = null;
  }
}

export const propertyCache = new PropertyCache();