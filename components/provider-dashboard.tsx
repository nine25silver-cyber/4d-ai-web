'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchProvider, PROVIDERS, PROVIDER_LABELS, PROVIDER_META, type Provider, type ProviderResult } from '@/lib/providers';

type RegionTab = 'west' | 'east' | 'singapore' | 'cambodia';
type ProviderCardState = { loading: boolean; error: string | null; result: ProviderResult | null };
type Top3Cell = { prizeLabel: string; slotLabel: string; number: string };
type SlotCell = { slotLabel: string; number: string };

const SPECIAL_LABELS = 'ABCDEFGHIJKLM'.split('');
const CONSOLATION_LABELS = 'NOPQRSTUVW'.split('');
const TEN_SLOT_SPECIAL_PROVIDERS: Provider[] = ['singapore', 'da_ma_cai', 'sarawak'];
const THIRTEEN_SLOT_SPECIAL_PROVIDERS: Provider[] = ['magnum', 'sports_toto', 'sabah88', 'sandakan', 'grand_dragon', 'nine_lotto'];
const PROVIDER_ACCENTS: Record<Provider, string> = { magnum:'border-t-red-500',sports_toto:'border-t-blue-500',da_ma_cai:'border-t-yellow-500',sabah88:'border-t-emerald-500',sarawak:'border-t-orange-500',sandakan:'border-t-cyan-500',grand_dragon:'border-t-rose-500',nine_lotto:'border-t-purple-500',singapore:'border-t-indigo-500' };

const normalizeNumber = (v: unknown) => (v === null || v === undefined || String(v).trim() === '' ? '----' : String(v).trim());
const normalizeLabel = (v: unknown) => String(v ?? '').trim().toUpperCase();

function parseSlotMap(value: unknown): Map<string, string> {
  const map = new Map<string, string>();
  if (!value) return map;
  if (Array.isArray(value)) {
    value.forEach((item, idx) => {
      if (item && typeof item === 'object') {
        const slot = normalizeLabel((item as any).slot ?? (item as any).label ?? (item as any).name ?? idx + 1);
        const number = normalizeNumber((item as any).number ?? (item as any).value);
        if (slot) map.set(slot, number);
      } else {
        map.set(String(idx + 1), normalizeNumber(item));
      }
    });
    return map;
  }
  if (typeof value === 'object') {
    Object.entries(value as Record<string, unknown>).forEach(([slot, number]) => map.set(normalizeLabel(slot), normalizeNumber(number)));
  }
  return map;
}

function getSpecialSlotLabels(provider: Provider): string[] {
  if (THIRTEEN_SLOT_SPECIAL_PROVIDERS.includes(provider)) return SPECIAL_LABELS;
  return TEN_SLOT_SPECIAL_PROVIDERS.includes(provider) ? Array.from({ length: 10 }, (_, i) => `S${i + 1}`) : SPECIAL_LABELS;
}

function buildFixedSlotCells({
  slotLabels,
  valuesBySlot,
  extractedSlots,
}: {
  slotLabels: string[];
  valuesBySlot: Map<string, string>;
  extractedSlots?: Set<string>;
}): SlotCell[] {
  return slotLabels.map((slotLabel) => ({
    slotLabel,
    number: extractedSlots?.has(slotLabel) ? '----' : (valuesBySlot.get(slotLabel) ?? '----'),
  }));
}

