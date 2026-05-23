import Link from 'next/link';
import type {Metadata} from 'next';
import {getTranslations} from 'next-intl/server';
import {FavoritesToolClient} from '@/components/FavoritesToolClient';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});
  return buildMetadata({locale, path: '/tools/favorites', title: t('favoritesMetaTitle'), description: t('favoritesMetaDescription')});
}

export default async function FavoritesToolPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const t = await getTranslations({locale, namespace: 'Tools'});

  return (
    <main className="container-shell py-10">
      <Link href={`/${locale}/tools`} className="text-sm font-bold text-blue-800 hover:text-blue-900">{t('backToTools')}</Link>

      <section className="mt-4 border-b border-slate-200 pb-8">
        <p className="text-sm font-bold uppercase text-blue-800">{t('favoritesEyebrow')}</p>
        <div className="mt-2 grid gap-5 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <h1 className="text-3xl font-black text-slate-950 sm:text-4xl">{t('favoritesPageTitle')}</h1>
            <p className="mt-4 max-w-3xl text-slate-600">{t('favoritesPageIntro')}</p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="text-xs font-black uppercase text-blue-800">{t('favoritesLocalTitle')}</div>
            <p className="mt-2 text-sm leading-6 text-slate-700">{t('favoritesLocalText')}</p>
          </div>
        </div>
      </section>

      <FavoritesToolClient
        labels={{
          categoriesTitle: t('favoriteCategoriesTitle'),
          savedTitle: t('favoritesSavedTitle'),
          addButton: t('favoriteAddButton'),
          clearButton: t('favoriteClearButton'),
          clearConfirm: t('favoriteClearConfirm'),
          inputLabel: t('favoriteInputLabel'),
          packageTypeLabel: t('favoritePackageTypeLabel'),
          lottoInputLabel: t('favoriteLottoInputLabel'),
          saveButton: t('favoriteSaveButton'),
          cancelButton: t('favoriteCancelButton'),
          duplicateText: t('favoriteDuplicateText'),
          limitText: t('favoriteLimitText'),
          invalidText: t('favoriteInvalidText'),
          emptyText: t('favoritesEmptyText'),
          savedText: t('favoriteSavedText'),
          deleteButton: t('favoriteDeleteButton'),
          syncNoteTitle: t('favoritesSyncNoteTitle'),
          syncNoteText: t('favoritesSyncNoteText')
        }}
      />
    </main>
  );
}
