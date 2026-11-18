import { cx } from '../../utils/format.js';

export function Skeleton({ className }) {
  return <div className={cx('skeleton', className)} aria-hidden="true" />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-sun-200/60 bg-white/60">
      <Skeleton className="aspect-[3/4] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="space-y-3">
        <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
        <div className="flex gap-3">
          {[0, 1, 2].map((index) => (
            <Skeleton key={index} className="h-20 w-16 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-48 rounded-full" />
        <Skeleton className="h-12 w-full rounded-full" />
      </div>
    </div>
  );
}

export function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1, 2].map((index) => (
        <div key={index} className="card-warm space-y-4 p-5">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <div className="flex gap-4">
            <Skeleton className="h-20 w-16 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((__, columnIndex) => (
            <Skeleton key={columnIndex} className="h-9 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
