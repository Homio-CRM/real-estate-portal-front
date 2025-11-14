"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { X } from "lucide-react";
import Header from "../components/Header";
import ContactForm from "../components/ContactForm";
import Footer from "../components/Footer";
import HeroSearchBar from "../components/HeroSearchBar";
import { buildLaunchesUrl, buildListingsUrl } from "../lib/navigation";
import { PropertyCard, CondominiumCard } from "../types/listings";
import { Filters } from "../lib/filters";

type FeaturedCacheEntry = {
  saleProperties: PropertyCard[];
  rentProperties: PropertyCard[];
  cityNames: Record<number, string>;
  cityId: number;
  activeTab: "comprar" | "alugar";
  timestamp: number;
};

type CondominiumsCacheEntry = {
  condominiums: CondominiumCard[];
  cityId?: number;
  timestamp: number;
};

type HomePageCache = {
  filters: Filters;
  featured?: FeaturedCacheEntry;
  condominiums?: CondominiumsCacheEntry;
};

type OwnerLeadOrigin = "owner-hero" | "owner-footer";

const DEFAULT_CITY_ID = 3205309;

const DEFAULT_FILTERS: Filters = {
  tipo: "",
  localizacao: "",
  operacao: "comprar",
  bairro: "",
};

const CACHE_TTL_MS = 5 * 60 * 1000;

let homePageCache: HomePageCache | null = null;

const cloneFilters = (filters: Filters): Filters => ({
  tipo: Array.isArray(filters.tipo) ? [...filters.tipo] : filters.tipo,
  localizacao: filters.localizacao,
  operacao: filters.operacao,
  ...(filters.bairro !== undefined ? { bairro: filters.bairro } : {}),
});

const ensureHomePageCache = (): HomePageCache => {
  if (!homePageCache) {
    homePageCache = {
      filters: cloneFilters(DEFAULT_FILTERS),
    };
  }

  return homePageCache;
};

const FeaturedProperties = dynamic(() => import("../components/FeaturedProperties"), {
  loading: () => <div className="min-h-[400px]" />,
});

