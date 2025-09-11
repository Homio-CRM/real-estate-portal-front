import { Skeleton } from "./ui/skeleton";

export default function CondominiumDetailSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="pt-24 pb-28 md:pb-0">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-5 w-4" />
            <Skeleton className="h-5 w-16" />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative h-64 sm:h-80 md:h-96">
              <Skeleton className="w-full h-full" />
            </div>

            <div className="p-6">
              <div className="flex gap-3 mb-4 flex-wrap">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>

              <Skeleton className="h-4 w-full mb-4" />

              <div className="flex flex-col sm:flex-row items-start gap-2 sm:gap-4 mb-6">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-3/4" />
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 mb-6">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-12 w-32" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-3 text-gray-700">
                          <Skeleton className="w-6 h-6 rounded" />
                          <div>
                            <Skeleton className="h-5 w-20 mb-1" />
                            <Skeleton className="h-3 w-12" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {Array.from({ length: 6 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Skeleton className="h-4 w-4" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <Skeleton className="h-6 w-24 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-3/4 mb-1" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <Skeleton className="h-6 w-32 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-24 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-6 w-36" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <Skeleton className="h-6 w-80 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex flex-col lg:flex-row">
                      <div className="w-full lg:w-80 h-48 sm:h-56 lg:h-64 relative">
                        <Skeleton className="w-full h-full" />
                      </div>
                      
                      <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                        <div>
                          <div className="mb-2">
                            <Skeleton className="h-4 w-48 mb-1" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                          
                          <Skeleton className="h-4 w-full mb-1" />
                          <Skeleton className="h-4 w-3/4 mb-4" />
                          
                          <div className="flex flex-wrap gap-4 sm:gap-6 mb-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-8" />
                            <Skeleton className="h-4 w-8" />
                          </div>
                        </div>
                        
                        <div className="flex items-end justify-between gap-3 flex-wrap">
                          <div>
                            <Skeleton className="h-8 w-32 mb-1" />
                            <Skeleton className="h-3 w-24" />
                          </div>
                          
                          <Skeleton className="h-10 w-24" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white p-4 flex items-center justify-between gap-3">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="flex-1 h-12" />
      </div>
    </div>
  );
}
