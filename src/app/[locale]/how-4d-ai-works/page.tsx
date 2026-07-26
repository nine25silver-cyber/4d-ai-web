import Link from 'next/link';

import {buildMetadata} from '@/lib/seo';
import {routing, type Locale} from '@/i18n/routing';

type LocalizedLink = {
  href: string;
  label: string;
};

type WorkSection = {
  id: string;
  title: string;
  body: string;
  items?: string[];
};

type WorksCopy = {
  metaTitle: string;
  metaDescription: string;
  breadcrumb: string;
  eyebrow: string;
  title: string;
  intro: string;
  badges: string[];
  doesTitle: string;
  doesIntro: string;
  doesItems: string[];
  doesNotTitle: string;
  doesNotItems: string[];
  sections: WorkSection[];
  responsibleTitle: string;
  responsibleBody: string;
  responsibleLink: string;
  officialTitle: string;
  officialBody: string;
  relatedTitle: string;
  relatedLinks: LocalizedLink[];
};

const worksCopy: Record<Locale, WorksCopy> = {
  en: {
    metaTitle: 'How 4D AI Works | 4D AI',
    metaDescription:
      'Understand how 4D AI organises historical results, frequency and distribution views, AI-assisted analysis, changing recommendations, limitations and uncertainty as an independent informational reference.',
    breadcrumb: 'How 4D AI Works',
    eyebrow: 'Transparent information guide',
    title: 'How 4D AI Works',
    intro:
      '4D AI organises historical result information so users can review past frequency, distribution and trend views more clearly. AI-assisted analysis is provided as general information and research reference only. It does not know future draw numbers, does not promise accuracy, and is not an official Provider prediction.',
    badges: ['Historical data review', 'Research reference', 'Not future certainty'],
    doesTitle: 'What 4D AI does',
    doesIntro:
      'The platform is designed to make historical 4D information easier to inspect. It helps narrow the amount of past data a user may want to review, while keeping final judgment with the user.',
    doesItems: [
      'Organises historical draw results.',
      'Groups information by Provider and time context where the site supports it.',
      'Helps users observe past frequency and distribution.',
      'Provides AI-assisted research references for general information.',
      'Helps narrow a user research range without turning that range into certainty.'
    ],
    doesNotTitle: 'What 4D AI does not do',
    doesNotItems: [
      'It does not know future draw numbers.',
      'It does not promise prediction accuracy or prize outcomes.',
      'It does not represent any Provider.',
      'It does not operate draws, sell tickets, accept bets or process prize claims.',
      'It does not turn historical patterns into future certainty.'
    ],
    sections: [
      {
        id: 'historical-results',
        title: 'Historical results',
        body:
          'Historical results are past information. 4D AI organises result records so users can review what has already happened by time and Provider context where those views exist on the site.',
        items: [
          'Past results can help users look up previous draw information.',
          'Provider grouping keeps different result contexts easier to separate.',
          'Historical records are useful for review and research, not for certainty.',
          'Past occurrence does not mean a future result will repeat.'
        ]
      },
      {
        id: 'frequency-distribution',
        title: 'Frequency and distribution',
        body:
          'Frequency describes how often a number or digit appears inside a selected historical range. Distribution describes how past results are spread across the available data. Both are descriptions of past data only.',
        items: [
          'A high frequency does not mean a future number must appear.',
          'A low frequency does not mean a future number must catch up.',
          'Changing the date range, Provider or filters can change the result view.',
          'These views are research aids, not conclusions about future draws.'
        ]
      },
      {
        id: 'trend-observation',
        title: 'Trend observation',
        body:
          'Trend views summarise how past results appeared within a chosen context. They can change when the time range or available data changes, and visible patterns should be treated as research signals only.',
        items: [
          'A repeated pattern is not a future promise.',
          'Past intervals, sequences or distributions cannot decide the next result.',
          'Trend summaries are useful for reviewing history, not for removing uncertainty.'
        ]
      },
      {
        id: 'ai-analysis',
        title: 'How AI analysis is used',
        body:
          'AI-assisted analysis may combine historical data, user input, query scope, Provider scope, time range and current analysis conditions. The output is intended to help users review a smaller research context.',
        items: [
          'The explanation stays high level and does not disclose or invent model details.',
          'The output is general information, not an official result or Provider instruction.',
          'Users should interpret the output together with their own checks and judgment.'
        ]
      },
      {
        id: 'recommendations-change',
        title: 'Why recommendations can change',
        body:
          'Recommendations can change because the available data, Provider, time range, filters, user input or analysis conditions change. Different outputs at different times are normal.',
        items: [
          'A changed recommendation does not mean one version is closer to the future.',
          'Consistent recommendations should not be treated as proof of accuracy.',
          'Users should not keep regenerating analysis until a preferred number appears.',
          'Updated data can alter frequency, distribution and trend views.'
        ]
      },
      {
        id: 'ai-cannot-do',
        title: 'What AI cannot do',
        body:
          'AI cannot know future draw numbers, remove chance, provide official predictions, replace Provider rules, create income certainty or help recover losses.',
        items: [
          'Historical data cannot decide a future result.',
          'Statistical descriptions do not create cause and effect.',
          'AI output should never replace official Provider information.',
          'No tool on 4D AI should be treated as a prize outcome promise.'
        ]
      },
      {
        id: 'limitations',
        title: 'Limitations and uncertainty',
        body:
          'Analysis is affected by data range, available records, selected conditions and later updates. Patterns may not continue, and AI output may change when the context changes.',
        items: [
          'Users should independently review important information.',
          'Official results, rules, payout, jackpot and claim information should be checked with the relevant Provider.',
          '4D AI is an independent information platform and does not claim official review, approval or partnership.'
        ]
      }
    ],
    responsibleTitle: 'Responsible use',
    responsibleBody:
      '4D involves chance and uncertainty. Do not use essential funds, do not chase losses, and do not treat AI analysis as a source of income. If the activity causes pressure or feels difficult to stop, pause and review the Responsible Gaming guide.',
    responsibleLink: 'Open Responsible Gaming',
    officialTitle: 'Official information comes first',
    officialBody:
      'Official Provider publications should remain the final reference for draw results, game rules, payout structures, jackpot arrangements and prize claims. If 4D AI content differs from official information, the official source takes priority.',
    relatedTitle: 'Related information',
    relatedLinks: [
      {href: '/about', label: 'About 4D AI'},
      {href: '/faq', label: 'FAQ'},
      {href: '/responsible-gaming', label: 'Responsible Gaming'},
      {href: '/data-sources', label: 'Data Sources'},
      {href: '/providers/magnum', label: 'Magnum Guide'},
      {href: '/providers/sports-toto', label: 'Sports Toto Guide'}
    ]
  },
  zh: {
    metaTitle: '4D AI 如何运作 | 4D AI',
    metaDescription:
      '了解 4D AI 如何整理历史开奖结果、频率与分布视图、AI 辅助分析、推荐变化原因、限制与不确定性，并作为独立资讯参考使用。',
    breadcrumb: '4D AI 如何运作',
    eyebrow: '透明资讯指南',
    title: '4D AI 如何运作',
    intro:
      '4D AI 整理历史开奖结果，帮助用户更清楚地查看过去的频率、分布和趋势视图。AI 辅助分析只作为一般资讯和研究参考，不知道未来开奖号码，不承诺准确，也不是 Provider 官方预测。',
    badges: ['历史数据查阅', '研究参考', '不是未来确定性'],
    doesTitle: '4D AI 会做什么',
    doesIntro:
      '平台的目标，是让历史 4D 资讯更容易检查。它可以帮助用户缩小自行研究的数据范围，但最终判断仍应由用户自己完成。',
    doesItems: [
      '整理历史开奖结果。',
      '在网站已有能力范围内，按 Provider 和时间维度展示资料。',
      '帮助用户观察过去的频率和分布。',
      '提供 AI 辅助的一般资讯和研究参考。',
      '协助缩小研究范围，但不把该范围变成确定结果。'
    ],
    doesNotTitle: '4D AI 不会做什么',
    doesNotItems: [
      '不知道未来开奖号码。',
      '不承诺预测准确或奖项结果。',
      '不代表任何 Provider。',
      '不经营开奖、不销售彩票、不接受投注、不处理兑奖。',
      '不会把历史模式变成未来确定结果。'
    ],
    sections: [
      {
        id: 'historical-results',
        title: '历史开奖结果',
        body:
          '历史开奖结果属于过去资料。4D AI 会整理结果记录，让用户在网站已有视图中按时间和 Provider 背景查看已经发生过的结果。',
        items: [
          '过去结果可以帮助用户查询旧的开彩资讯。',
          'Provider 分类让不同结果背景更容易分开查看。',
          '历史记录适合查阅和研究，不提供确定性。',
          '过去出现过的结果，不代表未来会重复。'
        ]
      },
      {
        id: 'frequency-distribution',
        title: '频率与分布',
        body:
          '频率表示号码或数字在指定历史范围内出现的次数。分布表示过去结果在可用数据中的分布情况。两者都只是描述过去数据。',
        items: [
          '高频不代表未来一定出现。',
          '低频不代表未来一定回补。',
          '改变日期范围、Provider 或筛选条件，结果视图可能不同。',
          '这些视图是研究辅助，不是未来开彩结论。'
        ]
      },
      {
        id: 'trend-observation',
        title: '趋势观察',
        body:
          '趋势视图总结指定背景下过去结果的表现。时间范围或可用数据改变时，趋势也可能改变；可见模式应只被视为研究线索。',
        items: [
          '重复出现的模式不是未来承诺。',
          '过去的间隔、连续或分布不能决定下一次结果。',
          '趋势摘要适合回顾历史，不会消除不确定性。'
        ]
      },
      {
        id: 'ai-analysis',
        title: 'AI 分析如何使用',
        body:
          'AI 辅助分析可能结合历史数据、用户输入、查询范围、Provider 范围、时间范围和当前分析条件。输出用于帮助用户查看较小的研究背景。',
        items: [
          '本说明保持高层级，不公开或虚构模型细节。',
          '输出属于一般资讯，不是官方结果或 Provider 指示。',
          '用户应结合自己的核对和判断来理解输出。'
        ]
      },
      {
        id: 'recommendations-change',
        title: '为什么推荐可能变化',
        body:
          '推荐可能因为可用数据、Provider、时间范围、筛选条件、用户输入或分析条件不同而变化。不同时间得到不同输出是正常的。',
        items: [
          '推荐改变不代表某一版更接近未来。',
          '推荐一致也不应被视为准确证明。',
          '用户不应为了得到偏好的号码而反复生成分析。',
          '数据更新会改变频率、分布和趋势视图。'
        ]
      },
      {
        id: 'ai-cannot-do',
        title: 'AI 不能做什么',
        body:
          'AI 不能知道未来开奖号码，不能消除机会因素，不能提供官方预测，不能取代 Provider 规则，不能形成收入确定性，也不能帮助弥补损失。',
        items: [
          '历史数据不能决定未来结果。',
          '统计描述不等于因果关系。',
          'AI 输出不应取代官方 Provider 资讯。',
          '4D AI 上任何工具都不应被视为奖项结果承诺。'
        ]
      },
      {
        id: 'limitations',
        title: '限制与不确定性',
        body:
          '分析结果会受到数据范围、可用记录、筛选条件和后续更新影响。模式不一定持续，AI 输出也可能随背景改变。',
        items: [
          '用户应自行核对重要资讯。',
          '正式结果、规则、派彩、Jackpot 和兑奖资讯，应向相关 Provider 查证。',
          '4D AI 是独立资讯平台，不声称官方审核、批准或合作。'
        ]
      }
    ],
    responsibleTitle: '负责任使用',
    responsibleBody:
      '4D 涉及机会与不确定性。不要使用生活必需资金，不要追逐损失，也不要把 AI 分析视为收入来源。如果活动造成压力或觉得难以停止，请先暂停并阅读负责任参与指南。',
    responsibleLink: '打开负责任参与指南',
    officialTitle: '官方资讯优先',
    officialBody:
      '开彩结果、游戏规则、派彩结构、Jackpot 安排和兑奖资讯，应以官方 Provider 公布为最终参考。如果 4D AI 内容与官方资讯不同，官方来源优先。',
    relatedTitle: '相关资讯',
    relatedLinks: [
      {href: '/about', label: '关于 4D AI'},
      {href: '/faq', label: '常见问题'},
      {href: '/responsible-gaming', label: '负责任参与'},
      {href: '/data-sources', label: '资料来源'},
      {href: '/providers/magnum', label: 'Magnum 指南'},
      {href: '/providers/sports-toto', label: 'Sports Toto 指南'}
    ]
  },
  ms: {
    metaTitle: 'Bagaimana 4D AI Berfungsi | 4D AI',
    metaDescription:
      'Fahami cara 4D AI menyusun keputusan sejarah, paparan kekerapan dan taburan, analisis bantuan AI, perubahan cadangan, had dan ketidakpastian sebagai rujukan maklumat bebas.',
    breadcrumb: 'Bagaimana 4D AI Berfungsi',
    eyebrow: 'Panduan maklumat telus',
    title: 'Bagaimana 4D AI Berfungsi',
    intro:
      '4D AI menyusun maklumat keputusan sejarah supaya pengguna boleh menyemak kekerapan, taburan dan trend lalu dengan lebih jelas. Analisis bantuan AI hanya untuk maklumat umum dan rujukan kajian. Ia tidak mengetahui nombor cabutan masa depan, tidak menjanjikan ketepatan, dan bukan ramalan rasmi Provider.',
    badges: ['Semakan data sejarah', 'Rujukan kajian', 'Bukan kepastian masa depan'],
    doesTitle: 'Apa yang 4D AI lakukan',
    doesIntro:
      'Platform ini bertujuan menjadikan maklumat sejarah 4D lebih mudah diperiksa. Ia membantu mengecilkan julat data lalu yang mungkin ingin disemak pengguna, sementara keputusan akhir kekal pada pengguna.',
    doesItems: [
      'Menyusun keputusan cabutan sejarah.',
      'Memaparkan maklumat mengikut Provider dan konteks masa apabila paparan itu tersedia di laman.',
      'Membantu pengguna melihat kekerapan dan taburan lalu.',
      'Menyediakan rujukan kajian bantuan AI untuk maklumat umum.',
      'Membantu mengecilkan julat kajian tanpa menjadikannya kepastian.'
    ],
    doesNotTitle: 'Apa yang 4D AI tidak lakukan',
    doesNotItems: [
      'Ia tidak mengetahui nombor cabutan masa depan.',
      'Ia tidak menjanjikan ketepatan ramalan atau hasil hadiah.',
      'Ia tidak mewakili mana-mana Provider.',
      'Ia tidak mengendalikan cabutan, menjual tiket, menerima pertaruhan atau memproses tuntutan hadiah.',
      'Ia tidak menukar corak sejarah menjadi kepastian masa depan.'
    ],
    sections: [
      {
        id: 'historical-results',
        title: 'Keputusan sejarah',
        body:
          'Keputusan sejarah ialah maklumat masa lalu. 4D AI menyusun rekod keputusan supaya pengguna boleh menyemak perkara yang sudah berlaku mengikut konteks masa dan Provider apabila paparan itu wujud di laman.',
        items: [
          'Keputusan lalu boleh membantu pengguna mencari maklumat cabutan terdahulu.',
          'Pengelompokan Provider memudahkan konteks keputusan dipisahkan.',
          'Rekod sejarah berguna untuk semakan dan kajian, bukan kepastian.',
          'Kejadian lalu tidak bermaksud keputusan masa depan akan berulang.'
        ]
      },
      {
        id: 'frequency-distribution',
        title: 'Kekerapan dan taburan',
        body:
          'Kekerapan menerangkan berapa kali nombor atau digit muncul dalam julat sejarah yang dipilih. Taburan menerangkan penyebaran keputusan lalu dalam data yang tersedia. Kedua-duanya hanya menerangkan data masa lalu.',
        items: [
          'Kekerapan tinggi tidak bermaksud nombor masa depan mesti muncul.',
          'Kekerapan rendah tidak bermaksud nombor masa depan mesti mengejar.',
          'Perubahan julat tarikh, Provider atau penapis boleh mengubah paparan hasil.',
          'Paparan ini ialah bantuan kajian, bukan kesimpulan cabutan masa depan.'
        ]
      },
      {
        id: 'trend-observation',
        title: 'Pemerhatian trend',
        body:
          'Paparan trend meringkaskan cara keputusan lalu muncul dalam konteks pilihan. Ia boleh berubah apabila julat masa atau data tersedia berubah, dan corak yang kelihatan perlu dianggap sebagai isyarat kajian sahaja.',
        items: [
          'Corak berulang bukan janji masa depan.',
          'Selang, turutan atau taburan lalu tidak boleh menentukan keputusan seterusnya.',
          'Ringkasan trend berguna untuk menyemak sejarah, bukan untuk menghapuskan ketidakpastian.'
        ]
      },
      {
        id: 'ai-analysis',
        title: 'Cara analisis AI digunakan',
        body:
          'Analisis bantuan AI boleh menggabungkan data sejarah, input pengguna, skop carian, skop Provider, julat masa dan keadaan analisis semasa. Output bertujuan membantu pengguna menyemak konteks kajian yang lebih kecil.',
        items: [
          'Penerangan ini kekal pada tahap umum dan tidak mendedahkan atau mencipta butiran model.',
          'Output ialah maklumat umum, bukan keputusan rasmi atau arahan Provider.',
          'Pengguna perlu mentafsir output bersama semakan dan pertimbangan sendiri.'
        ]
      },
      {
        id: 'recommendations-change',
        title: 'Mengapa cadangan boleh berubah',
        body:
          'Cadangan boleh berubah kerana data tersedia, Provider, julat masa, penapis, input pengguna atau keadaan analisis berubah. Output berbeza pada masa berbeza ialah perkara biasa.',
        items: [
          'Cadangan berubah tidak bermaksud satu versi lebih dekat dengan masa depan.',
          'Cadangan yang konsisten tidak patut dianggap bukti ketepatan.',
          'Pengguna tidak patut mengulang analisis semata-mata untuk mendapatkan nombor pilihan.',
          'Data dikemas kini boleh mengubah paparan kekerapan, taburan dan trend.'
        ]
      },
      {
        id: 'ai-cannot-do',
        title: 'Apa yang AI tidak boleh lakukan',
        body:
          'AI tidak boleh mengetahui nombor cabutan masa depan, menghapuskan peluang, menyediakan ramalan rasmi, menggantikan peraturan Provider, mencipta kepastian pendapatan atau membantu menampung kerugian.',
        items: [
          'Data sejarah tidak boleh menentukan keputusan masa depan.',
          'Huraian statistik tidak mencipta sebab dan akibat.',
          'Output AI tidak patut menggantikan maklumat rasmi Provider.',
          'Tiada alat di 4D AI patut dianggap sebagai janji hasil hadiah.'
        ]
      },
      {
        id: 'limitations',
        title: 'Had dan ketidakpastian',
        body:
          'Analisis dipengaruhi oleh julat data, rekod tersedia, syarat pilihan dan kemas kini kemudian. Corak mungkin tidak berterusan, dan output AI boleh berubah apabila konteks berubah.',
        items: [
          'Pengguna perlu menyemak maklumat penting secara bebas.',
          'Keputusan rasmi, peraturan, payout, jackpot dan tuntutan hadiah perlu disemak dengan Provider berkaitan.',
          '4D AI ialah platform maklumat bebas dan tidak mendakwa semakan, kelulusan atau kerjasama rasmi.'
        ]
      }
    ],
    responsibleTitle: 'Penggunaan bertanggungjawab',
    responsibleBody:
      '4D melibatkan peluang dan ketidakpastian. Jangan gunakan wang keperluan, jangan mengejar kerugian, dan jangan anggap analisis AI sebagai sumber pendapatan. Jika aktiviti menyebabkan tekanan atau sukar dihentikan, berhenti seketika dan semak panduan Permainan Bertanggungjawab.',
    responsibleLink: 'Buka Permainan Bertanggungjawab',
    officialTitle: 'Maklumat rasmi diutamakan',
    officialBody:
      'Penerbitan rasmi Provider perlu kekal sebagai rujukan akhir untuk keputusan cabutan, peraturan permainan, struktur payout, aturan jackpot dan tuntutan hadiah. Jika kandungan 4D AI berbeza daripada maklumat rasmi, sumber rasmi perlu diutamakan.',
    relatedTitle: 'Maklumat berkaitan',
    relatedLinks: [
      {href: '/about', label: 'Tentang 4D AI'},
      {href: '/faq', label: 'FAQ'},
      {href: '/responsible-gaming', label: 'Permainan Bertanggungjawab'},
      {href: '/data-sources', label: 'Sumber Data'},
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
  const copy = worksCopy[locale] ?? worksCopy.en;

  return buildMetadata({
    locale,
    path: '/how-4d-ai-works',
    title: copy.metaTitle,
    description: copy.metaDescription
  });
}

export default async function How4DAIWorksPage({params}: PageProps) {
  const {locale} = await params;
  const copy = worksCopy[locale] ?? worksCopy.en;

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
            <h2 className="text-xl font-bold text-slate-950">{copy.doesTitle}</h2>
            <p className="mt-3 leading-7 text-slate-700">{copy.doesIntro}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
                <h3 className="font-semibold text-blue-950">{copy.doesTitle}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-blue-950">
                  {copy.doesItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
                <h3 className="font-semibold text-slate-950">{copy.doesNotTitle}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                  {copy.doesNotItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
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

          <section className="rounded-md border border-blue-100 bg-blue-50 p-6">
            <h2 className="text-xl font-bold text-blue-950">{copy.responsibleTitle}</h2>
            <p className="mt-3 leading-7 text-blue-950">{copy.responsibleBody}</p>
            <Link href={`/${locale}/responsible-gaming`} className="mt-4 inline-flex rounded-md border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-blue-800 hover:border-blue-300 hover:text-blue-950">
              {copy.responsibleLink}
            </Link>
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
