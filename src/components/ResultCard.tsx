import Image from 'next/image';
import type {ProviderResultState} from '@/lib/cloudflare';
import type {ProviderConfig} from '@/lib/providers';

export type ResultCardLabels = {
  firstPrize: string;
  secondPrize: string;
  thirdPrize: string;
  specialPrize: string;
  consolationPrize: string;
  sourceLabel: string;
  updatedLabel: string;
  unavailable: string;
  providerResult: string;
  unavailableReason: string;
  drawLabel: string;
  datePending: string;
};

type Props = {provider: ProviderConfig; result: ProviderResultState; labels: ResultCardLabels; compact?: boolean};
type NumberCell = {label?: string; number: string};
type TopPrizeCell = {label: string; number?: string; slot?: string};
const providersWithoutEntryLabels = new Set(['da_ma_cai', 'singapore', 'sarawak', 'sabah88', 'sandakan']);
const grandDragonSpecialLabels = 'ABCDEFGHIJKLM'.split('');
const tableBorder = 'border-[#D6E0EA]';
const tableHeader = 'bg-[#F1F5F9]';
const tableText = 'text-[#1E293B]';
const tableAccent = 'text-[#256D85]';
const providerLogoByCode: Record<string, string> = {
  magnum: '/provider-logos/magnum.jpg',
  sports_toto: '/provider-logos/sports_toto.png',
  da_ma_cai: '/provider-logos/da_ma_cai.png',
  sabah88: '/provider-logos/sabah88.jpg',
  sarawak: '/provider-logos/sarawak.jpg',
  sandakan: '/provider-logos/sandakan.jpg',
  grand_dragon: '/provider-logos/grand_dragon.jpg',
  nine_lotto: '/provider-logos/nine_lotto.png',
  singapore: '/provider-logos/singapore.jpg'
};

const providerBannerThemeByCode: Record<string, {bg: string; text: string; muted: string}> = {
  magnum: {bg: 'bg-[#FFF200]', text: 'text-[#1F2937]', muted: 'text-[#334155]'},
  sports_toto: {bg: 'bg-[#C81E1E]', text: 'text-white', muted: 'text-red-100'},
  da_ma_cai: {bg: 'bg-[#0A1C8F]', text: 'text-white', muted: 'text-blue-100'},
  sabah88: {bg: 'bg-[#C1121F]', text: 'text-white', muted: 'text-red-100'},
  sarawak: {bg: 'bg-[#0E7A2F]', text: 'text-white', muted: 'text-green-100'},
  sandakan: {bg: 'bg-[#0E7A2F]', text: 'text-white', muted: 'text-green-100'},
  grand_dragon: {bg: 'bg-[#F11212]', text: 'text-white', muted: 'text-red-100'},
  nine_lotto: {bg: 'bg-[#F97316]', text: 'text-white', muted: 'text-orange-100'},
  singapore: {bg: 'bg-[#0F6CBD]', text: 'text-white', muted: 'text-blue-100'}
};

function isFilledResultNumber(value?: string): value is string {
  const normalized = String(value ?? '').trim();
  return normalized.length > 0 && normalized !== '----';
}

function isLiveResultPayload(result: ProviderResultState): boolean {
  if (!result.ok) return false;
  const phase = result.payload.phase?.toLowerCase() ?? '';
  const status = result.payload.status?.toLowerCase() ?? '';
  const state = `${phase} ${status}`;
  if (state.includes('final') || state.includes('complete') || state.includes('closed')) return false;
  return state.includes('live') || state.includes('progress');
}

function maskPromotedGrandDragonSpecials(result: ProviderResultState, slotItems: string[]): string[] {
  if (!result.ok || !isLiveResultPayload(result)) return slotItems;
  const payload = result.payload;
  const topPrizeNumbers = new Set(
    [
      payload.first_prize,
      payload.second_prize,
      payload.third_prize,
      ...(payload.display_payload?.top3?.map((item) => item.number) ?? [])
    ]
      .map((number) => String(number ?? '').trim())
      .filter(isFilledResultNumber)
  );
  if (topPrizeNumbers.size === 0) return slotItems;
  return slotItems.map((number) => topPrizeNumbers.has(String(number ?? '').trim()) ? '----' : number);
}

