import { Skeleton } from "./ui/skeleton";

export default function HorizontalPropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-80 h-64">
          <Skeleton className="h-full w-full" />
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <Skeleton className="h-7 w-3/4 mb-2" />
            
            <div className="mb-3">
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            <div className="flex gap-6 mb-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 sm:gap-4">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-8 w-40 mb-2" />
              <Skeleton className="h-3 w-32" />
            </div>
            
            <div className="flex gap-2 flex-shrink-0">
              <Skeleton className="h-10 w-28" />
              <Skeleton className="h-10 w-32 sm:w-40" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

