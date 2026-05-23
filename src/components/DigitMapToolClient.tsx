'use client';

import Link from 'next/link';
import {useMemo, useState} from 'react';
import type {Locale} from '@/i18n/routing';

type Props = {
  locale: Locale;
};

function permutations(input: string) {
  const chars = input.split('');
  const results = new Set<string>();
  const used = Array(chars.length).fill(false);
  const path: string[] = [];
  function walk() {
    if (path.length === chars.length) {
      results.add(path.join(''));
      return;
    }
    for (let i = 0; i < chars.length; i += 1) {
      if (used[i]) continue;
      used[i] = true;
      path.push(chars[i]);
      walk();
      path.pop();
      used[i] = false;
    }
  }
  walk();
  return Array.from(results).sort();
}

function thousandMap(input: string) {
  if (input.length !== 4) return [];
  const rows = [
    input.slice(0, 3),
    input.slice(1, 4),
    `${input[0]}${input[2]}${input[3]}`,
    `${input[0]}${input[1]}${input[3]}`
  ];
  return Array.from(new Set(rows));
}

export function DigitMapToolClient({locale}: Props) {
  const [target, setTarget] = useState('');
  const [submittedTarget, setSubmittedTarget] = useState('');
  const digitsOnly = submittedTarget.replace(/\D/g, '');
  const clean = digitsOnly.slice(0, 4);
  const isThreeDigits = clean.length === 3;
  const isFourDigits = clean.length === 4;

  const thousandRows = useMemo(() => {
    if (isFourDigits) return thousandMap(clean);
    if (isThreeDigits) return permutations(clean);
    return [];
  }, [clean, isFourDigits, isThreeDigits]);
  const wanRows = useMemo(() => (isFourDigits ? permutations(clean) : []), [clean, isFourDigits]);
  const normalizedHint = locale === 'zh'
    ? `识别到：${clean || '-'}`
    : locale === 'ms'
      ? `Dikesan: ${clean || '-'}`
      : `Detected: ${clean || '-'}`;
  const isSearching = submittedTarget.trim().length > 0;

  return (
    <section className="mt-8 grid gap-5">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-black text-slate-800">
          {locale === 'zh' ? '输入4位号码' : locale === 'ms' ? 'Masukkan 4 digit' : 'Enter 4 digits'}
          <div className="mt-2 grid w-full max-w-sm grid-cols-[1fr_auto] gap-2">
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  setSubmittedTarget(target);
                }
              }}
              placeholder={locale === 'zh' ? '可输入 123 / 1234 / 测试1234' : locale === 'ms' ? 'Masukkan 123 / 1234 / teks1234' : 'Try 123 / 1234 / text1234'}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
            />
            <button
              type="button"
              onClick={() => setSubmittedTarget(target)}
              className="rounded-md border border-blue-700 bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900"
            >
              {locale === 'zh' ? '搜索' : locale === 'ms' ? 'Cari' : 'Search'}
            </button>
          </div>
        </label>
        <p className="mt-2 text-xs font-black text-blue-800">{isSearching ? normalizedHint : (locale === 'zh' ? '尚未搜索' : locale === 'ms' ? 'Belum cari' : 'Not searched yet')}</p>
        <p className="mt-2 text-xs font-semibold text-slate-500">
          {locale === 'zh'
            ? '支持3位数/4位数/文字输入；会自动提取数字后生成结果。'
            : locale === 'ms'
              ? 'Sokong input 3 digit / 4 digit / teks; digit akan diekstrak automatik.'
              : 'Supports 3-digit, 4-digit, or text input; digits are extracted automatically.'}
        </p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? '千字图' : locale === 'ms' ? 'Peta 3D' : '3D Map'}</h2>
        {!isSearching ? (
          <p className="mt-3 text-sm text-slate-600">{locale === 'zh' ? '输入后点击“搜索”开始。' : locale === 'ms' ? 'Masukkan nilai dan tekan Cari.' : 'Enter a value and press Search.'}</p>
        ) : !(isThreeDigits || isFourDigits) ? (
          <p className="mt-3 text-sm text-slate-600">{locale === 'zh' ? '请输入3位或4位号码。' : locale === 'ms' ? 'Sila masukkan 3 atau 4 digit.' : 'Please enter 3 or 4 digits.'}</p>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {thousandRows.map((value) => (
              <Link
                key={value}
                href={`/${locale}/tools/thousand-hits?target=${value}`}
                className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-center text-lg font-black text-blue-900 hover:bg-blue-100"
              >
                {value}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-black text-slate-950">{locale === 'zh' ? '万字图' : locale === 'ms' ? 'Peta 4D' : '4D Map'}</h2>
        {!isSearching ? (
          <p className="mt-3 text-sm text-slate-600">{locale === 'zh' ? '输入后点击“搜索”开始。' : locale === 'ms' ? 'Masukkan nilai dan tekan Cari.' : 'Enter a value and press Search.'}</p>
        ) : !isFourDigits ? (
          <p className="mt-3 text-sm text-slate-600">{locale === 'zh' ? '输入4位号码可生成万字图。' : locale === 'ms' ? 'Masukkan 4 digit untuk jana peta 4D.' : 'Enter 4 digits to generate 4D map.'}</p>
        ) : (
          <>
            <p className="mt-3 text-sm font-bold text-slate-700">{locale === 'zh' ? `总数: ${wanRows.length}` : locale === 'ms' ? `Jumlah: ${wanRows.length}` : `Total: ${wanRows.length}`}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
              {wanRows.map((value) => (
                <div key={value} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-black text-slate-900">{value}</div>
              ))}
            </div>
          </>
        )}
      </section>
    </section>
  );
}
