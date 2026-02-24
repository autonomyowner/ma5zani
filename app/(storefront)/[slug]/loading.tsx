export default function StorefrontLoading() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Header skeleton */}
      <div className="h-20 flex items-center justify-between px-6">
        <div className="w-16 h-3 rounded bg-white/10 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-white/10 animate-pulse" />
        <div className="w-12 h-3 rounded bg-white/10 animate-pulse" />
      </div>
      {/* Hero skeleton */}
      <div className="w-full h-[60vh] bg-white/5 animate-pulse" />
      {/* Products grid skeleton */}
      <div className="max-w-[1600px] mx-auto px-6 py-16">
        <div className="w-32 h-3 rounded bg-white/10 animate-pulse mx-auto mb-4" />
        <div className="w-48 h-6 rounded bg-white/10 animate-pulse mx-auto mb-12" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i}>
              <div className="aspect-[3/4] rounded bg-white/5 animate-pulse mb-4" />
              <div className="w-3/4 h-3 rounded bg-white/10 animate-pulse mb-2" />
              <div className="w-1/2 h-3 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
