'use client';

import { useEffect, useState } from 'react';
import { fetchProvider, PROVIDERS, PROVIDER_LABELS, type Provider, type ProviderResult } from '@/lib/providers';

function formatMalaysiaTime(timestamp?: string) {
  if (!timestamp) return 'Not available';

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return 'Not available';

  return new Intl.DateTimeFormat('en-MY', {
    timeZone: 'Asia/Kuala_Lumpur',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="item">
      <div className="label">{label}</div>
      <div className="value">{value ?? '-'}</div>
    </div>
  );
}

function NumberGrid({ title, values }: { title: string; values?: string[] }) {
  return (
    <div className="item numbers-section" style={{ gridColumn: '1 / -1' }}>
      <div className="label">{title}</div>
      <div className="numbers-grid">
        {(values ?? []).length ? (values ?? []).map((n, idx) => <div key={`${n}-${idx}`} className="number-chip">{n}</div>) : <div className="value">-</div>}
      </div>
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
            {PROVIDER_LABELS[name] ?? name}
          </button>
        ))}
        <button className="refresh-btn" onClick={() => void loadProvider(provider)} disabled={loading}>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {loading && <p>Loading latest result...</p>}
      {error && <p>Failed to load result: {error}</p>}
      {isEmpty && <p>No latest result available for this provider.</p>}

      {!loading && !error && result && !isEmpty && (
        <>
          <div className="top-prizes">
            <div className="prize-card">
              <div className="label">1st Prize</div>
              <div className="prize-number">{result.first_prize ?? '-'}</div>
            </div>
            <div className="prize-card">
              <div className="label">2nd Prize</div>
              <div className="prize-number">{result.second_prize ?? '-'}</div>
            </div>
            <div className="prize-card">
              <div className="label">3rd Prize</div>
              <div className="prize-number">{result.third_prize ?? '-'}</div>
            </div>
          </div>

          <div className="grid">
            <Row label="Provider" value={PROVIDER_LABELS[provider] ?? provider} />
            <Row label="Draw Date" value={result.draw_date} />
            <Row label="Draw Number" value={result.draw_number} />
            <Row label="Phase / Status" value={[result.phase, result.status].filter(Boolean).join(' / ') || '-'} />
            <Row label="Last Refreshed" value={formatMalaysiaTime(result.last_refreshed)} />
            <NumberGrid title="Special Numbers" values={result.special_numbers} />
            <NumberGrid title="Consolation Numbers" values={result.consolation_numbers} />
          </div>
        </>
      )}
    </section>
  );
}
