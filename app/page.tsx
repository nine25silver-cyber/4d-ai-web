import ProviderDashboard from '@/components/provider-dashboard';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">4D</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">4D AI</h1>
              <p className="text-sm text-slate-600">Malaysia 4D Latest Results</p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <ProviderDashboard />
      </div>

      <footer className="mt-16 py-8 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <strong className="text-slate-900">4D AI</strong>
          <span className="mx-2">•</span>
          <span>Data source: Cloudflare JSON proxy</span>
        </div>
      </footer>
    </main>
  );
}
