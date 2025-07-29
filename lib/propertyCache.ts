import { PropertyCard } from "../types/listings";
import { Location } from "./locationUtils";
import { searchPropertiesInCascade } from "./cascadeSearch";

class PropertyCache {
  private cache: Map<string, PropertyCard[]> = new Map();
  private loading: boolean = false;
  private lastLocation: Location | null = null;

  async preloadProperties(location: Location): Promise<void> {
    if (this.loading) return;
    
    const cacheKey = `${location.lat}-${location.lng}`;
    
    // Se já temos cache para esta localização, não carregar novamente
    if (this.cache.has(cacheKey)) {
      console.log("📦 Usando cache existente para localização:", location);
      return;
    }

    console.log("🔄 Pré-carregando imóveis para localização:", location);
    this.loading = true;
    this.lastLocation = location;

    try {
      const result = await searchPropertiesInCascade(location, 3);
      this.cache.set(cacheKey, result.properties);
      console.log("✅ Imóveis pré-carregados:", result.properties.length);
    } catch (error) {
      console.error("❌ Erro ao pré-carregar imóveis:", error);
      this.cache.set(cacheKey, []);
    } finally {
      this.loading = false;
    }
  }

  getProperties(location: Location): PropertyCard[] {
    const cacheKey = `${location.lat}-${location.lng}`;
    const properties = this.cache.get(cacheKey) || [];
    console.log("📦 Retornando", properties.length, "imóveis do cache");
    return properties;
  }

  isLoaded(location: Location): boolean {
    const cacheKey = `${location.lat}-${location.lng}`;
    return this.cache.has(cacheKey);
  }

  clear(): void {
    this.cache.clear();
    this.loading = false;
    this.lastLocation = null;
  }
}

export const propertyCache = new PropertyCache();