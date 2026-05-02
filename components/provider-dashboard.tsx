'use client';

import { useEffect, useState } from 'react';
import { fetchProvider, PROVIDERS, type Provider, type ProviderResult } from '@/lib/providers';

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="item">
      <div className="label">{label}</div>
      <div className="value">{value ?? '-'}</div>
    </div>
  );
}

export default function ProviderDashboard() {
  const [provider, setProvider] = useState<Provider>('magnum');
  const [result, setResult] = useState<ProviderResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProvider = async (current: Provider) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProvider(current);
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProvider(provider);
  }, [provider]);

  const isEmpty = !loading && !error && result && !result.draw_date && !result.draw_number;

  return (
    <section className="panel">
      <div className="tabs">
        {PROVIDERS.map((name) => (
          <button
            key={name}
            className={provider === name ? 'active' : ''}
            onClick={() => setProvider(name)}
            disabled={loading && provider === name}
          >
            {name}
          </button>
        ))}
        <button onClick={() => void loadProvider(provider)} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <p>Loading latest result...</p>}
      {error && <p>Failed to load result: {error}</p>}
      {isEmpty && <p>No latest result available for this provider.</p>}

      {!loading && !error && result && !isEmpty && (
        <div className="grid">
          <Row label="Draw Date" value={result.draw_date} />
          <Row label="Draw Number" value={result.draw_number} />
          <Row label="1st Prize" value={result.first_prize} />
          <Row label="2nd Prize" value={result.second_prize} />
          <Row label="3rd Prize" value={result.third_prize} />
          <Row label="Phase / Status" value={[result.phase, result.status].filter(Boolean).join(' / ') || '-'} />
          <div className="item" style={{ gridColumn: '1 / -1' }}>
            <div className="label">Special Numbers</div>
            <ul className="list">{(result.special_numbers ?? []).map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
          <div className="item" style={{ gridColumn: '1 / -1' }}>
            <div className="label">Consolation Numbers</div>
            <ul className="list">{(result.consolation_numbers ?? []).map((n) => <li key={n}>{n}</li>)}</ul>
          </div>
        </div>
      )}
    </section>
  );
}
