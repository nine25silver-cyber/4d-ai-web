import Link from 'next/link';
import type {Locale} from '@/i18n/routing';
import {regions} from '@/lib/providers';

export function RegionNav({locale, active}: {locale: Locale; active?: string}) {
  return (
    <div className="flex flex-wrap gap-2">
      {regions.map((region) => (
        <Link
          key={region.slug}
          href={`/${locale}/results/${region.slug}`}
          className={`rounded-md border px-3 py-2 text-sm font-bold ${
            active === region.slug
              ? 'border-blue-500 bg-blue-50 text-blue-900 ring-1 ring-blue-200'
              : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50'
          }`}
        >
          {region.label}
        </Link>
      ))}
    </div>
  );
}

