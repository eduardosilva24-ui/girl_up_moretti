export function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-aura-100/80 ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-[1.75rem] border border-aura-100 bg-white p-4 shadow-card">
      <Skeleton className="aspect-[16/10] w-full" />
      <Skeleton className="mt-5 h-5 w-3/4" />
      <Skeleton className="mt-3 h-4 w-full" />
      <Skeleton className="mt-2 h-4 w-5/6" />
      <Skeleton className="mt-5 h-3 w-full rounded-full" />
    </div>
  );
}
