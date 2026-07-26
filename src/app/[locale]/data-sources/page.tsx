import Link from 'next/link';

import {buildMetadata} from '@/lib/seo';
import {routing, type Locale} from '@/i18n/routing';

type LocalizedLink = {
  href: string;
  label: string;
};

type DataSection = {
  id: string;
  title: string;
  body: string;
  items?: string[];
};

type ComparisonColumn = {
  title: string;
  items: string[];
};

type DataSourcesCopy = {
  metaTitle: string;
  metaDescription: string;
  breadcrumb: string;
  eyebrow: string;
  title: string;
  intro: string;
  badges: string[];
  explainsTitle: string;
  explainsIntro: string;
  explainsItems: string[];
  sections: DataSection[];
  comparisonTitle: string;
  comparisonIntro: string;
  comparison: ComparisonColumn[];
  verificationTitle: string;
  verificationIntro: string;
  verificationSteps: string[];
  officialTitle: string;
  officialBody: string;
  relatedTitle: string;
  relatedLinks: LocalizedLink[];
};

const dataSourcesCopy: Record<Locale, DataSourcesCopy> = {
  en: {
    metaTitle: 'Data Sources and Verification | 4D AI',
    metaDescription:
      'Learn how 4D AI explains data sources, official Provider information, historical results, latest results, verification, updates and limitations as an independent informational reference.',
    breadcrumb: 'Data Sources',
    eyebrow: 'Data and verification guide',
    title: 'Data Sources and Verification',
    intro:
      'This page explains how 4D AI organises and displays information. Official draw results, game rules, payout structures, jackpot arrangements and prize claims should always be checked against the latest official publication from the relevant Provider. 4D AI is an independent information platform and does not represent an official Provider publication.',
    badges: ['Independent information', 'Official sources first', 'Verification matters'],
    explainsTitle: 'What this page explains',
    explainsIntro:
      'The purpose of this guide is to describe the role of data on the website in plain language, without claiming official partnership, zero delay, or perfect coverage.',
    explainsItems: [
      'How historical results are organised and displayed for review.',
      'How Latest Results are shown from the website available Provider data source.',
      'How Provider Guide payout structures are presented as structured information.',
      'Why users should cross-check important details with official Provider information.',
      'How updates, corrections and data limitations should be understood.'
    ],
    sections: [
      {
        id: 'official-provider-information',
        title: 'Official Provider information',
        body:
          'Provider official publications are the final reference for formal draw results, game rules, payout amounts, jackpot arrangements and prize claim requirements. 4D AI does not represent any Provider and does not claim official approval or partnership.',
        items: [
          'Providers may revise rules, game arrangements, jackpot mechanics or payout amounts.',
          'If website information differs from Provider information, the Provider publication should take priority.',
          'Provider names are used to identify relevant information, not to imply official representation.'
        ]
      },
      {
        id: 'historical-results',
        title: 'Historical results and display',
        body:
          '4D AI organises historical draw results for lookup and research reference. Historical data describes what has already happened and does not decide future outcomes.',
        items: [
          'Historical results are displayed through the website existing result and history views.',
          'Past occurrence does not mean a number will repeat in a future draw.',
          'AI-assisted analysis that uses historical information remains subject to the same limits.'
        ]
      },
      {
        id: 'latest-results',
        title: 'Latest Results',
        body:
          'The Latest Results section is rendered from the website existing Provider data feed for front-end display. It should be treated as website information, while the relevant Provider latest official publication remains the final reference.',
        items: [
          'This page does not change the Provider data feed or its display contract.',
          'Publication timing, processing and caching can affect what users see at a given moment.',
          'Time-sensitive results should be cross-checked with the relevant Provider.'
        ]
      },
      {
        id: 'provider-guide-data',
        title: 'Provider Guide data',
        body:
          'Provider Guide payout structures are maintained as structured website information and rendered into user-facing guide pages. Amounts are not duplicated in translation copy, and users should verify current rules and amounts with the latest Provider publication.',
        items: [
          'Guide pages separate game formats, payout tables, notes and disclaimers for easier reading.',
          'Payout and jackpot arrangements may change after a guide has been published.',
          'The guides are informational references, not official Provider rule books.'
        ]
      },
      {
        id: 'verification-cross-checking',
        title: 'Verification and cross-checking',
        body:
          '4D AI organises information in a consistent format, but important details should be cross-checked when they involve official results, rules, payout amounts, jackpots or prize claims.',
        items: [
          'Do not rely only on screenshots, forwarded messages or older saved pages.',
          'Compare the Provider name, game name, draw date, draw number and prize category.',
          'This website does not provide an official confirmation letter or Provider audit certificate.'
        ]
      },
      {
        id: 'updates-corrections',
        title: 'Updates and corrections',
        body:
          'Website information may be updated after review or after Provider publications change. Corrections should aim to make information clearer and more accurate, without inventing a last-reviewed date or fixed update schedule.',
        items: [
          'Provider publications can change rules, amounts or game arrangements.',
          'Older pages or cached views may temporarily show earlier information.',
          'When a difference is found, users should first check the relevant Provider official information.'
        ]
      },
      {
        id: 'data-limitations',
        title: 'Data limitations',
        body:
          'Data can be affected by timing, available records, display conditions, later updates and caching. Historical data cannot predict future results, and statistical descriptions do not create cause and effect.',
        items: [
          'AI output depends on the available data range and selected conditions.',
          'Provider rules, amounts and game arrangements may change.',
          'Users should verify official information before relying on details for a current decision.'
        ]
      }
    ],
    comparisonTitle: 'Differences between 4D AI and official sources',
    comparisonIntro:
      'Both can be useful in different ways, but they should not be treated as the same type of source.',
    comparison: [
      {
        title: '4D AI',
        items: [
          'Independent information organisation.',
          'Historical result display.',
          'Provider Guides and payout summaries.',
          'AI-assisted research reference.',
          'Not an official prediction or official publication.'
        ]
      },
      {
        title: 'Official Provider sources',
        items: [
          'Formal draw results.',
          'Latest game rules.',
          'Payout and jackpot arrangements.',
          'Prize claim rules.',
          'Official announcements.'
        ]
      }
    ],
    verificationTitle: 'User verification steps',
    verificationIntro:
      'When a detail matters, use a simple cross-check before relying on it.',
    verificationSteps: [
      'Confirm the Provider name and game name.',
      'Check the draw date or draw number.',
      'Check the formal draw numbers.',
      'Check the game rules and prize category.',
      'Check payout amounts and jackpot arrangements.',
      'Check prize claim rules where relevant.',
      'If there is any difference, follow the Provider latest official publication.'
    ],
    officialTitle: 'Official information priority',
    officialBody:
      'Formal results, game rules, payout structures, jackpots and prize claim arrangements should follow the latest official Provider information. 4D AI is independent, does not sell tickets, does not accept bets, does not process prize claims and does not claim official partnership.',
    relatedTitle: 'Related information',
    relatedLinks: [
      {href: '/about', label: 'About 4D AI'},
      {href: '/faq', label: 'FAQ'},
      {href: '/responsible-gaming', label: 'Responsible Gaming'},
      {href: '/how-4d-ai-works', label: 'How 4D AI Works'},
      {href: '/providers/magnum', label: 'Magnum Guide'},
      {href: '/providers/sports-toto', label: 'Sports Toto Guide'}
    ]
  },
  zh: {
    metaTitle: '资料来源与核对说明 | 4D AI',
    metaDescription:
      '了解 4D AI 如何说明资料来源、官方 Provider 资讯、历史结果、最新结果、资料核对、更新与限制，并作为独立资讯参考使用。',
    breadcrumb: '资料来源',
    eyebrow: '资料与核对指南',
    title: '资料来源与核对说明',
    intro:
      '本页面说明 4D AI 如何整理和展示资料。正式开奖结果、游戏规则、派彩结构、Jackpot 安排和兑奖要求，应以相关 Provider 最新官方公布为准。4D AI 是独立资讯平台，本页面不代表 Provider 官方发布。',
    badges: ['独立资讯', '官方来源优先', '核对很重要'],
    explainsTitle: '本页说明什么',
    explainsIntro:
      '本指南用自然语言说明网站资料的角色，不声称官方合作、零延迟或完整无误覆盖。',
    explainsItems: [
      '历史结果如何被整理并用于查阅。',
      'Latest Results 如何由网站现有 Provider 资料来源展示。',
      'Provider Guide 的派彩结构如何作为结构化资讯呈现。',
      '为什么重要资料需要再核对 Provider 官方资讯。',
      '如何理解更新、更正和资料限制。'
    ],
    sections: [
      {
        id: 'official-provider-information',
        title: '官方 Provider 资讯',
        body:
          'Provider 官方公布是正式开奖结果、游戏规则、派彩金额、Jackpot 安排和兑奖要求的最终参考。4D AI 不代表任何 Provider，也不声称官方批准或合作。',
        items: [
          'Provider 可调整规则、游戏安排、Jackpot 机制或派彩金额。',
          '如果网站资料与 Provider 资料不同，应以 Provider 公布为准。',
          'Provider 名称仅用于识别相关资讯，不代表官方身份。'
        ]
      },
      {
        id: 'historical-results',
        title: '历史结果与展示',
        body:
          '4D AI 整理历史开奖结果，用于查询和研究参考。历史资料描述已经发生过的结果，不能决定未来结果。',
        items: [
          '历史结果通过网站现有结果和历史页面展示。',
          '过去出现过的号码，不代表未来会重复。',
          '使用历史资料的 AI 辅助分析也受相同限制。'
        ]
      },
      {
        id: 'latest-results',
        title: 'Latest Results',
        body:
          'Latest Results 由网站现有 Provider 资料来源用于前端展示。它应被视为网站资讯，而相关 Provider 最新官方公布仍是最终参考。',
        items: [
          '本页面不修改 Provider 资料来源或展示约定。',
          '公布时间、处理步骤和缓存可能影响用户在某一刻看到的内容。',
          '对时间敏感的结果，应向相关 Provider 核对。'
        ]
      },
      {
        id: 'provider-guide-data',
        title: 'Provider Guide 资料',
        body:
          'Provider Guide 的派彩结构以网站结构化资讯维护，并渲染为用户可读的指南页面。金额不会在翻译文案中重复维护，当前规则和金额仍应向最新 Provider 公布核对。',
        items: [
          '指南页面会分开游戏形式、派彩表、说明和免责声明。',
          '指南发布后，派彩和 Jackpot 安排仍可能改变。',
          '这些指南是资讯参考，不是 Provider 官方规则书。'
        ]
      },
      {
        id: 'verification-cross-checking',
        title: '资料核对与交叉检查',
        body:
          '4D AI 会用一致格式整理资料，但涉及正式结果、规则、派彩金额、Jackpot 或兑奖时，重要细节应再次核对。',
        items: [
          '不要只依赖截图、转发消息或旧页面。',
          '比较 Provider 名称、游戏名称、开奖日期、期号和奖项类别。',
          '本网站不提供官方确认书或 Provider 审核证明。'
        ]
      },
      {
        id: 'updates-corrections',
        title: '更新与更正',
        body:
          '网站资料可能在核对后，或在 Provider 公布变化后更新。更正目标是让资料更清楚、更准确，不虚构 last reviewed date，也不承诺固定更新时间。',
        items: [
          'Provider 公布可能改变规则、金额或游戏安排。',
          '旧页面或缓存视图可能暂时显示较早内容。',
          '发现差异时，用户应先核对相关 Provider 官方资料。'
        ]
      },
      {
        id: 'data-limitations',
        title: '资料限制',
        body:
          '资料可能受时间、可用记录、显示条件、后续更新和缓存影响。历史资料不能预测未来结果，统计描述也不等于因果关系。',
        items: [
          'AI 输出会受可用数据范围和选择条件影响。',
          'Provider 规则、金额和游戏安排可能改变。',
          '用户在把资料用于当前判断前，应核对官方资讯。'
        ]
      }
    ],
    comparisonTitle: '4D AI 与官方来源的区别',
    comparisonIntro:
      '两者都可能有用途，但不应被视为同一种来源。',
    comparison: [
      {
        title: '4D AI',
        items: [
          '独立资讯整理。',
          '历史结果展示。',
          'Provider Guide 与派彩摘要。',
          'AI 辅助研究参考。',
          '不是官方预测，也不是官方发布。'
        ]
      },
      {
        title: '官方 Provider 来源',
        items: [
          '正式开奖结果。',
          '最新游戏规则。',
          '派彩与 Jackpot 安排。',
          '兑奖规则。',
          '官方公告。'
        ]
      }
    ],
    verificationTitle: '用户核对步骤',
    verificationIntro:
      '当某项资料很重要时，可先用简单步骤交叉核对。',
    verificationSteps: [
      '确认 Provider 名称与游戏名称。',
      '核对开奖日期或期号。',
      '核对正式开奖号码。',
      '核对游戏规则与奖项类别。',
      '核对派彩金额与 Jackpot 安排。',
      '在相关情况下核对兑奖规则。',
      '如有差异，以 Provider 最新官方公布为准。'
    ],
    officialTitle: '官方资讯优先',
    officialBody:
      '正式结果、游戏规则、派彩结构、Jackpot 和兑奖安排，应以 Provider 最新官方资料为准。4D AI 是独立平台，不销售票券、不接受投注、不处理兑奖，也不声称官方合作。',
    relatedTitle: '相关资讯',
    relatedLinks: [
      {href: '/about', label: '关于 4D AI'},
      {href: '/faq', label: '常见问题'},
      {href: '/responsible-gaming', label: '负责任参与'},
      {href: '/how-4d-ai-works', label: '4D AI 如何运作'},
      {href: '/providers/magnum', label: 'Magnum 指南'},
      {href: '/providers/sports-toto', label: 'Sports Toto 指南'}
    ]
  },
  ms: {
    metaTitle: 'Sumber Data dan Pengesahan | 4D AI',
    metaDescription:
      'Ketahui cara 4D AI menerangkan sumber data, maklumat rasmi Provider, keputusan sejarah, keputusan terkini, pengesahan, kemas kini dan had sebagai rujukan maklumat bebas.',
    breadcrumb: 'Sumber Data',
    eyebrow: 'Panduan data dan pengesahan',
    title: 'Sumber Data dan Pengesahan',
    intro:
      'Halaman ini menerangkan cara 4D AI menyusun dan memaparkan maklumat. Keputusan cabutan rasmi, peraturan permainan, struktur payout, aturan jackpot dan tuntutan hadiah perlu disemak berdasarkan penerbitan rasmi terkini daripada Provider berkaitan. 4D AI ialah platform maklumat bebas dan halaman ini bukan penerbitan rasmi Provider.',
    badges: ['Maklumat bebas', 'Sumber rasmi diutamakan', 'Semakan penting'],
    explainsTitle: 'Apa yang halaman ini terangkan',
    explainsIntro:
      'Panduan ini menerangkan peranan data di laman secara jelas, tanpa mendakwa kerjasama rasmi, kelewatan sifar, atau liputan sempurna.',
    explainsItems: [
      'Cara keputusan sejarah disusun dan dipaparkan untuk semakan.',
      'Cara Latest Results dipaparkan daripada sumber data Provider yang tersedia kepada laman.',
      'Cara struktur payout Provider Guide dipaparkan sebagai maklumat tersusun.',
      'Mengapa pengguna perlu menyemak butiran penting dengan maklumat rasmi Provider.',
      'Cara memahami kemas kini, pembetulan dan had data.'
    ],
    sections: [
      {
        id: 'official-provider-information',
        title: 'Maklumat rasmi Provider',
        body:
          'Penerbitan rasmi Provider ialah rujukan akhir untuk keputusan cabutan rasmi, peraturan permainan, jumlah payout, aturan jackpot dan syarat tuntutan hadiah. 4D AI tidak mewakili mana-mana Provider dan tidak mendakwa kelulusan atau kerjasama rasmi.',
        items: [
          'Provider boleh mengubah peraturan, aturan permainan, mekanik jackpot atau jumlah payout.',
          'Jika maklumat laman berbeza daripada maklumat Provider, penerbitan Provider perlu diutamakan.',
          'Nama Provider digunakan untuk mengenal pasti maklumat berkaitan, bukan untuk menunjukkan perwakilan rasmi.'
        ]
      },
      {
        id: 'historical-results',
        title: 'Keputusan sejarah dan paparan',
        body:
          '4D AI menyusun keputusan cabutan sejarah untuk carian dan rujukan kajian. Data sejarah menerangkan perkara yang sudah berlaku dan tidak menentukan keputusan masa depan.',
        items: [
          'Keputusan sejarah dipaparkan melalui paparan keputusan dan sejarah sedia ada di laman.',
          'Kejadian lalu tidak bermaksud nombor akan berulang dalam cabutan masa depan.',
          'Analisis bantuan AI yang menggunakan maklumat sejarah tertakluk pada had yang sama.'
        ]
      },
      {
        id: 'latest-results',
        title: 'Latest Results',
        body:
          'Bahagian Latest Results dirender daripada suapan data Provider sedia ada laman untuk paparan hadapan. Ia perlu dianggap sebagai maklumat laman, manakala penerbitan rasmi terkini Provider berkaitan kekal sebagai rujukan akhir.',
        items: [
          'Halaman ini tidak mengubah suapan data Provider atau kontrak paparannya.',
          'Masa penerbitan, pemprosesan dan cache boleh mempengaruhi perkara yang dilihat pengguna pada satu masa.',
          'Keputusan sensitif masa perlu disemak dengan Provider berkaitan.'
        ]
      },
      {
        id: 'provider-guide-data',
        title: 'Data Provider Guide',
        body:
          'Struktur payout Provider Guide dikekalkan sebagai maklumat laman yang tersusun dan dirender ke halaman panduan untuk pengguna. Jumlah tidak diulang dalam salinan terjemahan, dan pengguna perlu menyemak peraturan serta jumlah semasa dengan penerbitan Provider terkini.',
        items: [
          'Halaman panduan memisahkan format permainan, jadual payout, nota dan penafian untuk bacaan lebih mudah.',
          'Aturan payout dan jackpot boleh berubah selepas panduan diterbitkan.',
          'Panduan ini ialah rujukan maklumat, bukan buku peraturan rasmi Provider.'
        ]
      },
      {
        id: 'verification-cross-checking',
        title: 'Pengesahan dan semakan silang',
        body:
          '4D AI menyusun maklumat dalam format yang konsisten, tetapi butiran penting perlu disemak apabila melibatkan keputusan rasmi, peraturan, jumlah payout, jackpot atau tuntutan hadiah.',
        items: [
          'Jangan bergantung hanya pada tangkapan skrin, mesej dikongsi atau halaman lama.',
          'Bandingkan nama Provider, nama permainan, tarikh cabutan, nombor cabutan dan kategori hadiah.',
          'Laman ini tidak menyediakan surat pengesahan rasmi atau sijil audit Provider.'
        ]
      },
      {
        id: 'updates-corrections',
        title: 'Kemas kini dan pembetulan',
        body:
          'Maklumat laman boleh dikemas kini selepas semakan atau selepas penerbitan Provider berubah. Pembetulan bertujuan menjadikan maklumat lebih jelas dan tepat, tanpa mencipta tarikh semakan terakhir atau jadual kemas kini tetap.',
        items: [
          'Penerbitan Provider boleh mengubah peraturan, jumlah atau aturan permainan.',
          'Halaman lama atau paparan cache mungkin sementara memaparkan maklumat lebih awal.',
          'Apabila perbezaan ditemui, pengguna perlu menyemak maklumat rasmi Provider berkaitan dahulu.'
        ]
      },
      {
        id: 'data-limitations',
        title: 'Had data',
        body:
          'Data boleh dipengaruhi oleh masa, rekod tersedia, keadaan paparan, kemas kini kemudian dan cache. Data sejarah tidak boleh meramal keputusan masa depan, dan huraian statistik tidak mencipta sebab dan akibat.',
        items: [
          'Output AI bergantung pada julat data tersedia dan syarat pilihan.',
          'Peraturan, jumlah dan aturan permainan Provider boleh berubah.',
          'Pengguna perlu menyemak maklumat rasmi sebelum bergantung pada butiran untuk keputusan semasa.'
        ]
      }
    ],
    comparisonTitle: 'Perbezaan antara 4D AI dan sumber rasmi',
    comparisonIntro:
      'Kedua-duanya boleh berguna dengan cara berbeza, tetapi tidak patut dianggap sebagai jenis sumber yang sama.',
    comparison: [
      {
        title: '4D AI',
        items: [
          'Penyusunan maklumat bebas.',
          'Paparan keputusan sejarah.',
          'Provider Guide dan ringkasan payout.',
          'Rujukan kajian bantuan AI.',
          'Bukan ramalan rasmi atau penerbitan rasmi.'
        ]
      },
      {
        title: 'Sumber rasmi Provider',
        items: [
          'Keputusan cabutan rasmi.',
          'Peraturan permainan terkini.',
          'Aturan payout dan jackpot.',
          'Peraturan tuntutan hadiah.',
          'Pengumuman rasmi.'
        ]
      }
    ],
    verificationTitle: 'Langkah pengesahan pengguna',
    verificationIntro:
      'Apabila sesuatu butiran penting, gunakan semakan ringkas sebelum bergantung padanya.',
    verificationSteps: [
      'Sahkan nama Provider dan nama permainan.',
      'Semak tarikh cabutan atau nombor cabutan.',
      'Semak nombor cabutan rasmi.',
      'Semak peraturan permainan dan kategori hadiah.',
      'Semak jumlah payout dan aturan jackpot.',
      'Semak peraturan tuntutan hadiah jika berkaitan.',
      'Jika terdapat perbezaan, ikut penerbitan rasmi terkini Provider.'
    ],
    officialTitle: 'Keutamaan maklumat rasmi',
    officialBody:
      'Keputusan rasmi, peraturan permainan, struktur payout, jackpot dan aturan tuntutan hadiah perlu mengikut maklumat rasmi terkini Provider. 4D AI ialah platform bebas, tidak menjual tiket, tidak menerima pertaruhan, tidak memproses tuntutan hadiah dan tidak mendakwa kerjasama rasmi.',
    relatedTitle: 'Maklumat berkaitan',
    relatedLinks: [
      {href: '/about', label: 'Tentang 4D AI'},
      {href: '/faq', label: 'FAQ'},
      {href: '/responsible-gaming', label: 'Permainan Bertanggungjawab'},
      {href: '/how-4d-ai-works', label: 'Bagaimana 4D AI Berfungsi'},
      {href: '/providers/magnum', label: 'Panduan Magnum'},
      {href: '/providers/sports-toto', label: 'Panduan Sports Toto'}
    ]
  }
};

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: PageProps) {
  const {locale} = await params;
  const copy = dataSourcesCopy[locale] ?? dataSourcesCopy.en;

  return buildMetadata({
    locale,
    path: '/data-sources',
    title: copy.metaTitle,
    description: copy.metaDescription
  });
}

