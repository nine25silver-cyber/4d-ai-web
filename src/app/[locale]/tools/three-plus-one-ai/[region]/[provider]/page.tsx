import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {getTranslations} from 'next-intl/server';
import {AdAccessGateClient} from '@/components/AdAccessGateClient';
import {AiProviderSwitcher} from '@/components/AiProviderSwitcher';
import {ThreePlusOneHitHistoryClient} from '@/components/ThreePlusOneHitHistoryClient';
import {fetchThreePlusOneAiHitHistory, fetchThreePlusOneAiRecommendation} from '@/lib/cloudflare';
import {getProviderDisplayName, getRegion, regions} from '@/lib/providers';
import {buildMetadata} from '@/lib/seo';
import type {Locale} from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}): Promise<Metadata> {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) return {};
  const providerName = getProviderDisplayName(provider, locale);
  return buildMetadata({
    locale,
    path: `/tools/three-plus-one-ai/${region.slug}/${provider.code}`,
    title: `${providerName} 3D AI recommendations`,
    description: `View ${providerName} 3+1 AI recommendation digits and recent 3D hit history.`
  });
}

export default async function ThreePlusOneAiProviderPage({params}: {params: Promise<{locale: Locale; region: string; provider: string}>}) {
  const {locale, region: regionSlug, provider: providerCode} = await params;
  const region = getRegion(regionSlug);
  const provider = region?.providers.find((item) => item.code === providerCode);
  if (!region || !provider) notFound();

  const t = await getTranslations({locale, namespace: 'AI'});
  const copy = getThreePlusOneAiCopy(locale);
  const providerName = getProviderDisplayName(provider, locale);
  const [recommendation, hitHistory] = await Promise.all([
    fetchThreePlusOneAiRecommendation(provider.code),
    fetchThreePlusOneAiHitHistory(provider.code)
  ]);

  return (
    <main className="container-shell pt-2 pb-6">
      <div className="grid gap-3 md:grid-cols-[200px_minmax(0,1fr)] md:items-start">
        <div className="hidden md:block">
          <AiProviderSwitcher
            locale={locale}
            regions={regions}
            currentProviderCode={provider.code}
            title={t('providerSwitcherTitle')}
            variant="sidebar"
            basePath="tools/three-plus-one-ai"
          />
        </div>
        <div className="min-w-0 space-y-3">
          <section className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{copy.eyebrow}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">{copy.title.replace('{provider}', providerName)}</h1>
            <p className="mt-1 text-sm font-bold text-slate-600">{copy.intro}</p>
          </section>

          <div className="block md:hidden">
            <AiProviderSwitcher
              locale={locale}
              regions={regions}
              currentProviderCode={provider.code}
              title={t('providerSwitcherTitle')}
              basePath="tools/three-plus-one-ai"
            />
          </div>

          <AdAccessGateClient locale={locale} feature="ad_access_3d" adLabel="3D" lockedText={copy.lockedText}>
            <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{copy.currentRecommendation}</h2>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    {recommendation.ok && recommendation.payload.sourceDrawDate
                      ? copy.sourceDate.replace('{date}', recommendation.payload.sourceDrawDate)
                      : copy.sourcePending}
                  </p>
                </div>
                <span className="rounded-md bg-[#f0c95a] px-2 py-0.5 text-[10px] font-black text-slate-900 shadow-sm">
                  PRO
                </span>
              </div>

              {recommendation.ok ? (
                <div className="mt-4 flex flex-wrap gap-2">
                  {recommendation.payload.recommendation4.map((digit, index) => (
                    <span
                      key={`${digit}-${index}`}
                      className="flex h-14 w-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-2xl font-black text-slate-950"
                    >
                      {digit}
                    </span>
                  ))}
                </div>
              ) : (
                <UnavailablePanel title={copy.unavailableTitle} text={copy.unavailableText} reason={recommendation.reason} />
              )}

              {recommendation.ok && recommendation.payload.generatedAt ? (
                <p className="mt-3 text-xs font-bold text-slate-500">
                  {copy.generatedAt.replace('{time}', recommendation.payload.generatedAt)}
                </p>
              ) : null}
            </section>

            <section className="rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-black text-slate-950">{copy.hitHistoryTitle}</h2>
                  <p className="mt-1 text-sm font-bold text-slate-600">{copy.hitHistoryIntro}</p>
                </div>
                {hitHistory.ok ? (
                  <div className="text-right text-xs font-black text-slate-600">
                    <div>{copy.totalPeriods.replace('{count}', `${hitHistory.payload.totalPeriods ?? hitHistory.payload.records.length}`)}</div>
                    <div>{copy.totalHits.replace('{count}', `${hitHistory.payload.totalHits ?? '-'}`)}</div>
                  </div>
                ) : null}
              </div>

              {hitHistory.ok && hitHistory.payload.records.length > 0 ? (
                <ThreePlusOneHitHistoryClient
                  records={hitHistory.payload.records}
                  labels={{
                    hitCountLabel: copy.hitCountLabel,
                    recommendedLabel: copy.recommendedLabel,
                    resultLabel: copy.resultLabel,
                    noHitText: copy.noHitText,
                    expandLabel: copy.expandLabel,
                    collapseLabel: copy.collapseLabel
                  }}
                />
              ) : (
                <UnavailablePanel title={copy.historyUnavailableTitle} text={copy.historyUnavailableText} reason={hitHistory.ok ? undefined : hitHistory.reason} />
              )}
            </section>
          </AdAccessGateClient>
        </div>
      </div>
    </main>
  );
}

