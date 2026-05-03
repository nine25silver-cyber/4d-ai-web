'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProvider, PROVIDERS, PROVIDER_LABELS, PROVIDER_META, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore' | 'cambodia';

type ProviderCardState = {
  loading: boolean;
  error: string | null;
  result: ProviderResult | null;
};

const SPECIAL_LABELS = 'ABCDEFGHIJKLM'.split('');
const CONSOLATION_LABELS = 'NOPQRSTUVW'.split('');

function formatUpdatedTime(value?: string): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export default function ProviderDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<RegionTab>('west');
  const [hiddenLogos, setHiddenLogos] = useState<Record<Provider, boolean>>({} as Record<Provider, boolean>);

  const REGION_TABS: Array<{ key: RegionTab; label: string; providers: Provider[] }> = [
    { key: 'west', label: 'West Malaysia', providers: ['magnum', 'sports_toto', 'da_ma_cai'] },
    { key: 'east', label: 'East Malaysia', providers: ['sabah88', 'sarawak', 'sandakan'] },
    { key: 'singapore', label: 'Singapore', providers: ['singapore'] },
    { key: 'cambodia', label: 'Cambodia', providers: ['grand_dragon', 'nine_lotto'] },
  ];

  const [providerStates, setProviderStates] = useState<Record<Provider, ProviderCardState>>(
    Object.fromEntries(PROVIDERS.map((p) => [p, { loading: false, error: null, result: null }])) as Record<Provider, ProviderCardState>,
  );

  const currentProviders = useMemo(
    () => REGION_TABS.find((tab) => tab.key === selectedRegion)?.providers || [],
    [selectedRegion],
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
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {REGION_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedRegion(tab.key)}
            className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${
              selectedRegion === tab.key ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentProviders.map((provider) => {
          const state = providerStates[provider];
          const logoSrc = PROVIDER_META[provider]?.logo;
          const showImage = Boolean(logoSrc) && !hiddenLogos[provider];

          return (
            <div key={provider} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="provider-logo-box h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                    {showImage ? (
                      <img
                        src={logoSrc}
                        alt={`${PROVIDER_LABELS[provider]} logo`}
                        className="provider-logo-img"
                        onError={() => setHiddenLogos((prev) => ({ ...prev, [provider]: true }))}
                      />
                    ) : (
                      <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">{PROVIDER_LABELS[provider].charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-lg text-slate-900 truncate">{PROVIDER_LABELS[provider]}</h3>
                    {state.result?.draw_date && <p className="text-sm text-slate-500">{state.result.draw_date}</p>}
                  </div>
                </div>
              </div>

              {state.loading && <div className="text-center py-8 text-slate-500">Loading...</div>}
              {state.error && <div className="text-center py-8 text-red-500">Error: {state.error}</div>}

              {state.result && !state.loading && (
                <div className="space-y-4">
                  <div className="text-center pb-3 border-b space-y-1">
                    <p className="text-sm text-slate-500">Draw #{state.result.draw_number ?? '-'}</p>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                        <p className="text-xs text-slate-500">1st Prize</p>
                        <p className="text-lg font-bold text-amber-700">{state.result.first_prize ?? '-'}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 border border-slate-200 p-2">
                        <p className="text-xs text-slate-500">2nd Prize</p>
                        <p className="text-lg font-bold text-slate-700">{state.result.second_prize ?? '-'}</p>
                      </div>
                      <div className="rounded-lg bg-orange-50 border border-orange-200 p-2">
                        <p className="text-xs text-slate-500">3rd Prize</p>
                        <p className="text-lg font-bold text-orange-700">{state.result.third_prize ?? '-'}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Special Numbers</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(state.result.special_cells ?? state.result.special_numbers ?? []).map((num, idx) => (
                        <div key={`special-${provider}-${idx}`} className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 border border-slate-200">
                          <span className="text-xs font-semibold text-slate-500">{SPECIAL_LABELS[idx] ?? `${idx + 1}`}</span>
                          <span className="font-mono font-semibold text-slate-800">{num}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-2">Consolation Numbers</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(state.result.consolation_numbers ?? []).map((num, idx) => (
                        <div key={`consolation-${provider}-${idx}`} className="flex items-center justify-between rounded-md bg-slate-50 px-2 py-1.5 border border-slate-200">
                          <span className="text-xs font-semibold text-slate-500">{CONSOLATION_LABELS[idx] ?? `${idx + 1}`}</span>
                          <span className="font-mono font-semibold text-slate-800">{num}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t text-sm text-slate-500 space-y-1">
                    <p>Phase: {state.result.phase ?? '-'}</p>
                    <p>Status: {state.result.status ?? '-'}</p>
                    {formatUpdatedTime(state.result.last_refreshed) && <p>Updated: {formatUpdatedTime(state.result.last_refreshed)}</p>}
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