function normalizeProviderDisplayPayload(providerCode: Provider, payload: ProviderResult) {
  const layout = payload.slot_layout as Record<string, unknown> | undefined;
  const specialSlotLabels = getSpecialSlotLabels(providerCode);
  const specialSlotCount = specialSlotLabels.length;
  const consolationSlotLabels = payload.consolation_slot_labels?.length ? payload.consolation_slot_labels.map(normalizeLabel) : CONSOLATION_LABELS;

  const top3Cells: Top3Cell[] = [
    { prizeLabel: '1st Prize', slotLabel: normalizeLabel(payload.top3_slot_labels?.first ?? layout?.first_prize_slot), number: normalizeNumber(payload.first_prize) },
    { prizeLabel: '2nd Prize', slotLabel: normalizeLabel(payload.top3_slot_labels?.second ?? layout?.second_prize_slot), number: normalizeNumber(payload.second_prize) },
    { prizeLabel: '3rd Prize', slotLabel: normalizeLabel(payload.top3_slot_labels?.third ?? layout?.third_prize_slot), number: normalizeNumber(payload.third_prize) },
  ];

  const specialFromLayout = parseSlotMap(layout?.special_slots ?? layout?.special);
  const consolationFromLayout = parseSlotMap(layout?.consolation_slots ?? layout?.consolation);

  const fallbackSpecialBySlot = new Map<string, string>(
    specialSlotLabels.map((slot, index) => [slot, normalizeNumber(payload.special_cells?.[index] ?? payload.special_numbers?.[index])]),
  );
  const specialValuesBySlot = specialFromLayout.size > 0 ? specialFromLayout : fallbackSpecialBySlot;

  const top3SlotSet = new Set(top3Cells.map((cell) => cell.slotLabel).filter(Boolean));
  const top3NumberBySlot = new Map(top3Cells.filter((cell) => cell.slotLabel).map((cell) => [cell.slotLabel, cell.number]));

  const finalTop3 = top3Cells.map((cell) => {
    if (cell.number !== '----') return cell;
    const fromSpecial = specialFromLayout.size > 0 && cell.slotLabel ? specialFromLayout.get(cell.slotLabel) : undefined;
    return { ...cell, number: fromSpecial ?? cell.number };
  });

  const finalSpecial = buildFixedSlotCells({
    slotLabels: specialSlotLabels,
    valuesBySlot: specialValuesBySlot,
    extractedSlots: top3SlotSet,
  });

  const fallbackConsolationBySlot = new Map<string, string>(
    consolationSlotLabels.map((slot, index) => [slot, normalizeNumber(payload.consolation_numbers?.[index])]),
  );
  const consolationCells = buildFixedSlotCells({
    slotLabels: consolationSlotLabels,
    valuesBySlot: consolationFromLayout.size > 0 ? consolationFromLayout : fallbackConsolationBySlot,
  });

  return {
    top3Cells: finalTop3.map((cell) => ({ ...cell, number: top3NumberBySlot.get(cell.slotLabel) ?? cell.number })),
    specialCells: finalSpecial.slice(0, specialSlotCount),
    consolationCells: consolationCells.slice(0, 10),
  };
}

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

  return <div><div className="flex gap-2 mb-6 overflow-x-auto">{REGION_TABS.map((tab) => <button key={tab.key} onClick={() => setSelectedRegion(tab.key)} className={`px-6 py-3 rounded-lg font-medium transition whitespace-nowrap ${selectedRegion === tab.key ? 'bg-blue-500 text-white shadow-lg' : 'bg-white text-slate-700 hover:bg-slate-100'}`}>{tab.label}</button>)}</div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{currentProviders.map((provider) => { const state = providerStates[provider]; const logoSrc = PROVIDER_META[provider]?.logo; const showImage = Boolean(logoSrc) && !hiddenLogos[provider]; const display = state.result ? normalizeProviderDisplayPayload(provider, state.result) : null; return <div key={provider} className={`bg-white rounded-xl shadow-lg p-4 md:p-6 hover:shadow-xl transition border border-slate-200 border-t-4 ${PROVIDER_ACCENTS[provider]}`}><div className="flex items-center justify-between mb-4"><div className="flex items-center gap-3 min-w-0"><div className="provider-logo-box h-12 w-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">{showImage ? <img src={logoSrc} alt={`${PROVIDER_LABELS[provider]} logo`} className="provider-logo-img" onError={() => setHiddenLogos((prev) => ({ ...prev, [provider]: true }))} /> : <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center"><span className="text-white font-bold text-lg">{PROVIDER_LABELS[provider].charAt(0)}</span></div>}</div><div className="min-w-0"><h3 className="font-bold text-lg text-slate-900 truncate">{PROVIDER_LABELS[provider]}</h3>{state.result?.draw_date && <p className="text-sm text-slate-500">{state.result.draw_date}</p>}</div></div></div>{state.loading && <div className="text-center py-8 text-slate-500">Loading...</div>}{state.error && <div className="text-center py-8 text-red-500">Error: {state.error}</div>}{state.result && !state.loading && display && <div className="space-y-4"><div className="text-center pb-3 border-b space-y-2"><p className="text-sm text-slate-500">Draw #{state.result.draw_number ?? '-'}</p><div className="top3-grid">{display.top3Cells.map((item) => <div key={item.prizeLabel} className="top3-cell"><span className="top3-label">{item.prizeLabel}</span>{item.slotLabel && <span className="top3-slot">{item.slotLabel}</span>}<span className="top3-number">{item.number}</span></div>)}</div></div><div><p className="text-sm font-semibold text-slate-700 mb-2">Special Numbers</p><SlotGrid cells={display.specialCells} /></div><div><p className="text-sm font-semibold text-slate-700 mb-2">Consolation Numbers</p><SlotGrid cells={display.consolationCells} /></div><div className="pt-2 border-t text-sm text-slate-500 space-y-1"><p>Phase: {state.result.phase ?? '-'}</p><p>Status: {state.result.status ?? '-'}</p>{formatUpdatedTime(state.result.last_refreshed) && <p>Updated: {formatUpdatedTime(state.result.last_refreshed)}</p>}</div></div>}</div>; })}</div></div>;
}

export function validateMagnumSampleSlots() {
  const sample = normalizeProviderDisplayPayload('magnum', {
    first_prize: '1109',
    second_prize: '3856',
    third_prize: '0175',
    top3_slot_labels: { first: 'B', second: 'E', third: 'K' },
    slot_layout: {
      special_slots: { A: '7490', C: '8547', D: '5645', F: '3806', G: '4592', H: '3002', I: '8051', J: '2848', L: '3876', M: '5343' },
    },
  });
  return ['B', 'E', 'K'].every((slot) => sample.specialCells.find((cell) => cell.slotLabel === slot)?.number === '----');
}
