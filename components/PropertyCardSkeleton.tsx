import { Skeleton } from "./ui/skeleton";

export default function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
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
  );
}