const FeaturedCondominiums = dynamic(() => import("../components/FeaturedCondominiums"), {
  loading: () => <div className="min-h-[400px]" />,
});

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const cache = ensureHomePageCache();
  const [filters, setFilters] = useState<Filters>(() => cloneFilters(cache.filters));
  const [showOwnerContactModal, setShowOwnerContactModal] = useState(false);
  const [ownerLeadOrigin, setOwnerLeadOrigin] = useState<OwnerLeadOrigin | null>(null);

  useEffect(() => {
    const cacheRef = ensureHomePageCache();
    cacheRef.filters = cloneFilters(filters);
  }, [filters]);

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => {
      if (!(key in prev)) {
        return prev;
      }

      const typedKey = key as keyof Filters;
      return { ...prev, [typedKey]: value };
    });
  }, []);

  const handleSearch = useCallback(() => {
    const urlBuilder =
      filters.operacao === "lancamento" ? buildLaunchesUrl : buildListingsUrl;
    router.push(urlBuilder(filters as unknown as Record<string, string | string[]>));
  }, [filters, router]);

  const now = Date.now();
  const featuredCache = cache.featured;
  const shouldRevalidateFeatured =
    !featuredCache || now - featuredCache.timestamp > CACHE_TTL_MS;
  const condominiumsCache = cache.condominiums;
  const shouldRevalidateCondominiums =
    !condominiumsCache || now - condominiumsCache.timestamp > CACHE_TTL_MS;

  const handleFeaturedDataLoaded = useCallback((data: FeaturedCacheEntry) => {
    const cacheRef = ensureHomePageCache();
    cacheRef.featured = {
      saleProperties: data.saleProperties,
      rentProperties: data.rentProperties,
      cityNames: data.cityNames,
      cityId: data.cityId,
      activeTab: data.activeTab,
      timestamp: data.timestamp,
    };
  }, []);

  const handleFeaturedActiveTabChange = useCallback((tab: "comprar" | "alugar") => {
    const cacheRef = ensureHomePageCache();

    if (cacheRef.featured) {
      cacheRef.featured = {
        ...cacheRef.featured,
        activeTab: tab,
      };
    } else {
      cacheRef.featured = {
        saleProperties: [],
        rentProperties: [],
        cityNames: {},
        cityId: DEFAULT_CITY_ID,
        activeTab: tab,
        timestamp: Date.now(),
      };
    }
  }, []);

  const handleCondominiumsLoaded = useCallback(
    (data: { condominiums: CondominiumCard[]; cityId?: number; timestamp: number }) => {
      const cacheRef = ensureHomePageCache();
      cacheRef.condominiums = {
        condominiums: data.condominiums,
        cityId: data.cityId,
        timestamp: data.timestamp,
      };
    },
    []
  );

  const handleOwnerLeadRequest = useCallback((origin: OwnerLeadOrigin) => {
    setOwnerLeadOrigin(origin);
    setShowOwnerContactModal(true);
  }, []);

  const handleCloseOwnerLead = useCallback(() => {
    setShowOwnerContactModal(false);
    setOwnerLeadOrigin(null);
  }, []);

  useEffect(() => {
    const param =
      searchParams.get("owner-lead") ?? searchParams.get("ownerLead");
    if (!param) {
      return;
    }

    const origin: OwnerLeadOrigin =
      param === "hero" ? "owner-hero" : "owner-footer";

    handleOwnerLeadRequest(origin);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("owner-lead");
    params.delete("ownerLead");

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [handleOwnerLeadRequest, pathname, router, searchParams]);

  const featuredInitialSaleProperties = featuredCache?.saleProperties;
  const featuredInitialRentProperties = featuredCache?.rentProperties;
  const featuredInitialCityNames = featuredCache?.cityNames;
  const featuredInitialActiveTab = featuredCache?.activeTab;
  const featuredCityId = featuredCache?.cityId;

  const condominiumsInitialData = condominiumsCache?.condominiums;
  const condominiumsCityId = condominiumsCache?.cityId;

  return (
    <>
      <div className="min-h-screen relative">
        <div className="absolute inset-0">
          <Image
            src="/Vitoria_nx171007000006.jpg"
            alt="Vitória"
            fill
            priority
            className="object-cover"
            quality={85}
          />
          <div className="absolute inset-0 bg-black/60"></div>
        </div>
        
        <Header />
        
        <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-4 py-8">
          <div className="text-center mb-8 md:mb-12">
            <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-8xl font-extrabold text-white mb-3 md:mb-4 leading-none">
              Para você morar bem
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-2">
              Compre ou alugue com agilidade, segurança e sem burocracia
            </p>
          </div>
          
          <div className="w-full max-w-6xl">
            <HeroSearchBar
              filters={filters}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
            />
          </div>
          
          <div className="mt-6 md:mt-8 text-center">
            <a
              href="#"
              className="text-white underline text-sm sm:text-base md:text-lg hover:text-white/80 transition-colors"
              onClick={(event) => {
                event.preventDefault();
                handleOwnerLeadRequest("owner-hero");
              }}
            >
              Anuncie seu imóvel conosco
            </a>
          </div>
        </div>
      </div>
      
      <FeaturedProperties
        cityId={featuredCityId}
        initialSaleProperties={featuredInitialSaleProperties}
        initialRentProperties={featuredInitialRentProperties}
        initialCityNames={featuredInitialCityNames}
        initialActiveTab={featuredInitialActiveTab}
        shouldRevalidate={shouldRevalidateFeatured}
        onDataLoaded={handleFeaturedDataLoaded}
        onActiveTabChange={handleFeaturedActiveTabChange}
      />
      
      <FeaturedCondominiums
        cityId={condominiumsCityId}
        initialCondominiums={condominiumsInitialData}
        shouldRevalidate={shouldRevalidateCondominiums}
        onDataLoaded={handleCondominiumsLoaded}
      />
      
      <Footer onOwnerLeadClick={() => handleOwnerLeadRequest("owner-footer")} />

      {showOwnerContactModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={handleCloseOwnerLead}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Cadastre seu imóvel</h2>
              <button
                type="button"
                onClick={handleCloseOwnerLead}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            <ContactForm dealType="sale" leadOrigin={ownerLeadOrigin ?? "owner"} />
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}
