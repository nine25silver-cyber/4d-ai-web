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
    ? '输入4位号码，自动生成千字图和万字图。'
    : locale === 'ms'
      ? 'Masukkan 4 digit untuk jana peta 3D dan 4D.'
      : 'Enter 4 digits to generate 3D and 4D number maps.';
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
        <p className="text-sm font-bold uppercase text-blue-800">{locale === 'zh' ? '号码图' : locale === 'ms' ? 'Peta nombor' : 'Number maps'}</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{locale === 'zh' ? '千字 / 万字图搜索' : locale === 'ms' ? 'Carian Peta 3D / 4D' : '3D / 4D Map Search'}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">
              {locale === 'zh'
                ? '输入 4 位号码即可自动生成千字图与万字图，方便快速对照。'
                : locale === 'ms'
                  ? 'Masukkan 4 digit dan sistem jana automatik peta 3D serta peta 4D.'
                  : 'Enter 4 digits to instantly generate both 3D and 4D map sets.'}
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{locale === 'zh' ? '快速工具' : locale === 'ms' ? 'Alat pantas' : 'Quick tool'}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {locale === 'zh'
                ? '无需等待后台统计，输入后立即出图。'
                : locale === 'ms'
                  ? 'Tanpa tunggu backend, hasil terus dipaparkan.'
                  : 'Instant generation without waiting for backend jobs.'}
            </p>
          </div>
        </div>
      </section>

      <DigitMapToolClient locale={locale} />
    </main>
  );
}
