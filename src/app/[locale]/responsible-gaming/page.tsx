import Link from 'next/link';

import { buildMetadata } from '@/lib/seo';
import { routing, type Locale } from '@/i18n/routing';

type ResponsibleGamingCopy = {
  metaTitle: string;
  metaDescription: string;
  breadcrumb: string;
  eyebrow: string;
  title: string;
  intro: string;
  badges: string[];
  sections: {
    id: string;
    title: string;
    body: string;
    items?: string[];
  }[];
  roleTitle: string;
  roleIntro: string;
  doesTitle: string;
  doesItems: string[];
  doesNotTitle: string;
  doesNotItems: string[];
  checklistTitle: string;
  checklistIntro: string;
  checklistItems: string[];
  noteTitle: string;
  noteBody: string;
  relatedTitle: string;
  relatedLinks: {
    href: string;
    label: string;
  }[];
};

const responsibleGamingCopy: Record<Locale, ResponsibleGamingCopy> = {
  en: {
    metaTitle: 'Responsible Gaming Guide | 4D AI',
    metaDescription:
      'Learn how to use 4D AI responsibly, understand chance and uncertainty, set financial boundaries, and treat AI and historical data as information only.',
    breadcrumb: 'Responsible Gaming',
    eyebrow: 'Player safety and informed use',
    title: 'Responsible Gaming Guide',
    intro:
      'This guide explains responsible participation, chance and uncertainty, financial boundaries, and the limits of AI and historical data. 4D AI is an independent information platform. Analysis is not an income source, a way to recover losses, or a promised result.',
    badges: ['Information only', 'No ticket sales', 'No promised result'],
    sections: [
      {
        id: 'meaning',
        title: 'What responsible participation means',
        body:
          'Responsible participation starts with accepting uncertainty. Any 4D-related activity should stay optional, affordable, and separate from essential financial decisions.',
        items: [
          'Treat number analysis as information, not certainty.',
          'Set a fixed limit before you begin and stop at that limit.',
          'Do not use 4D activity to solve financial pressure, debt, stress, or family obligations.',
          'Pause when the activity no longer feels calm, optional, or controlled.'
        ]
      },
      {
        id: 'chance',
        title: 'Chance, uncertainty, and historical data',
        body:
          '4D results involve chance and uncertainty. Historical results, frequency tables, hot or cold numbers, and visible patterns describe the past only. They do not determine future outcomes or create a steady return.',
        items: [
          'Past draws do not make a future number certain.',
          'A repeated pattern is still not a promise about the next draw.',
          'AI-assisted analysis cannot know future results.',
          'No model, chart, ranking, or guide should be treated as official prediction.'
        ]
      },
      {
        id: 'financial-boundaries',
        title: 'Financial boundaries',
        body:
          'Only use money that you can afford to lose without affecting daily life. If the amount would affect rent, food, transport, tuition, medical needs, bills, savings, or debt repayment, do not use it for 4D activity.',
        items: [
          'Do not borrow money for 4D activity.',
          'Do not increase spending because of a previous result.',
          'Do not treat tools, guides, or AI output as investment advice.',
          'Keep essential expenses and savings separate before any optional entertainment spending.'
        ]
      },
      {
        id: 'losses',
        title: 'Do not chase losses',
        body:
          'Trying to recover losses can quickly turn an optional activity into a harmful cycle. Previous losses do not improve the next outcome, and spending more does not reduce uncertainty.',
        items: [
          'Stop when you reach your limit, even after an unfavourable result.',
          'Avoid changing your plan in the hope of making back earlier losses.',
          'Do not use AI analysis as a recovery tool.',
          'Take a break if you feel stress, pressure, anger, secrecy, or loss of control.'
        ]
      },
      {
        id: 'ai-limits',
        title: 'Limits of AI and recommendations',
        body:
          '4D AI can organise historical results, provider information, frequency views, and general research. Recommendations may change when inputs, draw history, data updates, or ranking conditions change. They remain informational and cannot remove uncertainty.',
        items: [
          'AI output is not an official result, official prediction, or provider instruction.',
          'AI cannot see future draws or promise accuracy.',
          'Different filters can produce different suggestions.',
          'Users remain responsible for whether and how they use the information.'
        ]
      },
      {
        id: 'pause',
        title: 'Signs to pause and reassess',
        body:
          'Consider stepping away and speaking with someone you trust if 4D activity starts to affect your mood, finances, time, work, study, relationships, or sleep.',
        items: [
          'You spend more than planned or hide the amount from others.',
          'You feel pressure to continue after a loss.',
          'You use essential funds or borrowed money.',
          'You feel unable to stop, even when you planned to stop.',
          'You believe a tool or pattern must produce a result.'
        ]
      },
      {
        id: 'official-info',
        title: 'Official information comes first',
        body:
          'Official provider publications should always be treated as the source of truth for results, rules, payout structures, jackpot mechanics, and prize claims. If 4D AI content differs from official information, the official source takes priority.',
        items: [
          '4D AI does not operate official draws.',
          '4D AI does not process prize claims.',
          '4D AI does not represent, review for, or act on behalf of any provider.',
          'Provider guides are independent informational references.'
        ]
      }
    ],
    roleTitle: 'What 4D AI does and does not do',
    roleIntro:
      'The platform is built for information, organisation, and research support. It should not be treated as a betting service, financial service, or certainty engine.',
    doesTitle: '4D AI does',
    doesItems: [
      'Organise historical 4D results and provider information.',
      'Provide charts, summaries, guides, and general explanations.',
      'Help users compare past data more easily.',
      'Remind users to check official provider sources.'
    ],
    doesNotTitle: '4D AI does not',
    doesNotItems: [
      'Sell tickets, accept bets, or operate draws.',
      'Promise prizes, income, accuracy, or future results.',
      'Provide a way to recover losses.',
      'Act as an official provider channel or prize claim service.'
    ],
    checklistTitle: 'Quick self-check',
    checklistIntro:
      'If several of these questions feel uncomfortable, it may be a good time to pause and reassess before using any 4D-related information.',
    checklistItems: [
      'Have I set a fixed limit before starting?',
      'Can I stop when I reach that limit?',
      'Am I using only money that is not needed for essential expenses?',
      'Am I avoiding borrowed money or debt?',
      'Am I calm about losing the full amount I set aside?',
      'Am I avoiding any attempt to make back earlier losses?',
      'Do I understand that AI and historical data cannot know future results?',
      'Have I checked official provider information where it matters?'
    ],
    noteTitle: 'Responsible-use note',
    noteBody:
      '4D AI is intended for informational and research use only. If 4D activity causes financial pressure, emotional distress, secrecy, conflict, or loss of control, stop using related tools and seek support from trusted people or qualified local services.',
    relatedTitle: 'Related information',
    relatedLinks: [
      { href: '/about', label: 'About 4D AI' },
      { href: '/faq', label: 'FAQ' },
      { href: '/how-4d-ai-works', label: 'How 4D AI Works' },
      { href: '/providers/magnum', label: 'Magnum Guide' },
      { href: '/providers/sports-toto', label: 'Sports Toto Guide' }
    ]
  },
  zh: {
    metaTitle: '负责任参与指南 | 4D AI',
    metaDescription:
      '了解如何负责任地使用 4D AI，认识机率与不确定性、设定财务边界，并把 AI 与历史数据视为资讯参考。',
    breadcrumb: '负责任参与',
    eyebrow: '使用安全与资讯判断',
    title: '负责任参与指南',
    intro:
      '本指南说明负责任参与、机率与不确定性、财务边界，以及 AI 和历史数据的限制。4D AI 是独立资讯平台，分析内容不是收入来源，不是弥补损失的做法，也不承诺任何结果。',
    badges: ['仅供资讯', '不销售彩票', '不承诺结果'],
    sections: [
      {
        id: 'meaning',
        title: '什么是负责任参与',
        body:
          '负责任参与的起点，是接受结果存在不确定性。任何 4D 相关活动都应保持自愿、可负担，并与重要财务决定分开。',
        items: [
          '把号码分析视为资讯，而不是确定性。',
          '开始前先设定固定上限，并在达到上限时停止。',
          '不要用 4D 活动处理财务压力、债务、情绪压力或家庭责任。',
          '当活动不再轻松、自愿或可控时，应先暂停。'
        ]
      },
      {
        id: 'chance',
        title: '机率、不确定性与历史数据',
        body:
          '4D 结果包含机率与不确定性。历史开彩、频率表、冷热号码和可见模式只能描述过去，不能决定未来结果，也不能形成稳定回报。',
        items: [
          '过去开彩不会让未来号码变得确定。',
          '重复出现的模式也不是下一期结果的承诺。',
          'AI 辅助分析无法知道未来结果。',
          '任何模型、图表、排名或指南都不应被视为官方预测。'
        ]
      },
      {
        id: 'financial-boundaries',
        title: '财务边界',
        body:
          '只应使用即使损失也不会影响日常生活的金额。如果金额会影响房租、食物、交通、学费、医疗、账单、储蓄或还债，就不应投入 4D 相关活动。',
        items: [
          '不要借钱参与 4D 活动。',
          '不要因为之前的结果而增加金额。',
          '不要把工具、指南或 AI 输出当成投资建议。',
          '先保留必要开销和储蓄，再考虑任何自愿娱乐支出。'
        ]
      },
      {
        id: 'losses',
        title: '不要追回损失',
        body:
          '试图弥补损失，可能让原本自愿的活动变成有害循环。之前的损失不会提高下一次结果的确定性，增加金额也不会减少不确定性。',
        items: [
          '达到上限就停止，即使结果不理想也一样。',
          '不要为了补回早前损失而临时改变计划。',
          '不要把 AI 分析当成弥补损失的工具。',
          '如果感到压力、焦虑、愤怒、隐瞒或失控，应先休息。'
        ]
      },
      {
        id: 'ai-limits',
        title: 'AI 与推荐的限制',
        body:
          '4D AI 可以整理历史结果、Provider 资讯、频率视图和一般研究内容。推荐可能因输入、开奖历史、数据更新或排序条件改变而改变，仍然只是资讯，不能消除不确定性。',
        items: [
          'AI 输出不是官方结果、官方预测或 Provider 指示。',
          'AI 不能看见未来开彩，也不承诺准确。',
          '不同筛选条件可能产生不同建议。',
          '用户仍需自行决定是否以及如何使用相关资讯。'
        ]
      },
      {
        id: 'pause',
        title: '需要暂停并重新评估的信号',
        body:
          '如果 4D 活动开始影响情绪、财务、时间、工作、学习、人际关系或睡眠，可以先暂停，并和信任的人讨论。',
        items: [
          '你花费超过计划，或向他人隐瞒金额。',
          '结果不理想后仍感到必须继续。',
          '你动用了必要开销或借来的钱。',
          '即使原本计划停止，也觉得很难停止。',
          '你相信某个工具或模式一定会带来结果。'
        ]
      },
      {
        id: 'official-info',
        title: '官方资讯优先',
        body:
          '开彩结果、规则、派彩结构、Jackpot 机制和领奖资讯，应以官方 Provider 公布为准。如果 4D AI 内容与官方资讯不同，官方来源优先。',
        items: [
          '4D AI 不经营官方开彩。',
          '4D AI 不处理领奖。',
          '4D AI 不代表任何 Provider，也不代替 Provider 审核或行动。',
          'Provider 指南是独立资讯参考。'
        ]
      }
    ],
    roleTitle: '4D AI 做什么，不做什么',
    roleIntro:
      '本平台用于资讯整理、研究辅助和一般说明，不应被视为投注服务、金融服务或确定性工具。',
    doesTitle: '4D AI 会提供',
    doesItems: [
      '整理历史 4D 结果和 Provider 资讯。',
      '提供图表、摘要、指南和一般说明。',
      '协助用户更容易比较过去数据。',
      '提醒用户以官方 Provider 来源为准。'
    ],
    doesNotTitle: '4D AI 不会提供',
    doesNotItems: [
      '销售彩票、接受投注或经营开彩。',
      '承诺奖项、收入、准确性或未来结果。',
      '提供弥补损失的途径。',
      '作为官方 Provider 渠道或领奖服务。'
    ],
    checklistTitle: '快速自我检查',
    checklistIntro:
      '如果以下多个问题让你感到不舒服，可能适合先暂停，再决定是否继续使用任何 4D 相关资讯。',
    checklistItems: [
      '我是否在开始前设定了固定上限？',
      '达到上限时，我是否能够停止？',
      '我使用的金额是否完全不影响必要开销？',
      '我是否没有使用借来的钱或债务？',
      '如果设定金额全部损失，我是否仍能平静接受？',
      '我是否没有试图补回早前损失？',
      '我是否理解 AI 和历史数据无法知道未来结果？',
      '在重要事项上，我是否查看了官方 Provider 资讯？'
    ],
    noteTitle: '负责任使用提醒',
    noteBody:
      '4D AI 仅用于资讯和研究参考。如果 4D 活动造成财务压力、情绪困扰、隐瞒、冲突或失控，请停止使用相关工具，并向信任的人或合资格的本地服务寻求支持。',
    relatedTitle: '相关资讯',
    relatedLinks: [
      { href: '/about', label: '关于 4D AI' },
      { href: '/faq', label: '常见问题' },
      { href: '/how-4d-ai-works', label: '4D AI 如何运作' },
      { href: '/providers/magnum', label: 'Magnum 指南' },
      { href: '/providers/sports-toto', label: 'Sports Toto 指南' }
    ]
  },
  ms: {
    metaTitle: 'Panduan Permainan Bertanggungjawab | 4D AI',
    metaDescription:
      'Ketahui cara menggunakan 4D AI secara bertanggungjawab, fahami peluang dan ketidakpastian, tetapkan had kewangan, dan anggap AI serta data sejarah sebagai maklumat sahaja.',
    breadcrumb: 'Permainan Bertanggungjawab',
    eyebrow: 'Keselamatan pengguna dan penggunaan bermaklumat',
    title: 'Panduan Permainan Bertanggungjawab',
    intro:
      'Panduan ini menerangkan penyertaan bertanggungjawab, peluang dan ketidakpastian, had kewangan, serta batas AI dan data sejarah. 4D AI ialah platform maklumat bebas. Analisis bukan sumber pendapatan, bukan cara menampung kerugian, dan tidak menjanjikan hasil.',
    badges: ['Maklumat sahaja', 'Tidak menjual tiket', 'Tiada janji hasil'],
    sections: [
      {
        id: 'meaning',
        title: 'Maksud penyertaan bertanggungjawab',
        body:
          'Penyertaan bertanggungjawab bermula dengan menerima ketidakpastian. Aktiviti berkaitan 4D perlu kekal pilihan, mampu ditanggung, dan berasingan daripada keputusan kewangan penting.',
        items: [
          'Anggap analisis nombor sebagai maklumat, bukan kepastian.',
          'Tetapkan had tetap sebelum bermula dan berhenti apabila sampai had itu.',
          'Jangan gunakan aktiviti 4D untuk menyelesaikan tekanan kewangan, hutang, tekanan emosi, atau tanggungjawab keluarga.',
          'Berhenti seketika apabila aktiviti itu tidak lagi terasa tenang, pilihan, atau terkawal.'
        ]
      },
      {
        id: 'chance',
        title: 'Peluang, ketidakpastian, dan data sejarah',
        body:
          'Keputusan 4D melibatkan peluang dan ketidakpastian. Keputusan lama, jadual frekuensi, nombor panas atau sejuk, dan corak yang kelihatan hanya menerangkan masa lalu. Ia tidak menentukan keputusan masa depan atau menghasilkan pulangan tetap.',
        items: [
          'Cabutan lalu tidak menjadikan nombor masa depan pasti.',
          'Corak berulang masih bukan janji untuk cabutan seterusnya.',
          'Analisis bantuan AI tidak boleh mengetahui keputusan masa depan.',
          'Tiada model, carta, susunan, atau panduan patut dianggap sebagai ramalan rasmi.'
        ]
      },
      {
        id: 'financial-boundaries',
        title: 'Had kewangan',
        body:
          'Gunakan hanya wang yang mampu hilang tanpa menjejaskan kehidupan harian. Jika jumlah itu menjejaskan sewa, makanan, pengangkutan, yuran, perubatan, bil, simpanan, atau bayaran hutang, jangan gunakannya untuk aktiviti berkaitan 4D.',
        items: [
          'Jangan meminjam wang untuk aktiviti 4D.',
          'Jangan tambah perbelanjaan kerana keputusan sebelumnya.',
          'Jangan anggap alat, panduan, atau output AI sebagai nasihat pelaburan.',
          'Asingkan perbelanjaan penting dan simpanan sebelum sebarang perbelanjaan hiburan pilihan.'
        ]
      },
      {
        id: 'losses',
        title: 'Jangan mengejar kerugian',
        body:
          'Cuba menampung kerugian boleh menukar aktiviti pilihan menjadi kitaran berbahaya. Kerugian lalu tidak meningkatkan kepastian keputusan seterusnya, dan berbelanja lebih tidak mengurangkan ketidakpastian.',
        items: [
          'Berhenti apabila mencapai had, walaupun selepas keputusan yang tidak memihak.',
          'Elakkan mengubah rancangan untuk mendapatkan semula kerugian terdahulu.',
          'Jangan gunakan analisis AI sebagai alat pemulihan kerugian.',
          'Berehat jika anda berasa tertekan, marah, berahsia, atau hilang kawalan.'
        ]
      },
      {
        id: 'ai-limits',
        title: 'Had AI dan cadangan',
        body:
          '4D AI boleh menyusun keputusan sejarah, maklumat provider, paparan frekuensi, dan penyelidikan umum. Cadangan boleh berubah apabila input, sejarah cabutan, kemas kini data, atau syarat susunan berubah. Ia kekal sebagai maklumat dan tidak boleh menghapuskan ketidakpastian.',
        items: [
          'Output AI bukan keputusan rasmi, ramalan rasmi, atau arahan provider.',
          'AI tidak boleh melihat cabutan masa depan atau menjanjikan ketepatan.',
          'Penapis berbeza boleh menghasilkan cadangan berbeza.',
          'Pengguna tetap bertanggungjawab terhadap cara maklumat digunakan.'
        ]
      },
      {
        id: 'pause',
        title: 'Tanda untuk berhenti seketika dan menilai semula',
        body:
          'Pertimbangkan untuk berhenti seketika dan berbincang dengan orang yang dipercayai jika aktiviti 4D mula menjejaskan emosi, kewangan, masa, kerja, pelajaran, hubungan, atau tidur.',
        items: [
          'Anda berbelanja melebihi rancangan atau menyembunyikan jumlah daripada orang lain.',
          'Anda berasa terpaksa meneruskan selepas kerugian.',
          'Anda menggunakan wang keperluan atau wang pinjaman.',
          'Anda sukar berhenti walaupun sudah merancang untuk berhenti.',
          'Anda percaya sesuatu alat atau corak mesti menghasilkan keputusan.'
        ]
      },
      {
        id: 'official-info',
        title: 'Maklumat rasmi diutamakan',
        body:
          'Penerbitan rasmi provider hendaklah menjadi rujukan utama untuk keputusan, peraturan, struktur payout, mekanik jackpot, dan tuntutan hadiah. Jika kandungan 4D AI berbeza daripada maklumat rasmi, sumber rasmi perlu diutamakan.',
        items: [
          '4D AI tidak mengendalikan cabutan rasmi.',
          '4D AI tidak memproses tuntutan hadiah.',
          '4D AI tidak mewakili, menyemak untuk, atau bertindak bagi pihak mana-mana provider.',
          'Panduan provider ialah rujukan maklumat bebas.'
        ]
      }
    ],
    roleTitle: 'Apa yang 4D AI lakukan dan tidak lakukan',
    roleIntro:
      'Platform ini dibina untuk maklumat, penyusunan, dan sokongan penyelidikan. Ia tidak patut dianggap sebagai perkhidmatan pertaruhan, perkhidmatan kewangan, atau enjin kepastian.',
    doesTitle: '4D AI melakukan',
    doesItems: [
      'Menyusun keputusan 4D sejarah dan maklumat provider.',
      'Menyediakan carta, ringkasan, panduan, dan penerangan umum.',
      'Membantu pengguna membandingkan data lalu dengan lebih mudah.',
      'Mengingatkan pengguna untuk menyemak sumber rasmi provider.'
    ],
    doesNotTitle: '4D AI tidak melakukan',
    doesNotItems: [
      'Menjual tiket, menerima pertaruhan, atau mengendalikan cabutan.',
      'Menjanjikan hadiah, pendapatan, ketepatan, atau keputusan masa depan.',
      'Menyediakan cara untuk menampung kerugian.',
      'Bertindak sebagai saluran provider rasmi atau perkhidmatan tuntutan hadiah.'
    ],
    checklistTitle: 'Semakan kendiri ringkas',
    checklistIntro:
      'Jika beberapa soalan ini terasa tidak selesa, mungkin sesuai untuk berhenti seketika dan menilai semula sebelum menggunakan sebarang maklumat berkaitan 4D.',
    checklistItems: [
      'Adakah saya sudah menetapkan had tetap sebelum bermula?',
      'Bolehkah saya berhenti apabila mencapai had itu?',
      'Adakah saya hanya menggunakan wang yang tidak diperlukan untuk perbelanjaan penting?',
      'Adakah saya mengelakkan wang pinjaman atau hutang?',
      'Adakah saya tenang jika seluruh jumlah yang diketepikan hilang?',
      'Adakah saya mengelakkan cubaan mendapatkan semula kerugian terdahulu?',
      'Adakah saya faham bahawa AI dan data sejarah tidak boleh mengetahui keputusan masa depan?',
      'Adakah saya menyemak maklumat rasmi provider apabila perlu?'
    ],
    noteTitle: 'Nota penggunaan bertanggungjawab',
    noteBody:
      '4D AI bertujuan untuk maklumat dan penyelidikan sahaja. Jika aktiviti 4D menyebabkan tekanan kewangan, tekanan emosi, kerahsiaan, konflik, atau hilang kawalan, hentikan penggunaan alat berkaitan dan dapatkan sokongan daripada orang dipercayai atau perkhidmatan tempatan yang berkelayakan.',
    relatedTitle: 'Maklumat berkaitan',
    relatedLinks: [
      { href: '/about', label: 'Tentang 4D AI' },
      { href: '/faq', label: 'FAQ' },
      { href: '/how-4d-ai-works', label: 'Bagaimana 4D AI Berfungsi' },
      { href: '/providers/magnum', label: 'Panduan Magnum' },
      { href: '/providers/sports-toto', label: 'Panduan Sports Toto' }
    ]
  }
};

