import { Skeleton } from "./ui/skeleton";

export default function HorizontalCondominiumCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-80 h-64 relative">
          <Skeleton className="h-full w-full" />
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <Skeleton className="h-4 w-2/3" />
            </div>
            
            <Skeleton className="h-6 w-3/4 mb-2" />
            
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-4/5 mb-4" />
            
            <div className="flex gap-6 mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-48" />
          </div>
        </div>
      </div>
    </div>
  );
}