function prizeEntryLabel(providerCode: string, section: 'top3' | 'special' | 'consolation', index: number, sourceLabel?: string) {
  if (providersWithoutEntryLabels.has(providerCode)) return undefined;
  if (section === 'top3') return sourceLabel;
  if (providerCode === 'grand_dragon' && section === 'special') return grandDragonSpecialLabels[index] ?? String(index + 1);
  return sourceLabel || String(index + 1);
}

function displayItems(provider: ProviderConfig, result: ProviderResultState, section: 'special' | 'consolation'): NumberCell[] {
  if (!result.ok) return [];
  const payload = result.payload;
  const slotItems = section === 'special' ? payload.slot_layout?.special_slots : payload.slot_layout?.consolation_slots;
  if (provider.code === 'grand_dragon' && section === 'special' && slotItems && slotItems.length > 0) {
    return maskPromotedGrandDragonSpecials(result, slotItems).map((number, index) => ({label: prizeEntryLabel(provider.code, section, index), number}));
  }
  const display = payload.display_payload?.[section];
  if (display && display.length > 0) {
    return display.map((item, index) => ({
      label: prizeEntryLabel(provider.code, section, index, item.label),
      number: item.number || '----'
    }));
  }
  if (slotItems && slotItems.length > 0) {
    return slotItems.map((number, index) => ({label: prizeEntryLabel(provider.code, section, index), number}));
  }
  const compactItems = section === 'special' ? payload.special_numbers : payload.consolation_numbers;
  return (compactItems ?? []).map((number, index) => ({label: prizeEntryLabel(provider.code, section, index), number}));
}

function rowsFor(items: NumberCell[]) {
  if (items.length === 13) {
    return [
      items.slice(0, 5),
      items.slice(5, 10),
      [null, items[10], items[11], items[12], null]
    ];
  }
  const rows: Array<Array<NumberCell | null>> = [];
  for (let index = 0; index < items.length; index += 5) {
    const row: Array<NumberCell | null> = items.slice(index, index + 5);
    while (row.length < 5) row.push(null);
    rows.push(row);
  }
  return rows;
}

