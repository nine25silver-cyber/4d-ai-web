'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProvider, PROVIDERS, PROVIDER_LABELS, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore';

type ProviderCardState = {
  loading: boolean;
  error: string | null;
  result: ProviderResult | null;
};

const REGION_TABS: Array<{ key: RegionTab; label: string; providers: Provider[] }> = [
  { key: 'west', label: 'West Malaysia', providers: ['magnum', 'sports_toto', 'da_ma_cai', 'grand_dragon', 'nine_lotto'] },
  { key: 'east', label: 'East Malaysia', providers: ['sabah88', 'sarawak', 'sandakan'] },
  { key: 'singapore', label: 'Singapore', providers: ['singapore'] },
];

const PROVIDER_ACCENTS: Record<Provider, string> = {
  magnum: '#dc2626',
  sports_toto: '#1d4ed8',
  da_ma_cai: '#f59e0b',
  grand_dragon: '#9333ea',
  nine_lotto: '#0f766e',
  sabah88: '#ea580c',
  sarawak: '#065f46',
  sandakan: '#0ea5e9',
  singapore: '#be123c',
};

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

function NumberGrid({ title, values, mobileCols = 5 }: { title: string; values?: string[]; mobileCols?: number }) {
  return (
    <div className="numbers-section">
      <div className="section-title">{title}</div>
      <div className="numbers-grid" style={{ ['--mobile-cols' as string]: String(mobileCols) }}>
        {(values ?? []).length ? (values ?? []).map((n, idx) => <div key={`${n}-${idx}`} className="number-chip">{n}</div>) : <div className="value">-</div>}
      </div>
    </div>
  );
}

function getSpecialCells(result: ProviderResult | null | undefined): string[] {
  if (!result) return [];
  if (result.special_cells?.length) return result.special_cells;
  return result.special_numbers ?? [];
}

export default function ProviderDashboard() {
  const [activeRegion, setActiveRegion] = useState<RegionTab>('west');
  const [cards, setCards] = useState<Record<Provider, ProviderCardState>>(() =>
    Object.fromEntries(PROVIDERS.map((provider) => [provider, { loading: true, error: null, result: null }])) as Record<Provider, ProviderCardState>,
  );

  const visibleProviders = useMemo(
    () => REGION_TABS.find((tab) => tab.key === activeRegion)?.providers ?? [],
    [activeRegion],
  );

  const refreshProviders = async (providers: Provider[]) => {
    setCards((prev) => {
      const next = { ...prev };
      providers.forEach((provider) => {
        next[provider] = { ...prev[provider], loading: true, error: null };
      });
      return next;
    });

    const results = await Promise.allSettled(providers.map(async (provider) => ({ provider, data: await fetchProvider(provider) })));

    setCards((prev) => {
      const next = { ...prev };
      results.forEach((result, idx) => {
        const provider = providers[idx];
        if (result.status === 'fulfilled') {
          next[provider] = { loading: false, error: null, result: result.value.data };
        } else {
          next[provider] = { loading: false, error: result.reason instanceof Error ? result.reason.message : 'Unknown error', result: null };
        }
      });
      return next;
    });
  };

  useEffect(() => {
    void refreshProviders(PROVIDERS as unknown as Provider[]);
  }, []);

  const anyLoading = visibleProviders.some((provider) => cards[provider]?.loading);

  return (
    <section className="panel">
      <div className="region-tabs">
        {REGION_TABS.map((tab) => (
          <button key={tab.key} className={activeRegion === tab.key ? 'active' : ''} onClick={() => setActiveRegion(tab.key)}>
            {tab.label}
          </button>
        ))}
        <button className="refresh-btn" onClick={() => void refreshProviders(visibleProviders)} disabled={anyLoading}>
          {anyLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="cards-grid">
        {visibleProviders.map((provider) => {
          const card = cards[provider];
          const accent = PROVIDER_ACCENTS[provider];
          const phaseStatus = [card?.result?.phase, card?.result?.status].filter(Boolean).join(' / ') || '-';
          const specialValues = getSpecialCells(card?.result);

          return (
            <article key={provider} className="provider-card" style={{ borderTopColor: accent }}>
              <div className="provider-head">
                <div className="provider-badge" style={{ backgroundColor: accent }}>{(PROVIDER_LABELS[provider] ?? provider).slice(0, 2)}</div>
                <div>
                  <h3>{PROVIDER_LABELS[provider] ?? provider}</h3>
                  <p>Draw Date: {card?.result?.draw_date ?? '-'}</p>
                  <p>Draw No: {card?.result?.draw_number ?? '-'}</p>
                </div>
              </div>

              {card?.loading && <div className="card-message loading">Loading latest result...</div>}
              {card?.error && <div className="card-message error">Failed to load: {card.error}</div>}

              {!card?.loading && !card?.error && (
                <>
                  <div className="top-prizes">
                    <div className="prize-card"><span>1st Prize</span><strong>{card?.result?.first_prize ?? '-'}</strong></div>
                    <div className="prize-card"><span>2nd Prize</span><strong>{card?.result?.second_prize ?? '-'}</strong></div>
                    <div className="prize-card"><span>3rd Prize</span><strong>{card?.result?.third_prize ?? '-'}</strong></div>
                  </div>
                  <NumberGrid title="Special Numbers" values={specialValues} mobileCols={5} />
                  <NumberGrid title="Consolation Numbers" values={card?.result?.consolation_numbers} mobileCols={5} />
                  <div className="meta-row">
                    <span>Phase / Status: {phaseStatus}</span>
                    <span>Updated: {formatMalaysiaTime(card?.result?.last_refreshed)}</span>
                  </div>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
