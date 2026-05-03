'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProvider, normalizeProviderSlotDisplay, PROVIDERS, PROVIDER_LABELS, PROVIDER_META, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore' | 'cambodia';
type ProviderCardState = { loading: boolean; error: string | null; result: ProviderResult | null };
type SlotCell = { slotLabel: string; number: string };

const PROVIDER_ACCENTS: Record<Provider, string> = { magnum:'border-t-red-500',sports_toto:'border-t-blue-500',da_ma_cai:'border-t-yellow-500',sabah88:'border-t-emerald-500',sarawak:'border-t-orange-500',sandakan:'border-t-cyan-500',grand_dragon:'border-t-rose-500',nine_lotto:'border-t-purple-500',singapore:'border-t-indigo-500' };

const formatUpdatedTime = (value?: string) => !value ? null : (Number.isNaN(new Date(value).getTime()) ? value : new Date(value).toLocaleString());

function SlotGrid({ cells }: { cells: SlotCell[] }) {
  return <div className="slot-grid">{cells.map((cell, i) => <SlotGridCell key={`${cell.slotLabel}-${i}`} cell={cell} />)}</div>;
}

function SlotGridCell({ cell }: { cell: SlotCell }) {
  return <div className="slot-cell"><span className="slot-label">{cell.slotLabel}</span><span className="slot-number">{cell.number}</span></div>;
}

export default function ProviderDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<RegionTab>('west');
  const [hiddenLogos, setHiddenLogos] = useState<Record<Provider, boolean>>({} as Record<Provider, boolean>);
  const REGION_TABS: Array<{ key: RegionTab; label: string; providers: Provider[] }> = [{ key:'west', label:'West Malaysia', providers:['magnum','sports_toto','da_ma_cai'] }, { key:'east', label:'East Malaysia', providers:['sabah88','sarawak','sandakan'] }, { key:'singapore', label:'Singapore', providers:['singapore'] }, { key:'cambodia', label:'Cambodia', providers:['grand_dragon','nine_lotto'] }];
  const [providerStates, setProviderStates] = useState<Record<Provider, ProviderCardState>>(Object.fromEntries(PROVIDERS.map((p) => [p, { loading:false, error:null, result:null }])) as Record<Provider, ProviderCardState>);
  const currentProviders = useMemo(() => REGION_TABS.find((tab) => tab.key === selectedRegion)?.providers || [], [selectedRegion]);

  useEffect(() => { currentProviders.forEach((provider) => { setProviderStates((prev) => ({ ...prev, [provider]: { ...prev[provider], loading: true, error: null } })); fetchProvider(provider).then((result) => setProviderStates((prev) => ({ ...prev, [provider]: { loading:false, error:null, result } }))).catch((err) => setProviderStates((prev) => ({ ...prev, [provider]: { loading:false, error:err.message, result:null } }))); }); }, [currentProviders]);

  return <div><div className="flex gap-2 mb-6 overflow-x-auto">{REGION_TABS.map((tab) => <button key={tab.key} onClick={() => setSelectedRegion(tab.key)} className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${selectedRegion === tab.key ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>{tab.label}</button>)}</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{currentProviders.map((provider) => { const state = providerStates[provider]; const logoSrc = PROVIDER_META[provider]?.logo; const showImage = Boolean(logoSrc) && !hiddenLogos[provider]; const display = state.result?.slot_display ?? (state.result ? normalizeProviderSlotDisplay(provider, state.result) : null); return <div key={provider} className={`bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition border border-slate-200 border-t-4 ${PROVIDER_ACCENTS[provider]}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 min-w-0"><div className="provider-logo-box h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{showImage ? <img src={logoSrc} alt={`${PROVIDER_LABELS[provider]} logo`} className="provider-logo-img" onError={() => setHiddenLogos((prev) => ({ ...prev, [provider]: true }))} /> : <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-lg">{PROVIDER_LABELS[provider].charAt(0)}</span></div>}</div><div className="min-w-0"><h3 className="font-bold text-lg text-slate-900 truncate">{PROVIDER_LABELS[provider]}</h3>{state.result?.draw_date && <p className="text-sm text-slate-500">{state.result.draw_date}</p>}</div></div></div>{state.loading && <div className="text-center py-8 text-slate-500">Loading...</div>}{state.error && <div className="text-center py-8 text-red-500">Error: {state.error}</div>}{state.result && !state.loading && display && <div className="space-y-4"><div className="text-center pb-3 border-b space-y-2"><p className="text-sm text-slate-500">Draw #{state.result.draw_number ?? '-'}</p><div className="top3-grid">{display.top3Cells.map((item) => <div key={item.prizeLabel} className="top3-cell"><span className="top3-label">{item.prizeLabel}</span>{item.slotLabel && <span className="top3-slot">{item.slotLabel}</span>}<span className="top3-number">{item.number}</span></div>)}</div></div><div><p className="text-sm font-semibold text-slate-700 mb-2">Special Numbers</p><SlotGrid cells={display.specialCells} /></div><div><p className="text-sm font-semibold text-slate-700 mb-2">Consolation Numbers</p><SlotGrid cells={display.consolationCells} /></div><div className="pt-2 border-t text-sm text-slate-500 space-y-1"><p>Phase: {state.result.phase ?? '-'}</p><p>Status: {state.result.status ?? '-'}</p>{formatUpdatedTime(state.result.last_refreshed) && <p>Updated: {formatUpdatedTime(state.result.last_refreshed)}</p>}</div></div>}</div>; })}</div></div>;
}

