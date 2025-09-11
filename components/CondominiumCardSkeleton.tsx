import { Skeleton } from "./ui/skeleton";

export default function CondominiumCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-80 h-64 relative">
          <Skeleton className="w-full h-full" />
        </div>
        
        <div className="flex-1 p-6 flex flex-col justify-between">
          <div>
            <div className="mb-2">
              <Skeleton className="h-4 w-40 mb-1" />
              <Skeleton className="h-4 w-36" />
            </div>
            
            <Skeleton className="h-6 w-48 mb-2" />
            
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-4" />
            
            <div className="flex gap-6 mb-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      </div>
    </div>
  );
}