export default async function DataSourcesPage({params}: PageProps) {
  const {locale} = await params;
  const copy = dataSourcesCopy[locale] ?? dataSourcesCopy.en;

  return (
    <main className="bg-slate-50 text-slate-900">
      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 text-sm font-semibold text-blue-700">
          <Link href={`/${locale}`} className="hover:text-blue-900">
            4D AI
          </Link>
          <span className="mx-2 text-slate-400">/</span>
          <span>{copy.breadcrumb}</span>
        </div>

        <div className="rounded-md border border-blue-100 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-blue-700">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{copy.title}</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">{copy.intro}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {copy.badges.map((badge) => (
              <span key={badge} className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-800">
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 pb-14 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <div className="space-y-5">
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">{copy.explainsTitle}</h2>
            <p className="mt-3 leading-7 text-slate-700">{copy.explainsIntro}</p>
            <ul className="mt-4 grid gap-3 text-sm leading-6 text-slate-700 md:grid-cols-2">
              {copy.explainsItems.map((item) => (
                <li key={item} className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {copy.sections.map((section) => (
            <section key={section.id} id={section.id} className="scroll-mt-28 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">{section.title}</h2>
              <p className="mt-3 leading-7 text-slate-700">{section.body}</p>
              {section.items ? (
                <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-700">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-blue-600" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">{copy.comparisonTitle}</h2>
            <p className="mt-3 leading-7 text-slate-700">{copy.comparisonIntro}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {copy.comparison.map((column) => (
                <div key={column.title} className="rounded-md border border-blue-100 bg-blue-50 p-4">
                  <h3 className="font-semibold text-blue-950">{column.title}</h3>
                  <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-950">
                    {column.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-950">{copy.verificationTitle}</h2>
            <p className="mt-3 leading-7 text-slate-700">{copy.verificationIntro}</p>
            <ol className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {copy.verificationSteps.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex h-7 w-7 flex-none items-center justify-center rounded-full bg-blue-700 text-xs font-bold text-white">{index + 1}</span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="rounded-md border border-slate-300 bg-slate-100 p-6">
            <h2 className="text-xl font-bold text-slate-950">{copy.officialTitle}</h2>
            <p className="mt-3 leading-7 text-slate-700">{copy.officialBody}</p>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">{copy.relatedTitle}</h2>
            <div className="mt-4 grid gap-2">
              {copy.relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/${locale}${link.href}`}
                  className="rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
