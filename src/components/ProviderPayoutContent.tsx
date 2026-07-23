import Link from 'next/link';
import type {Locale} from '@/i18n/routing';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';
import {cellText, getPayoutProvider, providerPayoutPages, type ProviderPayoutPage} from '@/lib/provider-payouts';

const copy = {
  en: {
    eyebrow: 'Provider Payout Structure',
    dataNoteTitle: 'Information note',
    gamesTitle: 'Games on this page',
    tableScroll: 'Scroll sideways on smaller screens to view every payout column.',
    officialDisclaimerTitle: 'Official-results and payout disclaimer',
    officialDisclaimer: 'This page is provided for general information. Game rules, payout amounts and jackpot arrangements may change. Check the relevant provider latest official information before making any decision. 4D AI does not guarantee that every figure remains current and does not guarantee any betting outcome.',
    verificationTitle: 'Verification notice',
    verificationText: 'Please verify game rules, payout amounts and jackpot arrangements with the provider\'s latest official publication.',
    backToAbout: 'About 4D AI',
    providerIndex: 'Provider pages'
  },
  zh: {
    eyebrow: 'Provider 派彩结构',
    dataNoteTitle: '资料说明',
    gamesTitle: '本页游戏',
    tableScroll: '手机上可左右滑动表格，查看所有派彩栏位。',
    officialDisclaimerTitle: '官方结果与派彩免责声明',
    officialDisclaimer: '本页面资料用于一般资讯参考。游戏规则、派彩金额及奖池安排可能调整，请在作出任何决定前查阅相关 Provider 的最新官方资料。4D AI 不保证资料持续保持最新，也不保证任何投注结果。',
    verificationTitle: '资料核对提示',
    verificationText: '请以相关 Provider 最新官方公布的游戏规则、派彩金额及奖池安排为准。',
    backToAbout: '关于 4D AI',
    providerIndex: 'Provider 页面'
  },
  ms: {
    eyebrow: 'Struktur Bayaran Hadiah Provider',
    dataNoteTitle: 'Nota maklumat',
    gamesTitle: 'Permainan di halaman ini',
    tableScroll: 'Tatal ke sisi pada skrin kecil untuk melihat semua lajur bayaran.',
    officialDisclaimerTitle: 'Penafian keputusan rasmi dan bayaran',
    officialDisclaimer: 'Halaman ini disediakan untuk maklumat umum. Peraturan permainan, jumlah bayaran hadiah dan aturan jackpot mungkin berubah. Semak maklumat rasmi terkini penyedia berkaitan sebelum membuat sebarang keputusan. 4D AI tidak menjamin setiap angka kekal terkini dan tidak menjamin apa-apa keputusan pertaruhan.',
    verificationTitle: 'Notis pengesahan',
    verificationText: 'Sila semak peraturan permainan, jumlah bayaran hadiah dan aturan jackpot berdasarkan penerbitan rasmi terkini daripada penyedia berkaitan.',
    backToAbout: 'Tentang 4D AI',
    providerIndex: 'Halaman provider'
  }
} as const;

const guideGameAnchorIds: Record<string, string> = {
  '4D': 'game-4d',
  '4D Permutation': 'game-4d-permutation',
  '4D Jackpot': 'game-4d-jackpot',
  '4D Jackpot M-System': 'game-jackpot-m-system',
  '4D Gold Jackpot': 'game-gold-jackpot',
  '4D Jackpot Powerball': 'game-jackpot-powerball',
  'Jackpot M-System': 'game-jackpot-m-system',
  'Gold Jackpot': 'game-gold-jackpot',
  'Jackpot Powerball': 'game-jackpot-powerball',
  '3D': 'game-3d',
  '1+3D': 'game-1-plus-3d',
  '1+3D Permutation': 'game-1-plus-3d-permutation',
  'Super 1+3D': 'game-super-1-plus-3d',
  'Super 1+3D Permutation': 'game-super-1-plus-3d-permutation',
  '1+3D Jackpot': 'game-1-plus-3d-jackpot',
  'DMC Jackpot': 'game-dmc-jackpot',
  '3D Jackpot': 'game-3d-jackpot',
  '5D': 'game-5d',
  '6D': 'game-6d',
  'Star Toto 6/50': 'game-star-toto-6-50',
  'Supreme Toto 6/55': 'game-supreme-toto-6-55',
  'Power Toto 6/58': 'game-power-toto-6-58',
  '4D iBet': 'game-4d-ibet',
  'Toto 6/49': 'game-toto-6-49',
  'Lotto 6/45': 'game-lotto-6-45'
};

