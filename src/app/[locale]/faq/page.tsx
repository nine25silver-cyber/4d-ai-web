import Link from 'next/link';
import type {Metadata} from 'next';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqCategory = {
  id: string;
  title: string;
  items: FaqItem[];
};

type FaqPageCopy = {
  metaTitle: string;
  metaDescription: string;
  breadcrumb: {
    home: string;
    more: string;
    faq: string;
  };
  eyebrow: string;
  title: string;
  intro: string;
  tags: string[];
  categoryNavTitle: string;
  categories: FaqCategory[];
  responsibleTitle: string;
  responsibleText: string;
  relatedTitle: string;
  relatedLinks: {
    href: string;
    label: string;
  }[];
};

const faqCopy: Record<Locale, FaqPageCopy> = {
  en: {
    metaTitle: '4D AI FAQ | Results, Data, AI Analysis and Game Terms',
    metaDescription: 'Find answers about 4D AI, historical result data, AI-assisted analysis, common 4D terms and Provider payout information. Content is provided for general reference.',
    breadcrumb: {home: 'Home', more: 'More', faq: 'FAQ'},
    eyebrow: 'Information Guide',
    title: 'Frequently Asked Questions',
    intro: 'Find answers to common questions about 4D AI, historical result data, number-game terminology, AI-assisted analysis and Provider payout information. The content on this page is intended for general information only.',
    tags: ['Information Guide', 'Three Languages', 'Reference Only'],
    categoryNavTitle: 'FAQ categories',
    categories: [
      {
        id: 'about-4d-ai',
        title: 'About 4D AI',
        items: [
          {
            question: 'What is 4D AI?',
            answer: '4D AI is an independent information and historical-data platform. It organises past draw results and provides tools that help users review number frequencies, distributions and historical patterns. It does not operate lottery games or promise future results.'
          },
          {
            question: 'Does 4D AI sell tickets or accept bets?',
            answer: 'No. 4D AI does not sell tickets, accept entries, operate draws or process prize claims. It provides information and analytical tools only, so any official game activity should be handled through the relevant Provider channels.'
          },
          {
            question: 'Is 4D AI affiliated with the listed Providers?',
            answer: 'The Provider pages are independent information guides unless an official relationship is explicitly stated and verifiable. Provider names are used to identify the relevant result and game information. This helps users find the right context without implying an official partnership.'
          }
        ]
      },
      {
        id: 'results-and-data',
        title: 'Results and Data',
        items: [
          {
            question: 'Where does the result information come from?',
            answer: 'Results are organised from available Provider result data used by the website. Official Provider publications remain the final reference for draw results and game rules. Users should verify important or time-sensitive information with the relevant Provider.'
          },
          {
            question: 'How often are results updated?',
            answer: 'Results are updated according to the website available data feed and processing schedule. Delays may occur because data can depend on publication timing and processing steps. Time-sensitive results should be checked with the relevant Provider before being relied on.'
          },
          {
            question: 'What should I do if a displayed result differs from an official result?',
            answer: 'Use the Provider latest official publication as the final reference. Website data may be delayed, incomplete or affected by processing errors, and any discrepancy should be treated cautiously. The safest action is to compare the draw date, draw number and prize category against the Provider publication.'
          },
          {
            question: 'Does historical data predict future draws?',
            answer: 'No. Historical data describes past outcomes only. A pattern or frequency observed in previous draws does not determine what will happen in a future draw. Historical views are useful for review and research, not certainty.'
          }
        ]
      },
      {
        id: 'ai-and-analysis',
        title: 'AI and Analysis',
        items: [
          {
            question: 'How does 4D AI analyse historical results?',
            answer: 'The platform may organise historical data by frequency, distribution, repetition and related statistical comparisons. These methods help users review large amounts of past data more efficiently. They do not create certainty about future results.'
          },
          {
            question: 'How should AI recommendations be interpreted?',
            answer: 'AI-assisted analysis is informational and should not be treated as a promise of any result. Number games involve chance, and an analytical output can be incomplete, delayed or unsuitable for a user specific situation.'
          },
          {
            question: 'What can AI analysis help users review?',
            answer: 'AI can help organise signals and compare historical patterns, but it cannot remove uncertainty from a future draw. Any recommendation should be viewed as a research aid, not as evidence that a number will appear.'
          }
        ]
      },
      {
        id: 'game-terminology',
        title: 'Game Terminology',
        items: [
          {
            question: 'What is a 4D number?',
            answer: 'A 4D number is a four-digit combination from 0000 to 9999. The entry method, coverage and prize category depend on the relevant Provider and game type. Users should check the rules for the specific game they are reviewing.'
          },
          {
            question: 'What is the difference between Big and Small?',
            answer: 'Big commonly covers the first, second, third, special and consolation prize categories. Small commonly covers only the first three prize categories and may use different fixed payouts. Exact rules vary by Provider.'
          },
          {
            question: 'What is a permutation entry?',
            answer: 'A permutation entry covers valid arrangements of the selected digits. The number of arrangements depends on whether digits repeat, so different combinations may fall into different permutation categories. Payouts and coverage should be checked against the Provider rules.'
          },
          {
            question: 'What is a jackpot?',
            answer: 'A jackpot is a prize pool governed by the relevant game rules. Some jackpots begin from a stated minimum amount and may accumulate, but the displayed amount does not necessarily represent what each individual winner will receive. Sharing and qualification rules can differ by game.'
          }
        ]
      },
      {
        id: 'payouts-and-responsible-use',
        title: 'Payouts and Responsible Use',
        items: [
          {
            question: 'Are the payout figures on 4D AI always current?',
            answer: 'The figures are provided for general reference and may not always reflect a recent Provider revision. Users should verify game rules, payout amounts and jackpot arrangements against the Provider latest official publication. This is especially important when a payout table is used for a current decision.'
          },
          {
            question: 'How should 4D information and analysis be used responsibly?',
            answer: 'Treat number games as activities involving chance and uncertainty. Do not rely on historical analysis as a source of promised income, and do not spend money needed for essential living costs. Users should follow applicable age restrictions and local laws.'
          }
        ]
      }
    ],
    responsibleTitle: 'Responsible use',
    responsibleText: '4D games involve chance and uncertain outcomes. Historical data and analytical tools should not be treated as a promise of income or a way to recover losses. Follow applicable age restrictions, local laws and personal spending limits.',
    relatedTitle: 'Related information',
    relatedLinks: [
      {href: '/about', label: 'About 4D AI'},
      {href: '/how-4d-ai-works', label: 'How 4D AI Works'},
      {href: '/responsible-gaming', label: 'Responsible Gaming Guide'},
      {href: '/providers/magnum', label: 'Magnum Provider Guide'},
      {href: '/providers/da-ma-cai', label: 'Da Ma Cai Provider Guide'},
      {href: '/providers/sports-toto', label: 'Sports Toto Provider Guide'}
    ]
  },
  zh: {
    metaTitle: '4D AI 常见问题｜开奖结果、数据分析与游戏术语',
    metaDescription: '了解 4D AI、历史开奖结果、AI 辅助分析、常见 4D 游戏术语及 Provider 派彩资料。页面内容仅供一般资讯参考。',
    breadcrumb: {home: '首页', more: '更多', faq: '常见问题'},
    eyebrow: '资讯指南',
    title: '常见问题',
    intro: '本页面整理关于 4D AI、历史开奖结果、数字游戏常用术语、AI 辅助分析和 Provider 派彩资料的常见问题。所有内容仅供一般资讯参考。',
    tags: ['资讯指南', '三语内容', '仅供参考'],
    categoryNavTitle: 'FAQ 分类',
    categories: [
      {
        id: 'about-4d-ai',
        title: '关于 4D AI',
        items: [
          {
            question: '什么是 4D AI？',
            answer: '4D AI 是独立的资讯与历史数据平台，整理过去的开奖结果，并提供号码频率、分布及历史趋势等分析工具。网站不经营彩票游戏，也不保证未来开奖结果。'
          },
          {
            question: '4D AI 是否销售票券或接受投注？',
            answer: '不是。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。网站只提供资讯和分析工具，任何正式游戏活动都应通过相关 Provider 渠道处理。'
          },
          {
            question: '4D AI 是否与页面中的 Provider 有官方合作？',
            answer: '除非页面明确说明并且能够核实，否则 Provider 页面均属于独立资讯指南。Provider 名称仅用于识别相关开奖结果和游戏资料，方便用户找到对应内容，并不代表官方合作关系。'
          }
        ]
      },
      {
        id: 'results-and-data',
        title: '开奖结果与数据',
        items: [
          {
            question: '开奖结果资料来自哪里？',
            answer: '网站依据可用的 Provider 开奖资料进行整理。最终结果仍应以相关 Provider 的正式公布为准。对于重要或时间敏感的资料，用户应再次向相关 Provider 核对。'
          },
          {
            question: '开奖结果多久更新一次？',
            answer: '结果会根据网站当前可用的数据来源及处理流程更新。资料可能因为公布时间或处理步骤而出现延迟。对时间敏感的结果，应先向相关 Provider 核对后再使用。'
          },
          {
            question: '如果网站显示的结果与官方结果不同，应怎么办？',
            answer: '应以 Provider 最新官方公布为最终依据。网站资料可能因延迟、不完整或处理错误产生差异，遇到不一致时应谨慎核对。建议同时比较开奖日期、期号和奖项类别。'
          },
          {
            question: '历史数据能预测未来开奖结果吗？',
            answer: '不能。历史数据只反映过去的结果。过去出现的规律或频率并不能决定未来某次开奖会出现什么号码。历史视图适合用于查阅和研究，而不是提供确定性。'
          }
        ]
      },
      {
        id: 'ai-and-analysis',
        title: 'AI 与分析',
        items: [
          {
            question: '4D AI 如何分析历史结果？',
            answer: '平台会根据号码频率、分布、重复情况及其他统计比较方式整理历史数据。这些工具帮助用户更有效率地查看大量过往资料，但不会对未来结果形成确定性。'
          },
          {
            question: '应如何理解 AI 推荐？',
            answer: 'AI 辅助分析仅供资讯参考，不应被视为任何结果的承诺。数字游戏涉及机会，分析输出也可能不完整、延迟或不适合特定用户情况。'
          },
          {
            question: 'AI 分析可以帮助用户查看什么？',
            answer: 'AI 可以帮助整理信号和比较历史模式，但不能消除未来开奖的不确定性。任何推荐都应被视为研究辅助，而不是某个号码将会出现的证据。'
          }
        ]
      },
      {
        id: 'game-terminology',
        title: '游戏术语',
        items: [
          {
            question: '什么是 4D 号码？',
            answer: '4D 号码是一组从 0000 至 9999 的四位数字组合。具体参与方式、覆盖范围和奖项类别取决于相关 Provider 及游戏类型。用户应查看对应游戏的规则。'
          },
          {
            question: '大和小有什么区别？',
            answer: '大通常涵盖头奖、二奖、三奖、特别奖和安慰奖。小通常只涵盖前三奖，并可能采用不同的固定派彩。实际规则会因 Provider 而异。'
          },
          {
            question: '什么是全保或排列投注？',
            answer: '全保或排列投注涵盖所选数字可组成的有效排列。排列数量取决于是否存在重复数字，因此不同号码组合可能属于不同的排列类别。实际派彩和覆盖范围应以 Provider 规则为准。'
          },
          {
            question: '什么是 Jackpot？',
            answer: 'Jackpot 是按照相关游戏规则运作的奖池。部分奖池设有最低起始金额并可能累积，但页面显示的金额不代表每一名得主必然获得全部金额。分享和资格规则可能因游戏而不同。'
          }
        ]
      },
      {
        id: 'payouts-and-responsible-use',
        title: '派彩与负责任使用',
        items: [
          {
            question: '4D AI 的派彩金额是否永远是最新的？',
            answer: '页面金额仅供一般参考，未必能即时反映 Provider 的最新调整。用户应根据 Provider 最新官方公布核对游戏规则、派彩金额和 Jackpot 安排。若资料用于当前决策，核对尤其重要。'
          },
          {
            question: '应该如何负责任地使用 4D 资讯和分析？',
            answer: '数字游戏涉及机会与不确定性，不应把历史分析视为承诺收入的来源，也不应使用生活必需资金参与。用户应遵守适用的年龄限制和当地法律。'
          }
        ]
      }
    ],
    responsibleTitle: '负责任使用',
    responsibleText: '4D 游戏涉及机会与不确定结果。历史数据和分析工具不应被视为收入保证，也不应用来追回损失。请遵守适用的年龄限制、当地法律及个人支出上限。',
    relatedTitle: '相关资讯',
    relatedLinks: [
      {href: '/about', label: '关于 4D AI'},
      {href: '/how-4d-ai-works', label: '4D AI 如何运作'},
      {href: '/responsible-gaming', label: '负责任参与指南'},
      {href: '/providers/magnum', label: 'Magnum Provider 指南'},
      {href: '/providers/da-ma-cai', label: '大马彩 Provider 指南'},
      {href: '/providers/sports-toto', label: '多多博彩 Provider 指南'}
    ]
  },
  ms: {
    metaTitle: 'Soalan Lazim 4D AI | Keputusan, Analisis Data dan Istilah Permainan',
    metaDescription: 'Dapatkan jawapan mengenai 4D AI, data keputusan sejarah, analisis berbantu AI, istilah permainan 4D dan maklumat bayaran penyedia. Kandungan adalah untuk rujukan umum.',
    breadcrumb: {home: 'Laman Utama', more: 'Lagi', faq: 'Soalan Lazim'},
    eyebrow: 'Panduan Maklumat',
    title: 'Soalan Lazim',
    intro: 'Halaman ini menghimpunkan jawapan kepada soalan lazim mengenai 4D AI, data keputusan sejarah, istilah permainan nombor, analisis berbantu AI dan maklumat bayaran hadiah penyedia. Semua kandungan disediakan untuk maklumat umum sahaja.',
    tags: ['Panduan Maklumat', 'Tiga Bahasa', 'Untuk Rujukan Sahaja'],
    categoryNavTitle: 'Kategori FAQ',
    categories: [
      {
        id: 'about-4d-ai',
        title: 'Mengenai 4D AI',
        items: [
          {
            question: 'Apakah 4D AI?',
            answer: '4D AI ialah platform maklumat dan data sejarah yang bebas. Ia menyusun keputusan cabutan terdahulu dan menyediakan alat untuk meneliti kekerapan nombor, taburan serta corak sejarah. Ia tidak mengendalikan permainan loteri dan tidak menjamin keputusan masa hadapan.'
          },
          {
            question: 'Adakah 4D AI menjual tiket atau menerima pertaruhan?',
            answer: 'Tidak. 4D AI tidak menjual tiket, menerima penyertaan, mengendalikan cabutan atau memproses tuntutan hadiah. Ia hanya menyediakan maklumat dan alat analisis, manakala aktiviti rasmi perlu dirujuk kepada saluran penyedia berkaitan.'
          },
          {
            question: 'Adakah 4D AI mempunyai hubungan rasmi dengan penyedia yang disenaraikan?',
            answer: 'Melainkan dinyatakan dengan jelas dan boleh disahkan, halaman penyedia ialah panduan maklumat bebas. Nama penyedia digunakan untuk mengenal pasti keputusan dan maklumat permainan berkaitan. Ini tidak bermaksud terdapat kerjasama rasmi.'
          }
        ]
      },
      {
        id: 'results-and-data',
        title: 'Keputusan dan Data',
        items: [
          {
            question: 'Dari manakah maklumat keputusan diperoleh?',
            answer: 'Keputusan disusun berdasarkan data keputusan penyedia yang tersedia kepada laman ini. Penerbitan rasmi penyedia kekal sebagai rujukan muktamad untuk keputusan cabutan dan peraturan permainan. Maklumat penting atau sensitif kepada masa perlu disemak semula dengan penyedia berkaitan.'
          },
          {
            question: 'Berapa kerap keputusan dikemas kini?',
            answer: 'Keputusan dikemas kini berdasarkan suapan data dan jadual pemprosesan yang tersedia kepada laman ini. Kelewatan mungkin berlaku kerana masa penerbitan dan proses pengendalian data. Keputusan yang sensitif kepada masa perlu disemak dengan penyedia berkaitan.'
          },
          {
            question: 'Apakah yang perlu dilakukan jika keputusan di laman berbeza daripada keputusan rasmi?',
            answer: 'Gunakan penerbitan rasmi terkini daripada penyedia sebagai rujukan akhir. Data laman mungkin tertangguh, tidak lengkap atau terjejas oleh kesilapan pemprosesan. Bandingkan tarikh cabutan, nombor cabutan dan kategori hadiah dengan penerbitan penyedia.'
          },
          {
            question: 'Adakah data sejarah boleh meramalkan cabutan akan datang?',
            answer: 'Tidak. Data sejarah hanya menerangkan keputusan terdahulu. Corak atau kekerapan dalam cabutan lalu tidak menentukan keputusan cabutan akan datang. Paparan sejarah sesuai untuk semakan dan kajian, bukan kepastian.'
          }
        ]
      },
      {
        id: 'ai-and-analysis',
        title: 'AI dan Analisis',
        items: [
          {
            question: 'Bagaimanakah 4D AI menganalisis keputusan sejarah?',
            answer: 'Platform boleh menyusun data sejarah berdasarkan kekerapan, taburan, pengulangan dan perbandingan statistik berkaitan. Kaedah ini membantu pengguna meneliti data lalu dengan lebih teratur. Namun, kaedah ini tidak memberikan kepastian tentang keputusan masa hadapan.'
          },
          {
            question: 'Bagaimanakah cadangan AI patut ditafsirkan?',
            answer: 'Analisis berbantu AI bersifat maklumat dan tidak patut dianggap sebagai janji terhadap apa-apa keputusan. Permainan nombor melibatkan peluang, dan hasil analisis boleh menjadi tidak lengkap, tertangguh atau tidak sesuai untuk keadaan tertentu.'
          },
          {
            question: 'Apakah yang boleh dibantu oleh analisis AI?',
            answer: 'AI boleh membantu menyusun isyarat dan membandingkan corak sejarah, tetapi ia tidak boleh menghapuskan ketidakpastian cabutan akan datang. Sebarang cadangan perlu dilihat sebagai bantuan kajian, bukan bukti bahawa nombor tertentu akan muncul.'
          }
        ]
      },
      {
        id: 'game-terminology',
        title: 'Istilah Permainan',
        items: [
          {
            question: 'Apakah nombor 4D?',
            answer: 'Nombor 4D ialah gabungan empat digit dari 0000 hingga 9999. Kaedah penyertaan, liputan dan kategori hadiah bergantung pada penyedia dan jenis permainan berkaitan. Pengguna perlu menyemak peraturan permainan tertentu.'
          },
          {
            question: 'Apakah perbezaan antara Big dan Small?',
            answer: 'Big lazimnya meliputi hadiah pertama, kedua, ketiga, khas dan saguhati. Small lazimnya hanya meliputi tiga hadiah utama dan mungkin menggunakan bayaran tetap yang berbeza. Peraturan sebenar berbeza mengikut penyedia.'
          },
          {
            question: 'Apakah penyertaan permutation?',
            answer: 'Penyertaan permutation meliputi susunan sah bagi digit yang dipilih. Bilangan susunan bergantung pada kewujudan digit berulang, jadi gabungan yang berbeza boleh berada dalam kategori susunan berlainan. Liputan dan bayaran perlu disemak dengan peraturan penyedia.'
          },
          {
            question: 'Apakah jackpot?',
            answer: 'Jackpot ialah kumpulan hadiah yang tertakluk pada peraturan permainan berkaitan. Sesetengah jackpot bermula daripada jumlah minimum dan boleh terkumpul, tetapi jumlah yang dipaparkan tidak semestinya diterima sepenuhnya oleh setiap pemenang. Peraturan perkongsian boleh berbeza mengikut permainan.'
          }
        ]
      },
      {
        id: 'payouts-and-responsible-use',
        title: 'Bayaran dan Penggunaan Bertanggungjawab',
        items: [
          {
            question: 'Adakah angka bayaran di 4D AI sentiasa terkini?',
            answer: 'Angka tersebut disediakan untuk rujukan umum dan mungkin tidak sentiasa mencerminkan pindaan terkini oleh penyedia. Pengguna perlu menyemak peraturan, jumlah bayaran dan aturan jackpot berdasarkan penerbitan rasmi terkini. Semakan ini lebih penting apabila angka digunakan untuk keputusan semasa.'
          },
          {
            question: 'Bagaimanakah maklumat dan analisis 4D patut digunakan secara bertanggungjawab?',
            answer: 'Permainan nombor melibatkan peluang dan ketidakpastian. Jangan bergantung pada analisis sejarah sebagai sumber pendapatan yang dijamin dan jangan gunakan wang untuk keperluan asas. Pengguna perlu mematuhi sekatan umur dan undang-undang tempatan.'
          }
        ]
      }
    ],
    responsibleTitle: 'Penggunaan bertanggungjawab',
    responsibleText: 'Permainan 4D melibatkan peluang dan keputusan yang tidak pasti. Data sejarah dan alat analisis tidak boleh dianggap sebagai jaminan pendapatan atau cara untuk mendapatkan semula kerugian. Patuhi sekatan umur, undang-undang tempatan dan had perbelanjaan peribadi.',
    relatedTitle: 'Maklumat berkaitan',
    relatedLinks: [
      {href: '/about', label: 'Tentang 4D AI'},
      {href: '/how-4d-ai-works', label: 'Bagaimana 4D AI Berfungsi'},
      {href: '/responsible-gaming', label: 'Panduan Permainan Bertanggungjawab'},
      {href: '/providers/magnum', label: 'Panduan Penyedia Magnum'},
      {href: '/providers/da-ma-cai', label: 'Panduan Penyedia Da Ma Cai'},
      {href: '/providers/sports-toto', label: 'Panduan Penyedia Sports Toto'}
    ]
  }
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({locale}));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale}>}): Promise<Metadata> {
  const {locale} = await params;
  const copy = faqCopy[locale];
  return buildMetadata({locale, path: '/faq', title: copy.metaTitle, description: copy.metaDescription});
}

