'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProvider, PROVIDERS, PROVIDER_LABELS, PROVIDER_META, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore' | 'cambodia';

type ProviderCardState = { loading: boolean; error: string | null; result: ProviderResult | null };

const SPECIAL_LABELS = 'ABCDEFGHIJKLM'.split('');
const CONSOLATION_LABELS = 'NOPQRSTUVW'.split('');
const TEN_SLOT_SPECIAL_PROVIDERS: Provider[] = ['singapore', 'da_ma_cai', 'sarawak'];
const PROVIDER_ACCENTS: Record<Provider, string> = { magnum:'border-t-red-500',sports_toto:'border-t-blue-500',da_ma_cai:'border-t-yellow-500',sabah88:'border-t-emerald-500',sarawak:'border-t-orange-500',sandakan:'border-t-cyan-500',grand_dragon:'border-t-rose-500',nine_lotto:'border-t-purple-500',singapore:'border-t-indigo-500' };

const padSlots = (values: string[], count: number) => Array.from({ length: count }, (_, i) => values[i] ?? '----');
const normalizeNumber = (v: unknown) => (v === null || v === undefined || String(v).trim() === '' ? '----' : String(v).trim());

function parseLabeledSlots(value: unknown): Array<{ slot: string; number: string }> {
  if (!value) return [];
  if (Array.isArray(value)) return value.map((item, idx) => item && typeof item === 'object' ? ({ slot: String((item as any).slot ?? (item as any).label ?? idx + 1), number: normalizeNumber((item as any).number ?? (item as any).value) }) : ({ slot: String(idx + 1), number: normalizeNumber(item) }));
  if (typeof value === 'object') return Object.entries(value as Record<string, unknown>).map(([slot, number]) => ({ slot, number: normalizeNumber(number) }));
  return [];
}

function normalizeResultForDisplay(provider: Provider, result: ProviderResult) {
  const slotCount = TEN_SLOT_SPECIAL_PROVIDERS.includes(provider) ? 10 : 13;
  const specialLabels = slotCount === 13 ? SPECIAL_LABELS : Array.from({ length: 10 }, (_, i) => `S${i + 1}`);
  const consolationLabels = result.consolation_slot_labels?.length ? result.consolation_slot_labels : (TEN_SLOT_SPECIAL_PROVIDERS.includes(provider) ? Array.from({ length: 10 }, (_, i) => `C${i + 1}`) : CONSOLATION_LABELS);
  const layout = result.slot_layout ?? {};

  const top3 = [
    { label: '1st Prize', slot: result.top3_slot_labels?.first ?? String((layout as any).first_prize_slot ?? ''), number: normalizeNumber(result.first_prize) },
    { label: '2nd Prize', slot: result.top3_slot_labels?.second ?? String((layout as any).second_prize_slot ?? ''), number: normalizeNumber(result.second_prize) },
    { label: '3rd Prize', slot: result.top3_slot_labels?.third ?? String((layout as any).third_prize_slot ?? ''), number: normalizeNumber(result.third_prize) },
  ];

  const specialFromLayout = parseLabeledSlots((layout as any).special_slots ?? (layout as any).special);
  const consolationFromLayout = parseLabeledSlots((layout as any).consolation_slots ?? (layout as any).consolation);
  const blankSlots = new Set(top3.map((t) => t.slot).filter(Boolean));

  const specialCells = (specialFromLayout.length ? specialFromLayout : padSlots(result.special_cells ?? result.special_numbers ?? [], slotCount).map((n, i) => ({ slot: specialLabels[i], number: n })))
    .map((c, i) => ({ slot: c.slot || specialLabels[i], number: blankSlots.has(c.slot) ? '----' : normalizeNumber(c.number) }));

  const consolationCells = (consolationFromLayout.length ? consolationFromLayout : padSlots(result.consolation_numbers ?? [], 10).map((n, i) => ({ slot: consolationLabels[i], number: n })))
    .map((c, i) => ({ slot: c.slot || consolationLabels[i], number: normalizeNumber(c.number) }));

  return { top3, specialCells, consolationCells };
}

const formatUpdatedTime = (value?: string) => !value ? null : (Number.isNaN(new Date(value).getTime()) ? value : new Date(value).toLocaleString());
const SlotGrid = ({ cells }: { cells: Array<{ label: string; value: string }> }) => <div className="slot-grid slot-grid-5">{cells.map((c, i) => <div className="slot-cell" key={`${c.label}-${i}`}><span className="slot-label">{c.label}</span><span className="slot-number">{c.value || '----'}</span></div>)}</div>;

