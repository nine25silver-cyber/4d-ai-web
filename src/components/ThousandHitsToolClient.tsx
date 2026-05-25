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

type Mode = 'exact';

export function ThousandHitsToolClient({locale, providers}: Props) {
  const [target, setTarget] = useState('');
  const [entitlement, setEntitlement] = useState<CurrentUserEntitlement | null>(null);
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<HitResponse | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );

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
            : 'Please choose at least one provider to search.'
      );
      return;
    }
    const clean = target.replace(/\D/g, '').slice(0, 3);
    if (clean.length !== 3) return;
    setValidationMessage(null);
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
  const canSearch = target.length === 3;
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

  function exportAsText() {
    if (!data || !isFormalPro) return;
    const header = locale === 'zh'
      ? '日期 | Provider | 期号 | 奖项 | 号码'
      : locale === 'ms'
        ? 'Tarikh | Provider | Cabutan | Hadiah | Nombor'
        : 'Date | Provider | Draw | Prize | Number';
    const lines = data.rows.map((row) => `${row.drawDate || '-'} | ${row.providerName} | ${row.drawNo || '-'} | ${row.prize} | ${row.number}`);
    const text = [header, ...lines].join('\n');
    void navigator.clipboard.writeText(text);
  }

  function exportAsCsv() {
    if (!data || !isFormalPro) return;
    const rows = [
      ['date', 'provider', 'draw_no', 'prize', 'number'],
      ...data.rows.map((row) => [row.drawDate || '', row.providerName, row.drawNo || '', row.prize, row.number])
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
        <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
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
          <button type="button" disabled={!canSearch} onClick={() => runSearch('exact')} className="rounded-md border border-blue-700 bg-blue-800 px-5 py-2 text-sm font-black text-white hover:bg-blue-900 disabled:opacity-50">
            {status === 'loading' ? (locale === 'zh' ? '搜索中...' : locale === 'ms' ? 'Sedang cari...' : 'Searching...') : (locale === 'zh' ? '搜索' : locale === 'ms' ? 'Cari' : 'Search')}
          </button>
        </div>
        {validationMessage ? (
          <p className="mt-2 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-800">
            {validationMessage}
          </p>
        ) : null}
        <p className="mt-2 text-xs font-black text-blue-800">
          {locale === 'zh' ? '仅支持输入3位数字' : locale === 'ms' ? 'Hanya 3 digit dibenarkan' : 'Only 3 digits are allowed'}
        </p>

        <h2 className="mt-5 text-sm font-black text-slate-800">{locale === 'zh' ? '请选择博彩公司' : locale === 'ms' ? 'Pilih provider' : 'Choose providers'}</h2>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {providers.map((provider) => {
            const active = selected.has(provider.code);
            return (
              <button key={provider.code} type="button" onClick={() => toggle(provider.code)} className={`min-h-[70px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff]' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}>
                <ProviderLogoBadge provider={provider} active={active} />
                <span className="mt-2 block text-xs font-black leading-4 text-slate-900">{provider.name}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs font-semibold text-slate-500">
          {locale === 'zh' ? '已选择 provider' : locale === 'ms' ? 'Provider dipilih' : 'Selected providers'}: <span className="text-slate-800">{selectedNames || '-'}</span>
        </p>
        <div className="mt-5" />
      </section>

      <section className="grid self-start content-start gap-5">
        <div className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-900">
          <p>{accessHint.free}</p>
          <p className="mt-1">{accessHint.pro}</p>
        </div>
        {status === 'idle' ? <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">{locale === 'zh' ? '输入 3 位数字后，点击“正千字”开始搜索。' : locale === 'ms' ? 'Masukkan 3 digit, kemudian tekan carian untuk mula.' : 'Enter 3 digits, then run search.'}</div> : null}
        {status === 'error' ? <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 text-sm font-bold text-amber-800">{locale === 'zh' ? '千字记录暂时不可用。' : locale === 'ms' ? 'Rekod 3D belum tersedia.' : '3D records are unavailable right now.'}</div> : null}
        {data ? (
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? `命中记录 (${data.resultCount})` : locale === 'ms' ? `Rekod padanan (${data.resultCount})` : `Matched records (${data.resultCount})`}</h2>
              {isFormalPro ? (
                <div className="flex gap-2">
                  <button type="button" onClick={exportAsText} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-800 hover:bg-slate-100">
                    {locale === 'zh' ? '复制结果' : locale === 'ms' ? 'Salin hasil' : 'Copy results'}
                  </button>
                  <button type="button" onClick={exportAsCsv} className="rounded-md border border-blue-700 bg-blue-800 px-3 py-1.5 text-xs font-black text-white hover:bg-blue-900">
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
            <div className="mt-4 overflow-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-black uppercase text-slate-500">
                    <th className="px-2 py-2">{locale === 'zh' ? '日期' : locale === 'ms' ? 'Tarikh' : 'Date'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? 'Provider' : 'Provider'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '期号' : locale === 'ms' ? 'Cabutan' : 'Draw'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '奖项' : locale === 'ms' ? 'Hadiah' : 'Prize'}</th>
                    <th className="px-2 py-2">{locale === 'zh' ? '号码' : locale === 'ms' ? 'Nombor' : 'Number'}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, index) => (
                    <tr key={`${row.providerCode}-${row.drawDate}-${row.number}-${index}`} className="border-b border-slate-100">
                      <td className="px-2 py-2 font-bold text-slate-700">{row.drawDate || '-'}</td>
                      <td className="px-2 py-2">{row.providerName}</td>
                      <td className="px-2 py-2">{row.drawNo || '-'}</td>
                      <td className="px-2 py-2">{row.prize}</td>
                      <td className="px-2 py-2 font-black text-slate-950">{row.number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </section>
    </section>
  );
}