function UnavailablePanel({title, text, reason}: {title: string; text: string; reason?: string}) {
  return (
    <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-600">
      <div className="font-black text-slate-950">{title}</div>
      <div className="mt-1">{text}</div>
      {reason ? <div className="mt-1 text-xs text-slate-500">{reason}</div> : null}
    </div>
  );
}

function getThreePlusOneAiCopy(locale: Locale) {
  if (locale === 'zh') {
    return {
      eyebrow: '3D AI',
      title: '{provider} 3D AI推荐号码',
      intro: '显示已确认的 3+1 AI 推荐与最近100期命中历史。',
      currentRecommendation: '当前 3+1 推荐',
      sourceDate: '来源日期：{date}',
      sourcePending: '来源日期待更新',
      generatedAt: '生成时间：{time}',
      unavailableTitle: '3D AI 推荐暂时不可用',
      unavailableText: '此公司目前没有可显示的 3+1 推荐资料。',
      lockedText: '3D AI 推荐号码开放给 Pro 会员，或观看 3D 广告后临时解锁。',
      hitHistoryTitle: '最近100期命中历史',
      hitHistoryIntro: '只显示日期、推荐4位数字，以及 Top1 / Top2 / Top3 的后三位命中。',
      historyUnavailableTitle: '命中历史暂时不可用',
      historyUnavailableText: '此公司目前没有可显示的 3+1 命中历史资料。',
      totalPeriods: '期数 {count}',
      totalHits: '总命中 {count}',
      hitCountLabel: '命中 {count}',
      recommendedLabel: '推荐号码',
      resultLabel: '开奖结果',
      noHitText: '本期未命中 Top1 / Top2 / Top3。',
      expandLabel: '展开命中详情',
      collapseLabel: '收起命中详情'
    };
  }
  if (locale === 'ms') {
    return {
      eyebrow: '3D AI',
      title: '{provider} 3D Cadangan AI',
      intro: 'Memaparkan cadangan 3+1 AI yang disahkan dan sejarah hit 100 cabutan terkini.',
      currentRecommendation: 'Cadangan 3+1 semasa',
      sourceDate: 'Tarikh sumber: {date}',
      sourcePending: 'Tarikh sumber belum tersedia',
      generatedAt: 'Dijana: {time}',
      unavailableTitle: 'Cadangan 3D AI belum tersedia',
      unavailableText: 'Syarikat ini belum mempunyai data cadangan 3+1 untuk dipaparkan.',
      lockedText: 'Cadangan 3D AI untuk ahli Pro, atau buka sementara melalui iklan 3D.',
      hitHistoryTitle: 'Sejarah hit 100 cabutan terkini',
      hitHistoryIntro: 'Hanya tarikh, 4 digit cadangan, dan hit tiga digit akhir Top1 / Top2 / Top3 dipaparkan.',
      historyUnavailableTitle: 'Sejarah hit belum tersedia',
      historyUnavailableText: 'Syarikat ini belum mempunyai data sejarah hit 3+1 untuk dipaparkan.',
      totalPeriods: '{count} cabutan',
      totalHits: '{count} jumlah hit',
      hitCountLabel: '{count} hit',
      recommendedLabel: 'Nombor cadangan',
      resultLabel: 'Keputusan',
      noHitText: 'Tiada hit Top1 / Top2 / Top3 untuk cabutan ini.',
      expandLabel: 'Buka butiran hit',
      collapseLabel: 'Tutup butiran hit'
    };
  }
  return {
    eyebrow: '3D AI',
    title: '{provider} 3D AI Recommendations',
    intro: 'Shows the confirmed 3+1 AI recommendation and latest 100-draw hit history.',
    currentRecommendation: 'Current 3+1 recommendation',
    sourceDate: 'Source date: {date}',
    sourcePending: 'Source date pending',
    generatedAt: 'Generated: {time}',
    unavailableTitle: '3D AI recommendation unavailable',
    unavailableText: 'This company does not have displayable 3+1 recommendation data right now.',
    lockedText: '3D AI recommendations are for Pro, or temporary 3D ad unlock.',
    hitHistoryTitle: 'Latest 100 hit history',
    hitHistoryIntro: 'Shows only date, the 4 recommended digits, and Top1 / Top2 / Top3 last-three hits.',
    historyUnavailableTitle: 'Hit history unavailable',
    historyUnavailableText: 'This company does not have displayable 3+1 hit history data right now.',
    totalPeriods: '{count} periods',
    totalHits: '{count} total hits',
    hitCountLabel: '{count} hits',
    recommendedLabel: 'Recommended digits',
    resultLabel: 'Results',
    noHitText: 'No Top1 / Top2 / Top3 hit for this draw.',
    expandLabel: 'Expand hit details',
    collapseLabel: 'Collapse hit details'
  };
}
