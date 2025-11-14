import { Skeleton } from "./ui/skeleton";

export default function ResultsFiltersSkeleton() {
  return (
    <div className="space-y-4 w-96">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Skeleton className="h-4 w-40 mb-3" />
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-3">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-12" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-12" />
              ))}
            </div>
          </div>
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-12" />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-3">
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <Skeleton className="h-4 w-32 mb-3" />
        <div className="space-y-3">
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-1" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>

      <Skeleton className="h-10 w-full" />
    </div>
  );
}

