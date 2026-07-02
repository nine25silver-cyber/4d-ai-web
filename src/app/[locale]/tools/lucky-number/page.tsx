import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {LuckyNumberToolClient} from '@/components/LuckyNumberToolClient';
import type {Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});
  return buildMetadata({
    locale,
    path: '/tools/lucky-number',
    title: t('luckyNumberMetaTitle'),
    description: t('luckyNumberMetaDescription')
  });
}

export default async function LuckyNumberToolPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});

  return (
    <main className="min-h-screen bg-[#f5f0e6] pb-12">
      <div className="mx-auto w-full max-w-[560px] px-5 pt-7 sm:px-6">
        <header className="mb-7 flex items-center gap-5">
          <Link
            href={`/${locale}/tools`}
            aria-label={t('backToTools')}
            className="flex h-10 w-10 items-center justify-center rounded-full text-4xl leading-none text-[#0d2340] hover:bg-white/70"
          >
            ‹
          </Link>
          <h1 className="text-3xl font-black leading-tight text-[#0d2340] sm:text-4xl">{t('luckyNumberTitle')}</h1>
        </header>

        <LuckyNumberToolClient
          copy={{
            fourDTitle: t('luckyNumberFourDTitle'),
            fourDDescription: t('luckyNumberFourDDescription'),
            sixDTitle: t('luckyNumberSixDTitle'),
            sixDDescription: t('luckyNumberSixDDescription'),
            jackpotTitle: t('luckyNumberJackpotTitle'),
            jackpotDescription: t('luckyNumberJackpotDescription'),
            spinButton: t('luckyNumberSpinButton'),
            saveButton: t('luckyNumberSaveButton'),
            savedButton: t('luckyNumberSavedButton'),
            addedMessage: t('luckyNumberAddedMessage'),
            duplicateMessage: t('luckyNumberDuplicateMessage'),
            fullMessage: t('luckyNumberFullMessage'),
            failedMessage: t('luckyNumberFailedMessage'),
            manageText: t('luckyNumberManageText')
          }}
        />
      </div>
    </main>
  );
}
