'use client';

import Link from 'next/link';
import {useEffect, useMemo, useState} from 'react';
import type {ProviderConfig} from '@/lib/providers';
import type {Locale} from '@/i18n/routing';
import {initMemberState, readMemberState, subscribeMemberState, type MemberState} from '@/lib/member-state';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type SearchMode = 'exact' | 'boxed';
type SearchResult = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prize: 'top3' | 'special' | 'consolation';
  label: string;
  number: string;
};

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
  labels: {
    numberLabel: string;
    numberPlaceholder: string;
    modeLabel: string;
    exactMode: string;
    boxedMode: string;
    providerSelectTitle: string;
    providerSelectText: string;
    selectedProviders: string;
    selectAll: string;
    clearAll: string;
    dateRangeLabel: string;
    latest30: string;
    allHistory: string;
    searchButton: string;
    searching: string;
    inputError: string;
    noSearchYet: string;
    resultCount: string;
    noResults: string;
    resultProvider: string;
    resultDate: string;
    resultDraw: string;
    resultPrize: string;
    openResult: string;
    top3Prize: string;
    specialPrizeResult: string;
    consolationPrizeResult: string;
  };
};

function prizeLabel(labels: Props['labels'], prize: SearchResult['prize']) {
  if (prize === 'top3') return labels.top3Prize;
  if (prize === 'special') return labels.specialPrizeResult;
  return labels.consolationPrizeResult;
}

