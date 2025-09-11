import { Skeleton } from "./ui/skeleton";

export default function FeaturedPropertiesSkeleton() {
  return (
    <section className="py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-80 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>

        {/* Abas */}
        <div className="flex justify-center mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <Skeleton className="h-10 w-24 rounded-md" />
            <Skeleton className="h-10 w-24 rounded-md" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {/* Header / Slider */}
              <div className="relative h-56 md:h-60 bg-gray-200">
                <Skeleton className="w-full h-full" />
              </div>

              {/* Conteúdo */}
              <div className="p-4 flex flex-col min-h-[200px]">
                <div className="flex-1">
                  <Skeleton className="h-5 w-full mb-1" />
                  <Skeleton className="h-4 w-3/4 mb-3" />

                  <div className="flex items-center gap-4 mb-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-18" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <div>
                    <Skeleton className="h-6 w-32 mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
