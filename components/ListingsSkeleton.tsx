import PropertyCardSkeleton from "./PropertyCardSkeleton";
import CondominiumCardSkeleton from "./CondominiumCardSkeleton";

interface ListingsSkeletonProps {
  isCondominium?: boolean;
  count?: number;
}

export default function ListingsSkeleton({ isCondominium = false, count = 6 }: ListingsSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        isCondominium ? (
          <CondominiumCardSkeleton key={index} />
        ) : (
          <PropertyCardSkeleton key={index} />
        )
      ))}
    </div>
  );
}
