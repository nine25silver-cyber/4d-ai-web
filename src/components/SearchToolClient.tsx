'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import type {ProviderConfig} from '@/lib/providers';
import type {Locale} from '@/i18n/routing';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type SearchMode = 'exact' | 'boxed';
type PrizeType = 'first' | 'second' | 'third' | 'special' | 'consolation';

type SearchResult = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prize?: PrizeType;
  prizeType?: PrizeType;
  number: string;
};

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
  labels: Record<string, string> & {
    inputError: string;
    noResults: string;
  };
};

type SearchResponse = {
  count: number;
  results: SearchResult[];
};

const prizeTypes: PrizeType[] = ['first', 'second', 'third', 'special', 'consolation'];

export function SearchToolClient({locale, providers, labels}: Props) {
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [number, setNumber] = useState('');
  const [mode, setMode] = useState<SearchMode>('exact');
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<SearchResponse | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [activePrizes, setActivePrizes] = useState<Set<PrizeType>>(() => new Set(prizeTypes));

  const providersByCode = useMemo(() => new Map(providers.map((provider) => [provider.code, provider])), [providers]);
  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );
  const normalizedRows = useMemo(
    () => data?.results.map((row) => ({...row, prizeType: normalizePrizeType(row)})) ?? [],
    [data]
  );
  const filteredRows = useMemo(() => normalizedRows.filter((row) => activePrizes.has(row.prizeType)), [normalizedRows, activePrizes]);
  const prizeCounts = useMemo(() => {
    const counts = new Map<PrizeType, number>(prizeTypes.map((type) => [type, 0]));
    for (const row of normalizedRows) counts.set(row.prizeType, (counts.get(row.prizeType) ?? 0) + 1);
    return counts;
  }, [normalizedRows]);
  const providerCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const row of filteredRows) counts.set(row.providerCode, (counts.get(row.providerCode) ?? 0) + 1);
    return counts;
  }, [filteredRows]);

  const canSearch = number.length === 4;
  const isFormalPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;

  useEffect(() => {
    let active = true;
    void getCurrentUserEntitlement().then((next) => {
      if (active) setEntitlement(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function toggleProvider(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  function togglePrize(type: PrizeType) {
    setActivePrizes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  async function runSearch(nextMode: SearchMode) {
    if (selected.size === 0) {
      setValidationMessage(
        locale === 'zh'
          ? '请选择您要搜索的博彩公司'
          : locale === 'ms'
            ? 'Sila pilih syarikat nombor 4D yang ingin dicari.'
            : 'Please choose at least one company to search.'
      );
      return;
    }

    const normalized = number.replace(/\D/g, '').slice(0, 4);
    setNumber(normalized);
    if (normalized.length !== 4) {
      setStatus('error');
      setData(null);
      return;
    }

    setValidationMessage(null);
    setMode(nextMode);
    setStatus('loading');
    const params = new URLSearchParams({
      number: normalized,
      mode: nextMode,
      providers: Array.from(selected).join(',')
    });
    const response = await fetch(`/api/search?${params.toString()}`, {cache: 'no-store'});
    if (!response.ok) {
      setStatus('error');
      setData(null);
      return;
    }
    const payload = (await response.json()) as SearchResponse;
    setData({count: payload.count ?? payload.results?.length ?? 0, results: payload.results ?? []});
    setStatus('done');
  }

  function copyResults() {
    if (!isFormalPro || !data) return;
    const header = locale === 'zh'
      ? '日期 | 公司 | 期号 | 奖项 | 号码'
      : locale === 'ms'
        ? 'Tarikh | Syarikat | Cabutan | Hadiah | Nombor'
        : 'Date | Company | Draw | Prize | Number';
    const lines = filteredRows.map((row) => `${row.drawDate || '-'} | ${row.providerName} | ${row.drawNo || '-'} | ${prizeLabel(row.prizeType, locale)} | ${row.number}`);
    void navigator.clipboard.writeText([header, ...lines].join('\n'));
  }

  function downloadCsv() {
    if (!isFormalPro || !data) return;
    const rows = [
      ['date', 'provider', 'draw_no', 'prize', 'number'],
      ...filteredRows.map((row) => [row.drawDate || '', row.providerName, row.drawNo || '', prizeLabel(row.prizeType, locale), row.number])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `4d-search-${number || 'results'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const accessHint = locale === 'zh'
    ? {free: '免费版可搜索正4D/包字并查看结果。', pro: 'Pro 可复制结果与下载 CSV。'}
    : locale === 'ms'
      ? {free: 'Versi percuma boleh cari exact/boxed 4D dan lihat hasil.', pro: 'Pro boleh salin hasil dan muat turun CSV.'}
      : {free: 'Free users can search exact/boxed 4D and view results.', pro: 'Pro can copy results and download CSV.'};
  const searchOptions: Array<{mode: SearchMode; label: string}> = [
    {mode: 'exact', label: locale === 'zh' ? '正4D' : 'Exact'},
    {mode: 'boxed', label: locale === 'zh' ? '包字' : 'Boxed'}
  ];

  return (
    <section className="mt-8 grid items-start gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-black text-slate-800">
          {locale === 'zh' ? '4D号码' : locale === 'ms' ? 'Nombor 4D' : '4D number'}
        </label>
        <div className="mt-2 grid gap-2">
          <input
            value={number}
            inputMode="numeric"
            maxLength={4}
            onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, 4))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (canSearch) void runSearch('exact');
              }
            }}
            placeholder={locale === 'zh' ? '例如 1234' : locale === 'ms' ? 'Contoh 1234' : 'e.g. 1234'}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            {searchOptions.map((item) => {
              const loading = status === 'loading' && mode === item.mode;
              const primary = item.mode === 'exact';
              return (
                <button
                  key={item.mode}
                  type="button"
                  disabled={!canSearch || status === 'loading'}
                  onClick={() => runSearch(item.mode)}
                  aria-pressed={mode === item.mode}
                  className={
                    primary
                      ? 'rounded-md border border-blue-700 bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900 disabled:opacity-50'
                      : 'rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-black text-slate-800 hover:border-blue-700 hover:bg-blue-50 disabled:opacity-50'
                  }
                >
                  {loading ? (locale === 'zh' ? '搜索中...' : locale === 'ms' ? 'Sedang cari...' : 'Searching...') : item.label}
                </button>
              );
            })}
          </div>
        </div>
        {validationMessage ? (
          <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
            {validationMessage}
          </p>
        ) : null}
        <p className="mt-2 text-xs font-black text-blue-800">
          {locale === 'zh' ? '仅支持输入4位数字' : locale === 'ms' ? 'Hanya 4 digit dibenarkan' : 'Only 4 digits are allowed'}
        </p>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '请选择博彩公司' : locale === 'ms' ? 'Pilih syarikat' : 'Choose companies'}</h2>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSelected(new Set(providers.map((provider) => provider.code)))} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
              {locale === 'zh' ? '全选' : locale === 'ms' ? 'Pilih semua' : 'Select all'}
            </button>
            <button type="button" onClick={() => setSelected(new Set())} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
              {locale === 'zh' ? '清除' : locale === 'ms' ? 'Kosongkan' : 'Clear'}
            </button>
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {providers.map((provider) => {
            const active = selected.has(provider.code);
            return (
              <button key={provider.code} type="button" onClick={() => toggleProvider(provider.code)} aria-pressed={active} className={`min-h-[70px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff]' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
                <ProviderLogoBadge provider={provider} active={active} />
                <span className="mt-2 block text-xs font-black leading-4 text-slate-900">{provider.name}</span>
                {active ? (
                  <span className="mt-2 block rounded-md bg-slate-50 px-2 py-1 text-xs font-black text-slate-700">
                    {locale === 'zh' ? `中奖次数：${providerCounts.get(provider.code) ?? 0}` : `${locale === 'ms' ? 'Wins' : 'Wins'}: ${providerCounts.get(provider.code) ?? 0}`}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {locale === 'zh' ? '已选择公司' : locale === 'ms' ? 'Syarikat dipilih' : 'Selected companies'}: <span className="text-slate-800">{selectedNames || '-'}</span>
        </p>
      </section>

      <section className="grid self-start content-start gap-5">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
          <p>{accessHint.free}</p>
          <p className="mt-1">{accessHint.pro}</p>
        </div>
        {status === 'error' ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">{labels.inputError}</div> : null}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? `总中奖次数：${filteredRows.length}` : locale === 'ms' ? `Total wins: ${filteredRows.length}` : `Total wins: ${filteredRows.length}`}</h2>
            {isFormalPro ? (
              <div className="flex gap-2">
                <button type="button" onClick={copyResults} disabled={!data} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100 disabled:opacity-50">
                  {locale === 'zh' ? '复制结果' : locale === 'ms' ? 'Salin hasil' : 'Copy results'}
                </button>
                <button type="button" onClick={downloadCsv} disabled={!data} className="rounded-md border border-blue-700 bg-blue-800 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900 disabled:opacity-50">
                  {locale === 'zh' ? '下载 CSV' : locale === 'ms' ? 'Muat turun CSV' : 'Download CSV'}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <span>{locale === 'zh' ? '导出仅限 Pro' : locale === 'ms' ? 'Eksport untuk Pro sahaja' : 'Export is Pro only'}</span>
                <Link href={`/${locale}/pricing`} className="rounded-md border border-amber-300 bg-amber-50 px-2 py-1 font-black hover:bg-amber-100">
                  {locale === 'zh' ? '升级 Pro' : locale === 'ms' ? 'Upgrade Pro' : 'Upgrade Pro'}
                </Link>
              </div>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {prizeTypes.map((type) => {
              const selectedPrize = activePrizes.has(type);
              const topPrize = isTopPrize(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePrize(type)}
                  className={`min-h-[64px] rounded-md border px-3 py-2 text-center text-sm font-black text-white transition ${topPrize ? 'border-red-700 bg-red-700 hover:bg-red-800' : 'border-blue-700 bg-blue-700 hover:bg-blue-800'} ${selectedPrize ? 'opacity-100' : 'opacity-35 grayscale'}`}
                  aria-pressed={selectedPrize}
                >
                  <span className="block">{prizeLabel(type, locale)}</span>
                  <span className="mt-1 block text-lg leading-none">{prizeCounts.get(type) ?? 0}</span>
                </button>
              );
            })}
          </div>

          {status === 'idle' ? (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              {locale === 'zh' ? '输入 4 位数字后，点击“正4D”或“包字”开始搜索。' : locale === 'ms' ? 'Masukkan 4 digit, kemudian tekan exact atau boxed untuk mula.' : 'Enter 4 digits, then run exact or boxed search.'}
            </div>
          ) : null}

          {data ? (
            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                    <th className="px-2 py-2">{locale === 'zh' ? '日期' : locale === 'ms' ? 'Tarikh' : 'Date'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '公司' : locale === 'ms' ? 'Syarikat' : 'Company'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '期号' : locale === 'ms' ? 'Cabutan' : 'Draw'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '奖项' : locale === 'ms' ? 'Hadiah' : 'Prize'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '号码' : locale === 'ms' ? 'Nombor' : 'Number'}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((row, index) => {
                    const provider = providersByCode.get(row.providerCode);
                    return (
                      <tr key={`${row.providerCode}-${row.drawDate}-${row.drawNo}-${row.number}-${row.prizeType}-${index}`} className="border-b border-slate-100">
                        <td className="px-2 py-2 font-bold text-slate-700">{row.drawDate || '-'}</td>
                        <td className="px-2 py-2">
                          <span className="flex min-w-[150px] items-center gap-2">
                            {provider ? <ProviderLogoBadge provider={provider} sizeClassName="size-8" active /> : null}
                            <span>{row.providerName}</span>
                          </span>
                        </td>
                        <td className="px-2 py-2">{row.drawNo || '-'}</td>
                        <td className="px-2 py-2">
                          <span className={`inline-flex min-w-[78px] justify-center rounded-md px-2 py-1 text-xs font-black text-white ${isTopPrize(row.prizeType) ? 'bg-red-700' : 'bg-blue-700'}`}>
                            {prizeLabel(row.prizeType, locale)}
                          </span>
                        </td>
                        <td className="px-2 py-2 font-black text-slate-950">{row.number}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRows.length === 0 ? (
                <div className="border-t border-slate-100 px-2 py-6 text-center text-sm font-bold text-slate-500">
                  {status === 'done' && normalizedRows.length === 0
                    ? labels.noResults
                    : locale === 'zh'
                      ? '当前筛选没有中奖记录。'
                      : locale === 'ms'
                        ? 'Tiada rekod untuk penapis semasa.'
                        : 'No records for the current filters.'}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>
    </section>
  );
}

function normalizePrizeType(row: SearchResult): PrizeType {
  if (row.prizeType === 'first' || row.prizeType === 'second' || row.prizeType === 'third' || row.prizeType === 'special' || row.prizeType === 'consolation') {
    return row.prizeType;
  }
  if (row.prize === 'first' || row.prize === 'second' || row.prize === 'third' || row.prize === 'special' || row.prize === 'consolation') {
    return row.prize;
  }
  return 'first';
}

function isTopPrize(type: PrizeType) {
  return type === 'first' || type === 'second' || type === 'third';
}

function prizeLabel(type: PrizeType, locale: Locale) {
  if (locale === 'zh') {
    if (type === 'first') return '头奖';
    if (type === 'second') return '二奖';
    if (type === 'third') return '三奖';
    if (type === 'special') return '特别奖';
    return '安慰奖';
  }
  if (type === 'first') return '1st';
  if (type === 'second') return '2nd';
  if (type === 'third') return '3rd';
  if (type === 'special') return 'Special';
  return 'Consolation';
}
