'use client';

import {useCallback, useEffect, useMemo, useState} from 'react';
import type {Locale} from '@/i18n/routing';
import type {ProviderConfig} from '@/lib/providers';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type RankingRow = {
  boxed: string;
  count: number;
  latestDate: string;
  sampleNumbers: string[];
  providers: string[];
  groupType: '24' | '12' | '6' | '4';
};

type RankingResponse = {
  drawCount: number;
  numberCount: number;
  rankings: RankingRow[];
};

type Props = {
  locale: Locale;
  providers: ProviderConfig[];
};

type Range = '1y' | '2y' | '3y' | '5y' | '10y' | '15y' | '20y' | '30y' | 'all';
type PrizeFilter = 'all' | 'top3' | 'special' | 'consolation';
type TrendMode = 'hot' | 'cold';

export function PackageRankingToolClient({locale, providers}: Props) {
  const [range, setRange] = useState<Range>('1y');
  const [selected, setSelected] = useState(() => new Set(providers.map((provider) => provider.code)));
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<RankingResponse | null>(null);
  const [groupFilter, setGroupFilter] = useState<'all' | '24' | '12' | '6' | '4'>('all');
  const [trendMode, setTrendMode] = useState<TrendMode>('hot');
  const [prizeFilter, setPrizeFilter] = useState<PrizeFilter>('all');
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );
  const filteredRows = useMemo(() => {
    if (!data) return [];
    if (groupFilter === 'all') return data.rankings;
    return data.rankings.filter((row) => row.groupType === groupFilter);
  }, [data, groupFilter]);

  function toggle(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }

  const runRanking = useCallback(async () => {
    setStatus('loading');
    const params = new URLSearchParams({
      range,
      mode: trendMode,
      prize: prizeFilter,
      providers: Array.from(selected).join(',')
    });
    const response = await fetch(`/api/package-ranking?${params.toString()}`, {cache: 'no-store'});
    if (!response.ok) {
      setStatus('error');
      setData(null);
      return;
    }
    setData((await response.json()) as RankingResponse);
    setStatus('done');
    setHasLoadedOnce(true);
  }, [prizeFilter, range, selected, trendMode]);

  useEffect(() => {
    if (!hasLoadedOnce) return;
    void runRanking();
  }, [hasLoadedOnce, prizeFilter, range, runRanking, selected, trendMode]);

  const ranges: Array<{value: Range; label: string}> = [
    {value: '1y', label: locale === 'zh' ? '1年' : locale === 'ms' ? '1 tahun' : '1 year'},
    {value: '2y', label: locale === 'zh' ? '2年' : locale === 'ms' ? '2 tahun' : '2 years'},
    {value: '3y', label: locale === 'zh' ? '3年' : locale === 'ms' ? '3 tahun' : '3 years'},
    {value: '5y', label: locale === 'zh' ? '5年' : locale === 'ms' ? '5 tahun' : '5 years'},
    {value: '10y', label: locale === 'zh' ? '10年' : locale === 'ms' ? '10 tahun' : '10 years'},
    {value: '15y', label: locale === 'zh' ? '15年' : locale === 'ms' ? '15 tahun' : '15 years'},
    {value: '20y', label: locale === 'zh' ? '20年' : locale === 'ms' ? '20 tahun' : '20 years'},
    {value: '30y', label: locale === 'zh' ? '30年' : locale === 'ms' ? '30 tahun' : '30 years'},
    {value: 'all', label: locale === 'zh' ? '从开彩至今' : locale === 'ms' ? 'Dari cabutan pertama' : 'From first draw'}
  ];

  const prizeOptions: Array<{value: PrizeFilter; label: string}> = [
    {value: 'all', label: locale === 'zh' ? '全部奖项' : locale === 'ms' ? 'Semua hadiah' : 'All prizes'},
    {value: 'top3', label: locale === 'zh' ? '头二三奖' : locale === 'ms' ? 'Top 3 hadiah' : 'Top 3'},
    {value: 'special', label: locale === 'zh' ? '特别奖' : locale === 'ms' ? 'Hadiah khas' : 'Special'},
    {value: 'consolation', label: locale === 'zh' ? '安慰奖' : locale === 'ms' ? 'Hadiah saguhati' : 'Consolation'}
  ];

  return (
    <section className="mt-8 grid gap-5 xl:grid-cols-[420px_1fr]">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '时间范围' : locale === 'ms' ? 'Julat masa' : 'Time range'}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {ranges.map((item) => {
            const active = range === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => setRange(item.value)}
                className={`min-h-[42px] rounded-md border px-2 py-2 text-sm font-black transition ${active ? 'border-blue-700 bg-blue-800 text-white shadow-sm' : 'border-slate-300 bg-white text-slate-800 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <section className="mt-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '选择 Provider' : locale === 'ms' ? 'Pilih provider' : 'Choose providers'}</h2>
              <p className="mt-1 text-xs font-semibold text-slate-500">{locale === 'zh' ? '可一次选择多个 provider' : locale === 'ms' ? 'Boleh pilih beberapa provider sekali gus' : 'Select multiple providers at once'}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setSelected(new Set(providers.map((provider) => provider.code)))} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
                {locale === 'zh' ? '全选' : locale === 'ms' ? 'Pilih semua' : 'Select all'}
              </button>
              <button type="button" onClick={() => setSelected(new Set())} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
                {locale === 'zh' ? '清空' : locale === 'ms' ? 'Kosongkan' : 'Clear all'}
              </button>
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
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
          <p className="mt-3 text-xs font-semibold text-slate-500">
            {locale === 'zh' ? '已选择 provider' : locale === 'ms' ? 'Provider dipilih' : 'Selected providers'}: <span className="text-slate-800">{selectedNames || '-'}</span>
          </p>
        </section>

        <section className="mt-5">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '冷热模式' : locale === 'ms' ? 'Mod trend' : 'Trend mode'}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setTrendMode('hot')}
              className={`rounded-md border px-3 py-1.5 text-xs font-black ${trendMode === 'hot' ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}
            >
              {locale === 'zh' ? '最热门' : locale === 'ms' ? 'Paling panas' : 'Hottest'}
            </button>
            <button
              type="button"
              onClick={() => setTrendMode('cold')}
              className={`rounded-md border px-3 py-1.5 text-xs font-black ${trendMode === 'cold' ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}
            >
              {locale === 'zh' ? '最冷门' : locale === 'ms' ? 'Paling sejuk' : 'Coldest'}
            </button>
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '奖项范围' : locale === 'ms' ? 'Skop hadiah' : 'Prize scope'}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {prizeOptions.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setPrizeFilter(item.value)}
                className={`rounded-md border px-3 py-1.5 text-xs font-black ${prizeFilter === item.value ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-4">
          <h2 className="text-sm font-black text-slate-800">{locale === 'zh' ? '包字类型' : locale === 'ms' ? 'Jenis boxed' : 'Boxed type'}</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {(['all', '24', '12', '6', '4'] as const).map((item) => {
              const active = groupFilter === item;
              const label = item === 'all'
                ? (locale === 'zh' ? '全部' : locale === 'ms' ? 'Semua' : 'All')
                : locale === 'zh'
                  ? `${item}包`
                  : locale === 'ms'
                    ? `Kumpulan ${item}`
                    : `${item}-group`;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGroupFilter(item)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-black ${active ? 'border-blue-700 bg-blue-800 text-white' : 'border-slate-300 bg-white text-slate-800 hover:bg-blue-50'}`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <button type="button" onClick={runRanking} className="mt-5 w-full rounded-md border border-blue-700 bg-blue-800 px-4 py-3 text-sm font-black text-white hover:bg-blue-900">
          {status === 'loading' ? (locale === 'zh' ? '统计中...' : locale === 'ms' ? 'Sedang kira...' : 'Calculating...') : (locale === 'zh' ? '统计包字排行榜' : locale === 'ms' ? 'Kira ranking boxed' : 'Calculate boxed ranking')}
        </button>
      </section>

      <section className="grid gap-5">
        {status === 'idle' ? <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm leading-6 text-slate-600 shadow-sm">{locale === 'zh' ? '选择范围与 provider 后开始统计。' : locale === 'ms' ? 'Pilih julat dan provider, kemudian mula kira.' : 'Choose range and providers, then start calculation.'}</div> : null}
        {status === 'error' ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">{locale === 'zh' ? '包字排行榜暂时不可用。' : locale === 'ms' ? 'Ranking boxed belum tersedia.' : 'Boxed ranking is unavailable right now.'}</div> : null}
        {data ? (
          <>
            <div className="grid gap-3 md:grid-cols-3">
              <SummaryCard title={locale === 'zh' ? '已扫描期数' : locale === 'ms' ? 'Cabutan discan' : 'Draws scanned'} value={`${data.drawCount}`} />
              <SummaryCard title={locale === 'zh' ? '已扫描号码' : locale === 'ms' ? 'Nombor discan' : 'Numbers scanned'} value={`${data.numberCount}`} />
              <SummaryCard title={locale === 'zh' ? '包字条目' : locale === 'ms' ? 'Entri boxed' : 'Boxed entries'} value={`${data.rankings.length}`} />
            </div>
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? '包字排行榜（Top 100）' : locale === 'ms' ? 'Ranking Boxed (Top 100)' : 'Boxed Ranking (Top 100)'}</h2>
              <div className="mt-4 space-y-2">
                {filteredRows.map((row, index) => (
                  <div key={`${row.boxed}-${index}`} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-lg font-black text-slate-950">#{index + 1} {row.boxed}</div>
                      <div className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black text-blue-800">{locale === 'zh' ? `${row.groupType}包` : locale === 'ms' ? `Kumpulan ${row.groupType}` : `${row.groupType}-group`}</div>
                    </div>
                    <div className="mt-1 text-sm font-bold text-slate-700">{locale === 'zh' ? `出现 ${row.count} 次` : locale === 'ms' ? `${row.count} kali` : `${row.count} hits`}</div>
                    <div className="mt-1 text-xs text-slate-500">{locale === 'zh' ? `最近日期: ${row.latestDate || '-'}` : locale === 'ms' ? `Tarikh terkini: ${row.latestDate || '-'}` : `Latest date: ${row.latestDate || '-'}`}</div>
                    <div className="mt-1 text-xs text-slate-500">{locale === 'zh' ? `样本号码: ${row.sampleNumbers.join(', ') || '-'}` : locale === 'ms' ? `Contoh nombor: ${row.sampleNumbers.join(', ') || '-'}` : `Sample numbers: ${row.sampleNumbers.join(', ') || '-'}`}</div>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}
      </section>
    </section>
  );
}

function SummaryCard({title, value}: {title: string; value: string}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-black uppercase text-blue-800">{title}</div>
      <div className="mt-2 text-2xl font-black text-slate-950">{value}</div>
    </div>
  );
}