export function ProviderPayoutContent({locale, page}: {locale: Locale; page: ProviderPayoutPage}) {
  const labels = copy[locale];
  const provider = getPayoutProvider(page);
  const guide = page.guide;

  if (guide) {
    const relatedPages = guide.relatedSlugs
      .map((slug) => providerPayoutPages.find((providerPage) => providerPage.slug === slug))
      .filter((providerPage): providerPage is ProviderPayoutPage => Boolean(providerPage));

    return (
      <main className="container-shell py-8">
        <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500" aria-label="Breadcrumb">
          <Link href={`/${locale}`} className="text-blue-800 hover:text-blue-950">{guide.breadcrumb.home[locale]}</Link>
          <span aria-hidden="true">/</span>
          <span>{guide.breadcrumb.more[locale]}</span>
          <span aria-hidden="true">/</span>
          <span>{guide.breadcrumb.providerGuides[locale]}</span>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-slate-700">{page.menuLabel[locale]}</span>
        </nav>

        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <ProviderLogoBadge provider={provider} sizeClassName="size-14" active />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-800">{guide.breadcrumb.providerGuides[locale]}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{guide.heroTitle[locale]}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{guide.heroIntro[locale]}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {guide.tags.map((tag) => (
                  <span key={tag.en} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">{tag[locale]}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">{guide.aboutTitle[locale]}</h2>
            <div className="mt-3 space-y-3 text-sm leading-7 text-slate-600">
              {guide.aboutParagraphs.map((paragraph) => <p key={paragraph.en}>{paragraph[locale]}</p>)}
            </div>
          </div>

          <section className="rounded-lg border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-xl font-black text-slate-950">{guide.summaryTitle[locale]}</h2>
            <dl className="mt-4 grid gap-3">
              {guide.summary.map((item) => (
                <div key={item.label.en} className="rounded-md border border-slate-200 bg-white p-3">
                  <dt className="text-xs font-black uppercase tracking-[0.08em] text-slate-500">{item.label[locale]}</dt>
                  <dd className="mt-1 text-sm font-bold leading-6 text-slate-900">{item.value[locale]}</dd>
                </div>
              ))}
            </dl>
          </section>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-950">{guide.availableGamesTitle[locale]}</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {guide.availableGames.map((game) => (
              <a key={game.title.en} href={`#${guideGameAnchorId(game.title.en)}`} className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-300 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <h3 className="text-lg font-black text-slate-950">{game.title[locale]}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{game.description[locale]}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <h2 className="text-xl font-black text-amber-950">{guide.informationNotesTitle[locale]}</h2>
          <div className="mt-2 space-y-2">
            <p>{page.dataNote[locale]}</p>
            {guide.informationNotes.map((note) => <p key={note.en}>{note[locale]}</p>)}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-950">{guide.prizeStructureTitle[locale]}</h2>
          <p className="mt-2 text-sm font-bold text-slate-500">{labels.tableScroll}</p>
          <div className="mt-5 space-y-8">
            {page.games.map((game) => (
              <section key={game.title.en} id={guideGameAnchorId(game.title.en)} className="scroll-mt-56 md:scroll-mt-40 lg:scroll-mt-32">
                <div className="border-b border-slate-200 pb-3">
                  <p className="text-sm font-black text-blue-800">{game.stake[locale]}</p>
                  <h3 className="mt-1 text-2xl font-black text-slate-950">{game.title[locale]}</h3>
                  <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{game.overview[locale]}</p>
                  {game.bullets?.length ? (
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                      {game.bullets.map((bullet) => <li key={bullet.en}>- {bullet[locale]}</li>)}
                    </ul>
                  ) : null}
                </div>

                <div className="mt-4 space-y-5">
                  {game.tables.map((table) => (
                    <div key={table.title.en} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                      <h4 className="text-lg font-black text-slate-950">{table.title[locale]}</h4>
                      {table.note ? <p className="mt-1 text-sm leading-6 text-slate-600">{table.note[locale]}</p> : null}
                      <div className="mt-3 overflow-x-auto">
                        <table className="min-w-full border-collapse text-left text-sm">
                          <thead>
                            <tr>
                              {table.headers.map((header) => (
                                <th key={cellText(header, locale)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-black text-slate-700">
                                  {cellText(header, locale)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, rowIndex) => (
                              <tr key={`${table.title.en}-${rowIndex}`} className="border-b border-slate-100 last:border-0">
                                {row.map((cell, cellIndex) => (
                                  <td key={`${table.title.en}-${rowIndex}-${cellIndex}`} className="min-w-[130px] px-3 py-3 align-top leading-6 text-slate-700 first:font-black first:text-slate-950">
                                    {cellText(cell, locale)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black text-slate-950">{guide.faqTitle[locale]}</h2>
          <div className="mt-4 space-y-3">
            {guide.faqs.map((faq) => (
              <details key={faq.question.en} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <summary className="cursor-pointer text-base font-black text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-blue-600">{faq.question[locale]}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer[locale]}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-6 text-blue-950">
          <h2 className="text-lg font-black text-blue-950">{guide.verificationTitle[locale]}</h2>
          <p className="mt-2">{guide.verificationText[locale]}</p>
        </section>

        <section className="mt-5 rounded-lg border border-slate-300 bg-slate-100 p-5 text-sm leading-6 text-slate-700">
          <h2 className="text-lg font-black text-slate-950">{guide.disclaimerTitle[locale]}</h2>
          <p className="mt-2">{guide.disclaimerText[locale]}</p>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-black text-slate-950">{guide.relatedGuidesTitle[locale]}</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPages.map((providerPage) => (
              <Link key={providerPage.slug} href={`/${locale}/providers/${providerPage.slug}`} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-black text-slate-700 transition hover:border-blue-300 hover:text-blue-900">
                {providerPage.menuLabel[locale]}
              </Link>
            ))}
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="container-shell py-8">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500" aria-label="Breadcrumb">
        <Link href={`/${locale}/about`} className="text-blue-800 hover:text-blue-950">{labels.backToAbout}</Link>
        <span>/</span>
        <span>{page.menuLabel[locale]}</span>
      </nav>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <ProviderLogoBadge provider={provider} sizeClassName="size-14" active />
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-800">{labels.eyebrow}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{page.title[locale]}</h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{page.intro[locale]}</p>
          </div>
        </div>
      </section>

      <section className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
        <h2 className="text-base font-black text-amber-950">{labels.dataNoteTitle}</h2>
        <p className="mt-1">{page.dataNote[locale]}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-black text-slate-950">{labels.gamesTitle}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {page.games.map((game) => (
            <a key={game.title.en} href={`#${slugId(game.title.en)}`} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-900">
              {game.title[locale]}
            </a>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-8">
        {page.games.map((game) => (
          <section key={game.title.en} id={slugId(game.title.en)} className="scroll-mt-24">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-sm font-black text-blue-800">{game.stake[locale]}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{game.title[locale]}</h2>
              <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">{game.overview[locale]}</p>
              {game.bullets?.length ? (
                <ul className="mt-3 space-y-1 text-sm leading-6 text-slate-600">
                  {game.bullets.map((bullet) => <li key={bullet.en}>- {bullet[locale]}</li>)}
                </ul>
              ) : null}
            </div>

            <div className="mt-4 space-y-5">
              {game.tables.map((table) => (
                <div key={table.title.en} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <h3 className="text-lg font-black text-slate-950">{table.title[locale]}</h3>
                  {table.note ? <p className="mt-1 text-sm leading-6 text-slate-600">{table.note[locale]}</p> : null}
                  <p className="mt-2 text-xs font-bold text-slate-500">{labels.tableScroll}</p>
                  <div className="mt-3 overflow-x-auto">
                    <table className="min-w-full border-collapse text-left text-sm">
                      <thead>
                        <tr>
                          {table.headers.map((header) => (
                            <th key={cellText(header, locale)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-black text-slate-700">
                              {cellText(header, locale)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {table.rows.map((row, rowIndex) => (
                          <tr key={`${table.title.en}-${rowIndex}`} className="border-b border-slate-100 last:border-0">
                            {row.map((cell, cellIndex) => (
                              <td key={`${table.title.en}-${rowIndex}-${cellIndex}`} className="min-w-[130px] px-3 py-3 align-top leading-6 text-slate-700 first:font-black first:text-slate-950">
                                {cellText(cell, locale)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-slate-300 bg-slate-100 p-5 text-sm leading-6 text-slate-700">
        <h2 className="text-lg font-black text-slate-950">{labels.officialDisclaimerTitle}</h2>
        <p className="mt-2">{labels.officialDisclaimer}</p>
        {page.footerNote ? <p className="mt-2">{page.footerNote[locale]}</p> : null}
        <div className="mt-4 rounded-md border border-slate-300 bg-white/70 p-4">
          <h3 className="text-sm font-black text-slate-950">{labels.verificationTitle}</h3>
          <p className="mt-1">{labels.verificationText}</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black text-slate-950">{labels.providerIndex}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {providerPayoutPages.map((providerPage) => (
            <Link key={providerPage.slug} href={`/${locale}/providers/${providerPage.slug}`} className={`rounded-lg border p-4 text-sm font-black transition ${providerPage.slug === page.slug ? 'border-blue-700 bg-blue-50 text-blue-900' : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-900'}`}>
              {providerPage.menuLabel[locale]}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

function slugId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function guideGameAnchorId(value: string) {
  return guideGameAnchorIds[value] ?? slugId(value);
}
