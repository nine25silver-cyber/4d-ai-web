'use client';

import {useMemo, useState} from 'react';
import {useEffect} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import Link from 'next/link';
import {getCurrentUserEntitlement, type CurrentUserEntitlement} from '@/lib/member-entitlement';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type HitRow = {
  providerCode: string;
  providerName: string;
  drawDate: string;
  drawNo: string;
  prizeType?: PrizeType;
  prize: string;
  number: string;
};

type HitResponse = {
  resultCount: number;
  rows: HitRow[];
};

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
};

type Mode = 'exact' | 'boxed';
type PrizeType = 'first' | 'second' | 'third' | 'special' | 'consolation';

const prizeTypes: PrizeType[] = ['first', 'second', 'third', 'special', 'consolation'];

export function ThousandHitsToolClient({locale, providers}: Props) {
  const [target, setTarget] = useState('');
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<HitResponse | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [activeMode, setActiveMode] = useState<Mode>('exact');
  const [activePrizes, setActivePrizes] = useState<Set<PrizeType>>(() => new Set(prizeTypes));

  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );
  const providersByCode = useMemo(() => new Map(providers.map((provider) => [provider.code, provider])), [providers]);
  const normalizedRows = useMemo(() => data?.rows.map((row) => ({...row, prizeType: normalizePrizeType(row)})) ?? [], [data]);
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

  function toggle(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  async function runSearch(mode: Mode) {
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
    const clean = target.replace(/\D/g, '').slice(0, 3);
    if (clean.length !== 3) return;
    setValidationMessage(null);
    setActiveMode(mode);
    setStatus('loading');
    const params = new URLSearchParams({
      target: clean,
      mode,
      providers: Array.from(selected).join(',')
    });
    const response = await fetch(`/api/thousand-hits?${params.toString()}`, {cache: 'no-store'});
    if (!response.ok) {
      setStatus('error');
      setData(null);
      return;
    }
    setData((await response.json()) as HitResponse);
    setStatus('done');
  }

  function togglePrize(type: PrizeType) {
    setActivePrizes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }
  const canSearch = target.length === 3;
  const isFormalPro = entitlement?.source === 'user_membership_entitlements' && entitlement.isPro;
  const searchModeOptions: Array<{mode: Mode; label: string}> = [
    {mode: 'exact', label: locale === 'zh' ? '正千字' : locale === 'ms' ? 'Exact' : 'Exact'},
    {mode: 'boxed', label: locale === 'zh' ? '包字' : locale === 'ms' ? 'Boxed' : 'boxed'}
  ];

  useEffect(() => {
    let active = true;
    void getCurrentUserEntitlement().then((next) => {
      if (active) setEntitlement(next);
    });
    return () => {
      active = false;
    };
  }, []);

  function exportAsText() {
    if (!data || !isFormalPro) return;
    const header = locale === 'zh'
      ? '日期 | 公司 | 期号 | 奖项 | 号码'
      : locale === 'ms'
        ? 'Tarikh | Syarikat | Cabutan | Hadiah | Nombor'
        : 'Date | Company | Draw | Prize | Number';
    const lines = filteredRows.map((row) => `${row.drawDate || '-'} | ${row.providerName} | ${row.drawNo || '-'} | ${prizeLabel(row.prizeType, locale)} | ${row.number}`);
    const text = [header, ...lines].join('\n');
    void navigator.clipboard.writeText(text);
  }

  function exportAsCsv() {
    if (!data || !isFormalPro) return;
    const rows = [
      ['date', 'provider', 'draw_no', 'prize', 'number'],
      ...filteredRows.map((row) => [row.drawDate || '', row.providerName, row.drawNo || '', prizeLabel(row.prizeType, locale), row.number])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], {type: 'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thousand-hits-${target || 'result'}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const accessHint = locale === 'zh'
    ? {free: '免费版可搜索千字中奖记录。', pro: 'Pro 可复制结果与下载 CSV。'}
    : locale === 'ms'
      ? {free: 'Versi percuma boleh cari rekod kemenangan 3D.', pro: 'Pro boleh salin hasil dan muat turun CSV.'}
      : {free: 'Free users can search 3-digit hit records.', pro: 'Pro can copy results and download CSV.'};

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    const preset = (url.searchParams.get('target') ?? '').replace(/\D/g, '').slice(0, 3);
    if (preset.length !== 3) return;
    setTarget(preset);
    void runSearch('exact');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section className="mt-8 grid items-start gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-black text-slate-800">
          {locale === 'zh' ? '千字号码' : locale === 'ms' ? 'Nombor 3D' : '3-digit target'}
        </label>
        <div className="mt-2 grid gap-2">
          <input
            value={target}
            onChange={(event) => setTarget(event.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (canSearch) {
                  void runSearch('exact');
                }
              }
            }}
            placeholder={locale === 'zh' ? '例如 123' : locale === 'ms' ? 'Contoh 123' : 'e.g. 123'}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
          />
          <div className="grid grid-cols-2 gap-2">
            {searchModeOptions.map((item) => {
              const loading = status === 'loading' && activeMode === item.mode;
              const primary = item.mode === 'exact';
              return (
                <button
                  key={item.mode}
                  type="button"
                  disabled={!canSearch}
                  onClick={() => runSearch(item.mode)}
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
          {locale === 'zh' ? '仅支持输入3位数字' : locale === 'ms' ? 'Hanya 3 digit dibenarkan' : 'Only 3 digits are allowed'}
        </p>

        <h2 className="mt-5 text-sm font-black text-slate-800">{locale === 'zh' ? '请选择博彩公司' : locale === 'ms' ? 'Pilih syarikat' : 'Choose companies'}</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {providers.map((provider) => {
            const active = selected.has(provider.code);
            return (
              <button key={provider.code} type="button" onClick={() => toggle(provider.code)} className={`min-h-[70px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff]' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
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
        <div className="mt-5" />
      </section>

      <section className="grid self-start content-start gap-5">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
          <p>{accessHint.free}</p>
          <p className="mt-1">{accessHint.pro}</p>
        </div>
        {status === 'error' ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">{locale === 'zh' ? '千字记录暂时不可用。' : locale === 'ms' ? 'Rekod 3D belum tersedia.' : '3D records are unavailable right now.'}</div> : null}
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? `总中奖次数：${filteredRows.length}` : locale === 'ms' ? `Total wins: ${filteredRows.length}` : `Total wins: ${filteredRows.length}`}</h2>
            {isFormalPro ? (
              <div className="flex gap-2">
                <button type="button" onClick={exportAsText} disabled={!data} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100 disabled:opacity-50">
                  {locale === 'zh' ? '复制结果' : locale === 'ms' ? 'Salin hasil' : 'Copy results'}
                </button>
                <button type="button" onClick={exportAsCsv} disabled={!data} className="rounded-md border border-blue-700 bg-blue-800 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900 disabled:opacity-50">
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
              const topPrize = type === 'first' || type === 'second' || type === 'third';
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
              {locale === 'zh' ? '输入 3 位数字后，点击“正千字”或“包字”开始搜索。' : locale === 'ms' ? 'Masukkan 3 digit, kemudian tekan exact atau boxed untuk mula.' : 'Enter 3 digits, then run exact or boxed search.'}
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
                    <tr key={`${row.providerCode}-${row.drawDate}-${row.number}-${index}`} className="border-b border-slate-100">
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
                  {locale === 'zh' ? '当前筛选没有中奖记录。' : locale === 'ms' ? 'Tiada rekod untuk penapis semasa.' : 'No records for the current filters.'}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      </section>
    </section>
  );
}

function normalizePrizeType(row: HitRow): PrizeType {
  if (row.prizeType === 'first' || row.prizeType === 'second' || row.prizeType === 'third' || row.prizeType === 'special' || row.prizeType === 'consolation') {
    return row.prizeType;
  }
  const prize = row.prize.toLowerCase();
  if (prize.includes('special')) return 'special';
  if (prize.includes('consolation')) return 'consolation';
  if (prize.includes('2')) return 'second';
  if (prize.includes('3')) return 'third';
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