export default function ProviderDashboard() {
  const [selectedRegion, setSelectedRegion] = useState<RegionTab>('west');
  const [hiddenLogos, setHiddenLogos] = useState<Record<Provider, boolean>>({} as Record<Provider, boolean>);
  const REGION_TABS: Array<{ key: RegionTab; label: string; providers: Provider[] }> = [{ key:'west', label:'West Malaysia', providers:['magnum','sports_toto','da_ma_cai'] }, { key:'east', label:'East Malaysia', providers:['sabah88','sarawak','sandakan'] }, { key:'singapore', label:'Singapore', providers:['singapore'] }, { key:'cambodia', label:'Cambodia', providers:['grand_dragon','nine_lotto'] }];
  const [providerStates, setProviderStates] = useState<Record<Provider, ProviderCardState>>(Object.fromEntries(PROVIDERS.map((p) => [p, { loading:false, error:null, result:null }])) as Record<Provider, ProviderCardState>);
  const currentProviders = useMemo(() => REGION_TABS.find((tab) => tab.key === selectedRegion)?.providers || [], [selectedRegion]);

  useEffect(() => { currentProviders.forEach((provider) => { setProviderStates((prev) => ({ ...prev, [provider]: { ...prev[provider], loading: true, error: null } })); fetchProvider(provider).then((result) => setProviderStates((prev) => ({ ...prev, [provider]: { loading:false, error:null, result } }))).catch((err) => setProviderStates((prev) => ({ ...prev, [provider]: { loading:false, error:err.message, result:null } }))); }); }, [currentProviders]);

  return <div><div className="flex gap-2 mb-6 overflow-x-auto">{REGION_TABS.map((tab) => <button key={tab.key} onClick={() => setSelectedRegion(tab.key)} className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${selectedRegion === tab.key ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>{tab.label}</button>)}</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{currentProviders.map((provider) => { const state = providerStates[provider]; const logoSrc = PROVIDER_META[provider]?.logo; const showImage = Boolean(logoSrc) && !hiddenLogos[provider]; const display = state.result ? normalizeResultForDisplay(provider, state.result) : null; return <div key={provider} className={`bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition border border-slate-200 border-t-4 ${PROVIDER_ACCENTS[provider]}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 min-w-0"><div className="provider-logo-box h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{showImage ? <img src={logoSrc} alt={`${PROVIDER_LABELS[provider]} logo`} className="provider-logo-img" onError={() => setHiddenLogos((prev) => ({ ...prev, [provider]: true }))} /> : <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-lg">{PROVIDER_LABELS[provider].charAt(0)}</span></div>}</div><div className="min-w-0"><h3 className="font-bold text-lg text-slate-900 truncate">{PROVIDER_LABELS[provider]}</h3>{state.result?.draw_date && <p className="text-sm text-slate-500">{state.result.draw_date}</p>}</div></div></div>{state.loading && <div className="text-center py-8 text-slate-500">Loading...</div>}{state.error && <div className="text-center py-8 text-red-500">Error: {state.error}</div>}{state.result && !state.loading && display && <div className="space-y-4"><div className="text-center pb-3 border-b space-y-1"><p className="text-sm text-slate-500">Draw #{state.result.draw_number ?? '-'}</p><div className="grid grid-cols-3 gap-2 text-center">{display.top3.map((item, idx) => <div key={item.label} className={`rounded-lg border p-2 ${idx === 0 ? 'bg-amber-50 border-amber-200' : idx === 1 ? 'bg-slate-50 border-slate-200' : 'bg-orange-50 border-orange-200'}`}><p className="text-xs text-slate-500">{item.label}{item.slot ? ` · ${item.slot}` : ''}</p><p className={`text-lg font-bold ${idx === 0 ? 'text-amber-700' : idx === 1 ? 'text-slate-700' : 'text-orange-700'}`}>{item.number}</p></div>)}</div></div><div><p className="text-sm font-semibold text-slate-700 mb-2">Special Numbers</p><SlotGrid cells={display.specialCells.map((x) => ({ label: x.slot, value: x.number }))} /></div><div><p className="text-sm font-semibold text-slate-700 mb-2">Consolation Numbers</p><SlotGrid cells={display.consolationCells.map((x) => ({ label: x.slot, value: x.number }))} /></div><div className="pt-2 border-t text-sm text-slate-500 space-y-1"><p>Phase: {state.result.phase ?? '-'}</p><p>Status: {state.result.status ?? '-'}</p>{formatUpdatedTime(state.result.last_refreshed) && <p>Updated: {formatUpdatedTime(state.result.last_refreshed)}</p>}</div></div>}</div>; })}</div></div>;
}
