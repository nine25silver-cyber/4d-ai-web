'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchProvider, Providers, PROVIDER_LABELS, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore' | 'cambodia';

type ProviderCardState = {
  loading: boolean;
  error: string | null;
  result: ProviderResult | null;
};

// Provider Logo mapping - 这里定义Logo路径
const PROVIDER_LOGOS: Record<string, string> = {
  'magnum': '/logos/magnum.png',
  'sports_toto': '/logos/toto.png',
  'da_ma_cai': '/logos/damacai.png',
  'sabah': '/logos/sabah.png',
  'sarawak': '/logos/sarawak.png',
  'sandakan': '/logos/sandakan.png',
  'singapore': '/logos/singapore.png',
  'grand_dragon': '/logos/grand-dragon.png',
};

export default function ProviderDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<RegionTab>('west');

  const REGION_TABS: Array<{ key: RegionTab; label: string; providers: Provider[] }> = [
    { key: 'west', label: 'West Malaysia', providers: ['magnum', 'sports_toto', 'da_ma_cai'] },
    { key: 'east', label: 'East Malaysia', providers: ['sabah', 'sarawak', 'sandakan'] },
    { key: 'singapore', label: 'Singapore', providers: ['singapore'] },
    { key: 'cambodia', label: 'Cambodia', providers: ['grand_dragon'] },
  ];

  const [providerStates, setProviderStates] = useState<Record<Provider, ProviderCardState>>(
    Object.fromEntries(
      Providers.map((p) => [p, { loading: false, error: null, result: null }])
    ) as Record<Provider, ProviderCardState>
  );

  const currentProviders = useMemo(
    () => REGION_TABS.find((tab) => tab.key === selectedRegion)?.providers || [],
    [selectedRegion]
  );

  useEffect(() => {
    currentProviders.forEach((provider) => {
      setProviderStates((prev) => ({ ...prev, [provider]: { ...prev[provider], loading: true, error: null } }));
      fetchProvider(provider)
        .then((result) => {
          setProviderStates((prev) => ({ ...prev, [provider]: { loading: false, error: null, result } }));
        })
        .catch((err) => {
          setProviderStates((prev) => ({ ...prev, [provider]: { loading: false, error: err.message, result: null } }));
        });
    });
  }, [currentProviders]);

  return (
    <div>
      {/* Region Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {REGION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedRegion(tab.key)}
            className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${
              selectedRegion === tab.key
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Provider Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProviders.map((provider) => {
          const state = providerStates[provider];
          const logoSrc = PROVIDER_LOGOS[provider];
          
          return (
            <div key={provider} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              {/* Provider Header with Logo */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {logoSrc ? (
                    <img 
                      src={logoSrc} 
                      alt={PROVIDER_LABELS[provider]}
                      className="h-12 w-12 object-contain"
                      onError={(e) => {
                        // 如果图片加载失败，显示字母fallback
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <div className={`h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center ${logoSrc ? 'hidden' : ''}`}>
                    <span className="text-white font-bold text-lg">
                      {PROVIDER_LABELS[provider].charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{PROVIDER_LABELS[provider]}</h3>
                    {state.result && <p className="text-sm text-slate-500">{state.result.date}</p>}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setProviderStates((prev) => ({ ...prev, [provider]: { ...prev[provider], loading: true } }));
                    fetchProvider(provider)
                      .then((result) => setProviderStates((prev) => ({ ...prev, [provider]: { loading: false, error: null, result } })))
                      .catch((err) => setProviderStates((prev) => ({ ...prev, [provider]: { loading: false, error: err.message, result: null } })));
                  }}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                  disabled={state.loading}
                >
                  {state.loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>

              {/* Loading State */}
              {state.loading && (
                <div className="text-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}

              {/* Error State */}
              {state.error && (
                <div className="text-center py-8 text-red-500">
                  <p>Error: {state.error}</p>
                </div>
              )}

              {/* Results */}
              {state.result && !state.loading && (
                <div className="space-y-4">
                  {/* Draw Number */}
                  <div className="text-center pb-3 border-b">
                    <span className="text-sm text-slate-500">Draw #{state.result.drawNumber}</span>
                  </div>

                  {/* Numbers Grid */}
                  <div className="numbers-grid" style={{ '--mobile-cols': slotCols(state.result), '--desktop-cols': Math.min(slotCols(state.result), 5) } as React.CSSProperties}>
                    {state.result.numbers.map((n, idx) => (
                      <div key={`${state.result!.drawNumber}-${idx}`} className="number-chip">
                        <span className="slot-label">{state.result!.labels[idx] ?? ''}</span>
                        <span className="slot-number">{n}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function slotCols(result: ProviderResult): number {
  return result.numbers.length;
}
