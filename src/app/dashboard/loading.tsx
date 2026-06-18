import Skeleton from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-border/50 bg-card/50 p-5 space-y-3">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
        <Skeleton className="h-8 w-full rounded-lg" />
      </aside>
      <main className="flex-1 p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
          <Skeleton className="h-28 rounded-xl" />
        </div>
      </main>
    </div>
  );
}
