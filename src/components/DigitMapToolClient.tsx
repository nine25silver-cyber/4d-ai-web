'use client';

import {useState} from 'react';
import type {Locale} from '@/i18n/routing';

type MapTextSection = {
  labelEn: string;
  labelZh: string;
  keywordsZh: string[];
  keywordsEn: string[];
};

type MapEntry = {
  number: string;
  imageUrl: string;
  keywordsZh: string[];
  keywordsEn: string[];
  source: string;
  sections: MapTextSection[];
};

type DigitMapResponse = {
  query: string;
  entries: MapEntry[];
  count: number;
};

type Props = {
  locale: Locale;
};

export function DigitMapToolClient({locale}: Props) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [data, setData] = useState<DigitMapResponse | null>(null);

  const canSearch = query.trim().length > 0;

  async function runSearch() {
    const clean = query.trim();
    if (!clean) {
      setStatus('idle');
      setData(null);
      return;
    }

    setStatus('loading');
    setData(null);

    try {
      const params = new URLSearchParams({query: clean});
      const response = await fetch(`/api/digit-map?${params.toString()}`, {cache: 'no-store'});
      if (!response.ok) {
        setStatus('error');
        setData(null);
        return;
      }

      setData((await response.json()) as DigitMapResponse);
      setStatus('done');
    } catch {
      setStatus('error');
      setData(null);
    }
  }

  return (
    <section className="mt-8 grid gap-5 lg:grid-cols-[420px_1fr] lg:items-start">
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <label className="text-sm font-black text-slate-800">
          {locale === 'zh' ? '梦境、关键词或号码' : locale === 'ms' ? 'Mimpi, kata kunci atau nombor' : 'Dream, keyword, or number'}
        </label>
        <div className="mt-2 flex gap-2">
          <input
            value={query}
            maxLength={32}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                if (canSearch && status !== 'loading') void runSearch();
              }
            }}
            placeholder={locale === 'zh' ? '例如 1234 / 龙 / 发财' : locale === 'ms' ? 'Contoh 1234 / naga' : 'e.g. 1234 / dragon'}
            className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm font-bold text-slate-900 outline-none focus:border-blue-500"
          />
          <button
            type="button"
            disabled={!canSearch || status === 'loading'}
            onClick={() => runSearch()}
            className="min-w-[84px] rounded-md border border-blue-700 bg-blue-800 px-4 py-2 text-sm font-black text-white hover:bg-blue-900 disabled:opacity-50"
          >
            {status === 'loading' ? (locale === 'zh' ? '搜索中...' : locale === 'ms' ? 'Mencari...' : 'Searching...') : locale === 'zh' ? '搜索' : locale === 'ms' ? 'Cari' : 'Search'}
          </button>
        </div>
        <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
          {locale === 'zh'
            ? '输入梦境、关键词或号码进行搜索'
            : locale === 'ms'
              ? 'Cari mengikut mimpi, kata kunci atau nombor.'
              : 'Search by dream, keyword or number.'}
        </p>
      </section>

      <section className="grid gap-4">
        {status === 'idle' ? (
          <StateCard
            title={locale === 'zh' ? '输入梦境、关键词或号码' : locale === 'ms' ? 'Masukkan mimpi, kata kunci atau nombor' : 'Enter a dream, keyword, or number'}
            subtitle={locale === 'zh' ? '支持中文、英文关键词，以及 3 位或 4 位号码。' : locale === 'ms' ? 'Menyokong kata kunci Cina dan Inggeris, serta nombor 3D atau 4D.' : 'Supports Chinese and English keywords, plus 3D or 4D numbers.'}
          />
        ) : null}

        {status === 'error' ? (
          <StateCard
            tone="warning"
            title={locale === 'zh' ? '搜索失败，请稍后再试。' : locale === 'ms' ? 'Carian gagal. Sila cuba lagi nanti.' : 'Search failed. Please try again later.'}
          />
        ) : null}

        {status === 'done' && data ? (
          <>
            <p className="px-1 text-sm font-black text-slate-600">
              {locale === 'zh'
                ? `找到 ${data.count} 个相关号码`
                : locale === 'ms'
                  ? `${data.count} nombor berkaitan ditemui`
                  : `Found ${data.count} related numbers`}
            </p>
            {data.entries.length > 0 ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {data.entries.map((entry) => (
                  <MapResultCard key={`${entry.number}-${entry.source}`} entry={entry} locale={locale} />
                ))}
              </div>
            ) : (
              <StateCard
                title={locale === 'zh' ? '没有找到相关号码' : locale === 'ms' ? 'Tiada nombor berkaitan ditemui' : 'No related numbers found'}
                subtitle={locale === 'zh' ? `关键词：${data.query}` : locale === 'ms' ? `Kata kunci: ${data.query}` : `Keyword: ${data.query}`}
              />
            )}
          </>
        ) : null}
      </section>
    </section>
  );
}

function MapResultCard({entry, locale}: {entry: MapEntry; locale: Locale}) {
  const sections = entry.sections.filter((item) => item.keywordsZh.length > 0 || item.keywordsEn.length > 0);
  const zhText = compact(entry.keywordsZh, 10);
  const enText = compact(entry.keywordsEn, 8);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-2xl font-black leading-none text-slate-950">{entry.number}</div>
          {entry.source ? <p className="mt-2 text-[11px] font-black uppercase text-blue-800">{entry.source}</p> : null}
        </div>
        {entry.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={entry.imageUrl} alt={entry.number} className="size-16 rounded-md border border-slate-200 bg-slate-50 object-cover" loading="lazy" />
        ) : null}
      </div>

      {sections.length > 0 ? (
        <div className="mt-4 grid gap-2">
          {sections.map((section) => (
            <MapTextBlock key={`${entry.number}-${section.labelEn}-${section.labelZh}`} text={section} locale={locale} />
          ))}
        </div>
      ) : (
        <div className="mt-4">
          {zhText ? <p className="text-sm font-bold leading-5 text-slate-800">{zhText}</p> : null}
          {enText ? <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{enText}</p> : null}
          {!zhText && !enText ? (
            <p className="text-sm font-bold text-slate-500">
              {locale === 'zh' ? '暂无解说' : locale === 'ms' ? 'Tiada penjelasan tersedia' : 'No explanation available'}
            </p>
          ) : null}
        </div>
      )}
    </article>
  );
}

function MapTextBlock({text, locale}: {text: MapTextSection; locale: Locale}) {
  const zhText = compact(text.keywordsZh, 4);
  const enText = compact(text.keywordsEn, 4);
  const label = locale === 'zh' ? `${text.labelZh} ${text.labelEn}` : `${text.labelEn} ${text.labelZh}`;

  return (
    <section className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <h3 className="truncate text-xs font-black text-slate-800">{label}</h3>
      {zhText ? <p className="mt-1 text-sm font-bold leading-5 text-slate-800">{zhText}</p> : null}
      {enText ? <p className="mt-1 text-xs font-semibold leading-5 text-slate-500">{enText}</p> : null}
    </section>
  );
}

function StateCard({title, subtitle, tone = 'neutral'}: {title: string; subtitle?: string; tone?: 'neutral' | 'warning'}) {
  const warning = tone === 'warning';
  return (
    <div className={`rounded-lg border p-5 text-sm shadow-sm ${warning ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-slate-200 bg-white text-slate-600'}`}>
      <p className="font-black">{title}</p>
      {subtitle ? <p className="mt-2 font-semibold leading-5">{subtitle}</p> : null}
    </div>
  );
}

function compact(values: string[], limit: number) {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))).slice(0, limit).join(' / ');
}
