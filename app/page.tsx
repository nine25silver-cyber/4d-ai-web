import ProviderDashboard from '@/components/provider-dashboard';

export default function HomePage() {
  return (
    <main>
      <h1>4D AI Home Dashboard</h1>
      <p>Latest 4D results from Cloudflare JSON feeds.</p>
      <ProviderDashboard />
    </main>
  );
}
