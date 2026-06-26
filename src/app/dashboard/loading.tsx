export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-8 w-48 rounded-lg bg-white/5" />
        <div className="h-4 w-64 rounded bg-white/[0.03] mt-2" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="aspect-[3/4] rounded-2xl bg-white/[0.03] border border-white/[0.04]"
          />
        ))}
      </div>
    </div>
  );
}
