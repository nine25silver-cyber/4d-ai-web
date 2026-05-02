import ProviderDashboard from '@/components/provider-dashboard';

export default function HomePage() {
  return (
    <main>
      <header className="page-header">
        <h1>4D AI Results Dashboard</h1>
        <p>Latest 4D results from Cloudflare JSON feeds.</p>
      </header>
      <ProviderDashboard />
      <footer className="footer">
        <strong>4D AI</strong>
        <span>Data source: Cloudflare JSON feed proxy</span>
      </footer>
    </main>
  );
}
