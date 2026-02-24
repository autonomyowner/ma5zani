export default function ProductLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header skeleton */}
      <div className="h-20 flex items-center justify-between px-6">
        <div className="w-16 h-3 rounded bg-white/10 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="w-12 h-3 rounded bg-white/10 animate-pulse" />
      </div>
      {/* Product detail skeleton */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image */}
          <div className="aspect-square rounded-xl bg-white/5 animate-pulse" />
          {/* Info */}
          <div className="space-y-4 py-4">
            <div className="w-3/4 h-8 rounded bg-white/10 animate-pulse" />
            <div className="w-1/3 h-6 rounded bg-white/10 animate-pulse" />
            <div className="w-full h-20 rounded bg-white/5 animate-pulse mt-6" />
            <div className="w-full h-12 rounded-xl bg-white/10 animate-pulse mt-8" />
          </div>
        </div>
      </div>
    </div>
  );
}