function PoolSection({title, items, showBottomBorder, compact}: {title: string; items: NumberCell[]; showBottomBorder?: boolean; compact?: boolean}) {
  if (items.length === 0) return <span className="text-sm text-slate-500">Not available</span>;
  const rows = rowsFor(items);
  return (
    <section className={`border-x border-t ${showBottomBorder ? 'border-b' : ''} ${tableBorder}`}>
      <h3 className={`${tableHeader} ${tableText} border-b ${tableBorder} text-center font-black ${compact ? 'py-0 text-[12px] leading-4' : 'py-1 text-[15px]'}`}>
        {title}
      </h3>
      <div>
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className={`grid grid-cols-5 ${rowIndex > 0 ? `border-t ${tableBorder}` : ''}`}>
            {row.map((item, columnIndex) => (
              <div key={`${rowIndex}-${columnIndex}-${item?.number ?? 'empty'}`} className={`relative grid place-items-center bg-white px-1 ${compact ? 'h-[21px]' : 'h-[30px]'} ${columnIndex > 0 ? `border-l ${tableBorder}` : ''}`}>
                {item ? (
                  <>
                    {item.label ? <span className={`absolute left-[2px] top-[2px] font-black leading-none ${compact ? 'text-[5px]' : 'text-[6px]'} ${tableAccent}`}>{item.label}</span> : null}
                    <span className={`result-number max-w-full truncate font-extrabold ${compact ? 'text-[12px]' : 'text-[14px]'} ${item.number === '----' ? 'text-slate-400' : tableText}`}>{item.number}</span>
                  </>
                ) : null}
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

function TopPrizeTable({items, compact}: {items: TopPrizeCell[]; compact?: boolean}) {
  return (
    <section className={`border-x border-t ${tableBorder}`}>
      {items.map((item, index) => (
        <div key={item.label} className={`grid grid-cols-[13fr_9fr] ${index > 0 ? `border-t ${tableBorder}` : ''}`}>
          <div className={`${tableHeader} ${tableText} grid place-items-center font-black ${compact ? 'h-[25px] text-[15px]' : 'h-[34px] text-[18px]'}`}>
            {item.label}
          </div>
          <div className={`relative grid place-items-center border-l bg-white ${compact ? 'h-[25px]' : 'h-[34px]'} ${tableBorder}`}>
            {item.slot ? <span className={`absolute left-[4px] top-[2px] font-black leading-none ${compact ? 'text-[6px]' : 'text-[7px]'} ${tableAccent}`}>{item.slot}</span> : null}
            <span className={`result-number max-w-full truncate px-3 font-black ${compact ? 'text-[15px]' : 'text-[18px]'} ${tableText}`}>{item.number || '----'}</span>
          </div>
        </div>
      ))}
    </section>
  );
}

export function ResultCard({provider, result, labels, compact}: Props) {
  const logoSrc = providerLogoByCode[provider.code];
  const bannerTheme = providerBannerThemeByCode[provider.code] ?? {
    bg: tableHeader,
    text: tableText,
    muted: 'text-slate-600'
  };
  if (!result.ok) {
    return (
      <article className={`rounded-lg border border-slate-200 bg-white shadow-sm ${compact ? 'p-2' : 'p-4'}`}>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {logoSrc ? (
              <span className={`relative overflow-hidden rounded border border-slate-200 bg-white ${compact ? 'h-8 w-12' : 'h-10 w-16'}`}>
                <Image src={logoSrc} alt={`${provider.name} logo`} fill sizes="64px" className="object-contain p-1" />
              </span>
            ) : null}
            <div>
              <h2 className={`font-bold text-slate-950 ${compact ? 'text-base' : 'text-lg'}`}>{provider.name}</h2>
              <p className={`${compact ? 'text-xs' : 'text-sm'} text-slate-500`}>{labels.providerResult}</p>
            </div>
          </div>
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{labels.unavailable}</span>
        </div>
        <p className="mt-4 rounded border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
          {labels.unavailableReason.replace('__REASON__', result.reason)}
        </p>
      </article>
    );
  }

  const payload = result.payload;
  const specialItems = displayItems(provider, result, 'special');
  const consolationItems = displayItems(provider, result, 'consolation');
  const topPrizeItems: TopPrizeCell[] = [
    {label: labels.firstPrize, number: payload.first_prize, slot: prizeEntryLabel(provider.code, 'top3', 0, payload.display_payload?.top3?.find((item) => item.key === 'first')?.slot ?? payload.slot_layout?.top3_slots?.first)},
    {label: labels.secondPrize, number: payload.second_prize, slot: prizeEntryLabel(provider.code, 'top3', 1, payload.display_payload?.top3?.find((item) => item.key === 'second')?.slot ?? payload.slot_layout?.top3_slots?.second)},
    {label: labels.thirdPrize, number: payload.third_prize, slot: prizeEntryLabel(provider.code, 'top3', 2, payload.display_payload?.top3?.find((item) => item.key === 'third')?.slot ?? payload.slot_layout?.top3_slots?.third)}
  ];
  return (
    <article className={`overflow-hidden rounded-lg border bg-white shadow-sm ${tableBorder}`}>
      <div className={`flex flex-wrap items-start justify-between border-b ${tableBorder} ${bannerTheme.bg} ${compact ? 'gap-1.5 p-1.5' : 'gap-3 p-3'}`}>
        <div className={`flex items-start ${compact ? 'gap-1.5' : 'gap-3'}`}>
          {logoSrc ? (
            <span className={`relative overflow-hidden rounded border border-slate-200 bg-white ${compact ? 'h-8 w-14' : 'h-12 w-20'}`}>
              <Image src={logoSrc} alt={`${provider.name} logo`} fill sizes={compact ? '56px' : '80px'} className="object-contain p-1" />
            </span>
          ) : null}
          <div>
            <h2 className={`font-black ${compact ? 'text-[15px] leading-4' : 'text-lg'} ${bannerTheme.text}`}>{provider.name}</h2>
            <p className={`font-semibold ${compact ? 'text-[11px] leading-3' : 'text-sm'} ${bannerTheme.muted}`}>{labels.drawLabel} {payload.draw_no || '-'} | {payload.draw_date || labels.datePending}</p>
          </div>
        </div>
      </div>
      <div className={compact ? 'p-1.5' : 'p-3'}>
        <div className="overflow-hidden rounded-md border-b border-[#D6E0EA]">
          <TopPrizeTable items={topPrizeItems} compact={compact} />
          <PoolSection title={labels.specialPrize} items={specialItems} compact={compact} />
          <PoolSection title={labels.consolationPrize} items={consolationItems} showBottomBorder compact={compact} />
        </div>
      </div>
    </article>
  );
}
