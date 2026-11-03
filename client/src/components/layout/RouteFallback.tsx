import { Skeleton } from '@/components/ui/Skeleton';

export function RouteFallback() {
  return (
    <div className="container-page py-14" aria-busy="true" aria-label="Loading page">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-10 w-2/3 max-w-lg" />
      <Skeleton className="mt-4 h-4 w-full max-w-xl" />
      <Skeleton className="mt-2 h-4 w-3/4 max-w-md" />
      <div className="mt-9 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((item) => (
          <Skeleton key={item} className="h-40 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
