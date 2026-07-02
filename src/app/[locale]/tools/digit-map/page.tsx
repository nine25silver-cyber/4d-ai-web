import Link from 'next/link';
import type {Metadata} from 'next';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';
import {DigitMapToolClient} from '@/components/DigitMapToolClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const title = locale === 'zh' ? '千字 / 万字图搜索 - 4D AI' : locale === 'ms' ? 'Carian Peta 3D / 4D - 4D AI' : '3D / 4D Map Search - 4D AI';
  const description = locale === 'zh'
    ? '按梦境、关键词或号码搜索千字图与万字图。'
    : locale === 'ms'
      ? 'Cari peta 3D dan 4D mengikut mimpi, kata kunci atau nombor.'
      : 'Search 3D and 4D maps by dream, keyword, or number.';
  return buildMetadata({locale, path: '/tools/digit-map', title, description});
}

export default async function DigitMapPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">
        {locale === 'zh' ? '返回工具' : locale === 'ms' ? 'Kembali ke alat' : 'Back to tools'}
      </Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{locale === 'zh' ? '千字 / 万字图搜索' : locale === 'ms' ? 'Carian Peta 3D / 4D' : '3D / 4D Map Search'}</h1>
      </section>

      <DigitMapToolClient locale={locale} />
    </main>
  );
}