export function SearchToolClient({locale, providers, labels}: Props) {
  const [memberState, setMemberState] = useState<MemberState | null>(null);
  const [number, setNumber] = useState('');
  const [mode, setMode] = useState<SearchMode>('exact');
  const [selected, setSelected] = useState(() => new Set(providers.map((provider) => provider.code)));
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [results, setResults] = useState<SearchResult[]>([]);
  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );
  const isPro = memberState?.loggedIn === true && memberState.plan === 'pro';

  useEffect(() => {
    initMemberState();
    setMemberState(readMemberState());
    return subscribeMemberState(setMemberState);
  }, []);

  function toggle(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function runSearch(nextMode: SearchMode = mode) {
    setMode(nextMode);
    const normalized = number.replace(/\D/g, '').slice(0, 4);
    setNumber(normalized);
    if (normalized.length !== 4) {
      setStatus('error');
      setResults([]);
      return;
    }
    setStatus('loading');
    const params = new URLSearchParams({
      number: normalized,
      mode: nextMode,
      providers: Array.from(selected).join(',')
    });
    const response = await fetch(`/api/search?${params.toString()}`, {cache: 'no-store'});
    if (!response.ok) {
      setStatus('error');
      setResults([]);
      return;
    }
    const data = (await response.json()) as {results?: SearchResult[]};
    setResults(data.results ?? []);
    setStatus('done');
  }

  function copyResults() {
    if (!isPro || results.length === 0) return;
    const header = locale === 'zh'
      ? '号码 | Provider | 日期 | 期号 | 奖项'
      : locale === 'ms'
        ? 'Nombor | Provider | Tarikh | Cabutan | Hadiah'
        : 'Number | Provider | Date | Draw | Prize';
    const lines = results.map((result) => `${result.number} | ${result.providerName} | ${result.drawDate} | ${result.drawNo || '-'} | ${prizeLabel(labels, result.prize)} ${result.label}`);
    void navigator.clipboard.writeText([header, ...lines].join('\n'));
  }

  function downloadCsv() {
    if (!isPro || results.length === 0) return;
    const rows = [
      ['number', 'provider', 'draw_date', 'draw_no', 'prize', 'label'],
      ...results.map((result) => [result.number, result.providerName, result.drawDate, result.drawNo || '', prizeLabel(labels, result.prize), result.label])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search-${number || 'results'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const accessHint = locale === 'zh'
    ? {free: '免费版可搜索正字/包字并查看结果。', pro: 'Pro 可复制结果与下载 CSV。'}
    : locale === 'ms'
      ? {free: 'Versi percuma boleh cari nombor tepat/boxed dan lihat hasil.', pro: 'Pro boleh salin hasil dan muat turun CSV.'}
      : {free: 'Free users can run exact/boxed search and view results.', pro: 'Pro can copy results and download CSV.'};

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-[1fr_420px]">
      <form className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="text-sm font-black text-slate-800">{labels.numberLabel}</span>
            <input
              inputMode="numeric"
              maxLength={4}
              value={number}
              onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder={labels.numberPlaceholder}
              className="mt-2 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-lg font-black tracking-[0.2em] text-slate-950 outline-none focus:border-blue-500"
            />
          </label>
          <div className="block">
            <span className="text-sm font-black text-slate-800">{labels.modeLabel}</span>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {(['exact', 'boxed'] as const).map((searchMode) => {
                const active = mode === searchMode;
                const label = searchMode === 'exact' ? labels.exactMode : labels.boxedMode;
                return (
                  <button
                    key={searchMode}
                    type="button"
                    onClick={() => runSearch(searchMode)}
                    disabled={status === 'loading'}
                    aria-pressed={active}
                    className={`min-h-[46px] rounded-md border px-3 py-2 text-base font-black transition disabled:opacity-60 ${
                      active
                        ? 'border-blue-700 bg-blue-800 text-white shadow-sm'
                        : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50'
                    }`}
                  >
                    {status === 'loading' && active ? labels.searching : label}
                  </button>
                );
              })}
            </div>
          </div>

          <section className="md:col-span-2">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-sm font-black text-slate-800">{labels.providerSelectTitle}</h2>
                <p className="mt-1 text-xs font-semibold text-slate-500">{labels.providerSelectText}</p>
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSelected(new Set(providers.map((provider) => provider.code)))} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
                  {labels.selectAll}
                </button>
                <button type="button" onClick={() => setSelected(new Set())} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
                  {labels.clearAll}
                </button>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
              {providers.map((provider) => {
                const active = selected.has(provider.code);
                return (
                  <button key={provider.code} type="button" onClick={() => toggle(provider.code)} aria-pressed={active} className={`min-h-[76px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
                    <ProviderLogoBadge provider={provider} active={active} />
                    <span className="mt-2 block text-xs font-black leading-4 text-slate-900">{provider.name}</span>
                  </button>
                );
              })}
            </div>
            <p className="mt-3 text-xs font-semibold text-slate-500">{labels.selectedProviders}: <span className="text-slate-800">{selectedNames || '-'}</span></p>
          </section>

          <label className="block md:col-span-2">
            <span className="text-sm font-black text-slate-800">{labels.dateRangeLabel}</span>
            <select disabled className="mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-500 outline-none">
              <option>{labels.latest30}</option>
              <option>{labels.allHistory}</option>
            </select>
          </label>
        </div>
      </form>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
          <p>{accessHint.free}</p>
          <p className="mt-1">{accessHint.pro}</p>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-black text-slate-950">
            {status === 'done' ? labels.resultCount.replace('{count}', String(results.length)) : labels.resultProvider}
          </h2>
          {isPro ? (
            <div className="flex gap-2">
              <button type="button" disabled={results.length === 0} onClick={copyResults} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100 disabled:opacity-50">
                {locale === 'zh' ? '复制结果' : locale === 'ms' ? 'Salin hasil' : 'Copy results'}
              </button>
              <button type="button" disabled={results.length === 0} onClick={downloadCsv} className="rounded-md border border-blue-700 bg-blue-800 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900 disabled:opacity-50">
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
        {status === 'idle' ? <p className="mt-3 text-sm leading-6 text-slate-600">{labels.noSearchYet}</p> : null}
        {status === 'error' ? <p className="mt-3 rounded border border-amber-200 bg-amber-50 p-3 text-sm font-bold text-amber-800">{labels.inputError}</p> : null}
        {status === 'done' && results.length === 0 ? <p className="mt-3 text-sm leading-6 text-slate-600">{labels.noResults}</p> : null}
        {results.length > 0 ? (
          <div className="mt-4 max-h-[620px] overflow-auto rounded border border-slate-200">
            {results.map((result, index) => (
              <div key={`${result.providerCode}-${result.drawDate}-${result.prize}-${result.label}-${index}`} className="grid gap-2 border-b border-slate-100 p-3 last:border-b-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-black text-slate-950">{result.number}</div>
                  <div className="rounded bg-slate-100 px-2 py-1 text-xs font-black text-slate-600">{prizeLabel(labels, result.prize)} {result.label}</div>
                </div>
                <div className="text-sm text-slate-600">{labels.resultProvider}: <strong>{result.providerName}</strong></div>
                <div className="text-sm text-slate-600">{labels.resultDate}: {result.drawDate} | {labels.resultDraw}: {result.drawNo || '-'}</div>
                <Link href={`/${locale}/history/${regionPathForProvider(result.providerCode, providers)}/${result.providerCode}/${result.drawDate}`} className="text-sm font-black text-blue-800 hover:text-blue-900">
                  {labels.openResult}
                </Link>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </section>
  );
}

function regionPathForProvider(providerCode: string, providers: ProviderConfig[]) {
  const known = new Set(providers.map((provider) => provider.code));
  if (!known.has(providerCode)) return 'west-malaysia';
  if (['magnum', 'sports_toto', 'da_ma_cai'].includes(providerCode)) return 'west-malaysia';
  if (['sabah88', 'sarawak', 'sandakan'].includes(providerCode)) return 'east-malaysia';
  if (['grand_dragon', 'nine_lotto'].includes(providerCode)) return 'cambodia';
  return 'singapore';
}

