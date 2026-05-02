'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProvider, PROVIDERS, PROVIDER_LABELS, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore' | 'cambodia';

type ProviderCardState = {
  loading: boolean;
  error: string | null;
  result: ProviderResult | null;
};

const REGION_TABS: Array<{ key: RegionTab; label: string; providers: Provider[] }> = [
  { key: 'west', label: 'West Malaysia', providers: ['magnum', 'sports_toto', 'da_ma_cai'] },
  { key: 'east', label: 'East Malaysia', providers: ['sabah88', 'sarawak', 'sandakan'] },
  { key: 'singapore', label: 'Singapore', providers: ['singapore'] },
  { key: 'cambodia', label: 'Cambodia', providers: ['grand_dragon', 'nine_lotto'] },
];

const PROVIDER_META: Record<Provider, { accent: string; badgeText: string; badgeBackground: string; specialSlots: number }> = {
  magnum: { accent: '#dc2626', badgeText: 'Ma', badgeBackground: 'linear-gradient(135deg, #111827, #f59e0b)', specialSlots: 13 },
  sports_toto: { accent: '#1d4ed8', badgeText: 'ST', badgeBackground: 'linear-gradient(135deg, #1f2937, #2563eb)', specialSlots: 13 },
  da_ma_cai: { accent: '#2563eb', badgeText: 'DMC', badgeBackground: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', specialSlots: 10 },
  grand_dragon: { accent: '#dc2626', badgeText: 'GD', badgeBackground: 'linear-gradient(135deg, #b91c1c, #ca8a04)', specialSlots: 13 },
  nine_lotto: { accent: '#7e22ce', badgeText: 'NL', badgeBackground: 'linear-gradient(135deg, #7e22ce, #ca8a04)', specialSlots: 13 },
  sabah88: { accent: '#ea580c', badgeText: 'S88', badgeBackground: 'linear-gradient(135deg, #9a3412, #f97316)', specialSlots: 13 },
  sarawak: { accent: '#065f46', badgeText: 'SWK', badgeBackground: 'linear-gradient(135deg, #14532d, #047857)', specialSlots: 13 },
  sandakan: { accent: '#0284c7', badgeText: 'SDK', badgeBackground: 'linear-gradient(135deg, #155e75, #0ea5e9)', specialSlots: 13 },
  singapore: { accent: '#be123c', badgeText: 'SG', badgeBackground: 'linear-gradient(135deg, #881337, #e11d48)', specialSlots: 10 },
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

function NumberGrid({ title, values, labels, mobileCols = 5 }: { title: string; values: string[]; labels: string[]; mobileCols?: number }) {
  return (
    <div className="numbers-section">
      <div className="section-title">{title}</div>
      <div className="numbers-grid" style={{ ['--mobile-cols' as string]: String(mobileCols) }}>
        {values.map((n, idx) => (
          <div key={`${labels[idx] ?? idx}-${idx}`} className="number-chip">
            <span className="slot-label">{labels[idx] ?? ''}</span>
            <span className="slot-number">{n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function slotLabels(startCharCode: number, count: number): string[] {
  return Array.from({ length: count }, (_, i) => String.fromCharCode(startCharCode + i));
}

function normalizeSlotCells(values: string[] | undefined, slotCount: number): string[] {
  return Array.from({ length: slotCount }, (_, idx) => {
    const value = values?.[idx];
    return value && value.trim() ? value : '----';
  });
}

function getSpecialCells(result: ProviderResult | null | undefined, slotCount: number): string[] {
  if (!result) return normalizeSlotCells(undefined, slotCount);
  if (result.special_cells?.length) return normalizeSlotCells(result.special_cells, slotCount);
  return normalizeSlotCells(result.special_numbers, slotCount);
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
          const meta = PROVIDER_META[provider];
          const accent = meta.accent;
          const phaseStatus = [card?.result?.phase, card?.result?.status].filter(Boolean).join(' / ') || '-';
          const specialValues = getSpecialCells(card?.result, meta.specialSlots);
          const consolationValues = normalizeSlotCells(card?.result?.consolation_numbers, 10);

          return (
            <article key={provider} className="provider-card" style={{ borderTopColor: accent }}>
              <div className="provider-head">
                <div className="provider-badge" style={{ background: meta.badgeBackground }}>{meta.badgeText}</div>
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
                  <NumberGrid title="Special Numbers" values={specialValues} labels={slotLabels(65, meta.specialSlots)} mobileCols={5} />
                  <NumberGrid title="Consolation Numbers" values={consolationValues} labels={slotLabels(78, 10)} mobileCols={5} />
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