export default async function FaqPage({params}: {params: Promise<{locale: Locale}>}) {
  const {locale} = await params;
  const copy = faqCopy[locale];
  const faqCount = copy.categories.reduce((count, category) => count + category.items.length, 0);

  return (
    <main className="container-shell py-8">
      <nav className="mb-5 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500" aria-label="Breadcrumb">
        <Link href={`/${locale}`} className="text-blue-800 hover:text-blue-950">{copy.breadcrumb.home}</Link>
        <span aria-hidden="true">/</span>
        <span>{copy.breadcrumb.more}</span>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-slate-700">{copy.breadcrumb.faq}</span>
      </nav>

      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.12em] text-blue-800">{copy.eyebrow}</p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-slate-950 sm:text-4xl">{copy.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">{copy.intro}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {copy.tags.map((tag) => (
            <span key={tag} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">{tag}</span>
          ))}
        </div>
      </section>

      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" aria-label={copy.categoryNavTitle}>
        <h2 className="text-base font-black text-slate-950">{copy.categoryNavTitle}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {copy.categories.map((category) => (
            <a key={category.id} href={`#${category.id}`} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-blue-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
              {category.title}
            </a>
          ))}
        </div>
      </section>

      <div className="mt-8 space-y-8">
        {copy.categories.map((category, categoryIndex) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <div className="mb-4 border-b border-slate-200 pb-3">
              <p className="text-sm font-black text-blue-800">{category.items.length} / {faqCount}</p>
              <h2 className="mt-1 text-2xl font-black text-slate-950">{category.title}</h2>
            </div>
            <div className="space-y-3">
              {category.items.map((item, itemIndex) => (
                <details key={item.question} open={categoryIndex === 0 && itemIndex === 0} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <summary className="cursor-pointer text-base font-black leading-6 text-slate-950 outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                    {item.question}
                  </summary>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-5 text-sm leading-7 text-blue-950">
        <h2 className="text-lg font-black text-blue-950">{copy.responsibleTitle}</h2>
        <p className="mt-2">{copy.responsibleText}</p>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-black text-slate-950">{copy.relatedTitle}</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {copy.relatedLinks.map((link) => (
            <Link key={link.href} href={`/${locale}${link.href}`} className="rounded-lg border border-slate-200 bg-white p-4 text-sm font-black text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-blue-900">
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