type PageProps = {
  params: Promise<{
    locale: Locale;
  }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: PageProps) {
  const { locale } = await params;
  const copy = responsibleGamingCopy[locale] ?? responsibleGamingCopy.en;

  return buildMetadata({
    locale,
    path: '/responsible-gaming',
    title: copy.metaTitle,
    description: copy.metaDescription
  });
}

export default async function ResponsibleGamingPage({ params }: PageProps) {
  const { locale } = await params;
  const copy = responsibleGamingCopy[locale] ?? responsibleGamingCopy.en;

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
            <h2 className="text-xl font-bold text-slate-950">{copy.roleTitle}</h2>
            <p className="mt-3 leading-7 text-slate-700">{copy.roleIntro}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-md border border-emerald-100 bg-emerald-50 p-4">
                <h3 className="font-semibold text-emerald-950">{copy.doesTitle}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950">
                  {copy.doesItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md border border-amber-100 bg-amber-50 p-4">
                <h3 className="font-semibold text-amber-950">{copy.doesNotTitle}</h3>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-amber-950">
                  {copy.doesNotItems.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">{copy.checklistTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-700">{copy.checklistIntro}</p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-700">
              {copy.checklistItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1.5 h-2 w-2 flex-none rounded-full border border-blue-500" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-md border border-blue-100 bg-blue-50 p-5">
            <h2 className="text-lg font-bold text-blue-950">{copy.noteTitle}</h2>
            <p className="mt-2 text-sm leading-6 text-blue-950">{copy.noteBody}</p>
          </section>

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
