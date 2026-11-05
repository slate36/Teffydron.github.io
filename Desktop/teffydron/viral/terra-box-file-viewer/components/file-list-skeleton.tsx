export function FileListSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="Cargando archivos">
      <div className="h-9 w-full max-w-sm animate-pulse rounded-md bg-background" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="aspect-[4/5] animate-pulse rounded-xl bg-background" />
        ))}
      </div>
    </div>
  )
}
