import type {Locale} from '@/i18n/routing';
import {regions, type ProviderConfig} from '@/lib/providers';

export type ProviderPayoutSlug = 'magnum' | 'da-ma-cai' | 'sports-toto' | 'singapore-pools' | 'stc' | 'sabah-88' | 'sarawak';

export type LocalizedText = Record<Locale, string>;
export type PayoutCell = string | LocalizedText;

export type PayoutTable = {
  title: LocalizedText;
  note?: LocalizedText;
  headers: PayoutCell[];
  rows: PayoutCell[][];
};

export type PayoutGame = {
  title: LocalizedText;
  stake: LocalizedText;
  overview: LocalizedText;
  bullets?: LocalizedText[];
  tables: PayoutTable[];
};

export type ProviderGuideSummaryItem = {
  label: LocalizedText;
  value: LocalizedText;
};

export type ProviderGuideGame = {
  title: LocalizedText;
  description: LocalizedText;
};

export type ProviderGuideFaq = {
  question: LocalizedText;
  answer: LocalizedText;
};

export type ProviderGuideContent = {
  heroTitle: LocalizedText;
  heroIntro: LocalizedText;
  tags: LocalizedText[];
  breadcrumb: {
    home: LocalizedText;
    more: LocalizedText;
    providerGuides: LocalizedText;
  };
  aboutTitle: LocalizedText;
  aboutParagraphs: LocalizedText[];
  summaryTitle: LocalizedText;
  summary: ProviderGuideSummaryItem[];
  availableGamesTitle: LocalizedText;
  availableGames: ProviderGuideGame[];
  prizeStructureTitle: LocalizedText;
  informationNotesTitle: LocalizedText;
  informationNotes: LocalizedText[];
  faqTitle: LocalizedText;
  faqs: ProviderGuideFaq[];
  verificationTitle: LocalizedText;
  verificationText: LocalizedText;
  disclaimerTitle: LocalizedText;
  disclaimerText: LocalizedText;
  relatedGuidesTitle: LocalizedText;
  relatedSlugs: ProviderPayoutSlug[];
};

export type ProviderPayoutPage = {
  slug: ProviderPayoutSlug;
  providerCode: string;
  title: LocalizedText;
  menuLabel: LocalizedText;
  metaTitle: LocalizedText;
  metaDescription: LocalizedText;
  intro: LocalizedText;
  dataNote: LocalizedText;
  games: PayoutGame[];
  footerNote?: LocalizedText;
  guide?: ProviderGuideContent;
};

const text = (en: string, zh: string, ms: string): LocalizedText => ({en, zh, ms});
const na = text('N/A', '不适用', 'Tidak berkenaan');
const prize = text('Prize', '奖项', 'Hadiah');
const condition = text('Match condition', '中奖条件', 'Syarat padanan');
const payout = text('Payout', '派彩', 'Bayaran');
const maxPayout = text('Maximum payout', '最高派彩', 'Bayaran maksimum');
const big = text('Big / 大', 'Big / 大', 'Big / 大');
const small = text('Small / 小', 'Small / 小', 'Small / 小');
const first = text('1st Prize', '头奖', 'Hadiah Pertama');
const second = text('2nd Prize', '二奖', 'Hadiah Kedua');
const third = text('3rd Prize', '三奖', 'Hadiah Ketiga');
const fourth = text('4th Prize', '四奖', 'Hadiah Keempat');
const fifth = text('5th Prize', '五奖', 'Hadiah Kelima');
const sixth = text('6th Prize', '六奖', 'Hadiah Keenam');
const seventh = text('7th Prize', '七奖', 'Hadiah Ketujuh');
const special = text('Special Prize', '特别奖', 'Hadiah Khas');
const consolation = text('Consolation Prize', '安慰奖', 'Hadiah Saguhati');

const common4dRows: PayoutCell[][] = [
  [first, 'RM 2,500', 'RM 3,500'],
  [second, 'RM 1,000', 'RM 2,000'],
  [third, 'RM 500', 'RM 1,000'],
  [special, 'RM 180', na],
  [consolation, 'RM 60', na]
];

const common4dPermutationBigRows: PayoutCell[][] = [
  [first, 'RM 105', 'RM 209', 'RM 417', 'RM 625'],
  [second, 'RM 42', 'RM 84', 'RM 167', 'RM 250'],
  [third, 'RM 21', 'RM 42', 'RM 84', 'RM 125'],
  [special, 'RM 8', 'RM 15', 'RM 30', 'RM 45'],
  [consolation, 'RM 3', 'RM 5', 'RM 10', 'RM 15']
];

const common4dPermutationSmallRows: PayoutCell[][] = [
  [first, 'RM 146', 'RM 292', 'RM 584', 'RM 875'],
  [second, 'RM 84', 'RM 167', 'RM 334', 'RM 500'],
  [third, 'RM 42', 'RM 84', 'RM 167', 'RM 250']
];

const permutationHeaders: PayoutCell[] = [prize, text('24 permutations', '24 翻', '24 susunan'), text('12 permutations', '12 翻', '12 susunan'), text('6 permutations', '6 翻', '6 susunan'), text('4 permutations', '4 翻', '4 susunan')];

const standard4dTable = (currency = 'RM'): PayoutTable => ({
  title: text('4D fixed payout', '4D 固定派彩', 'Bayaran tetap 4D'),
  headers: [prize, big, small],
  rows: currency === 'SGD'
    ? [
        [first, 'SGD 2,000', 'SGD 3,000'],
        [second, 'SGD 1,000', 'SGD 2,000'],
        [third, 'SGD 490', 'SGD 800'],
        [special, 'SGD 250', na],
        [consolation, 'SGD 60', na]
      ]
    : common4dRows
});

const permutationTables = (bigTitle = 'Big', smallTitle = 'Small'): PayoutTable[] => [
  {
    title: text(`${bigTitle} permutation payout`, `${bigTitle} 全保派彩`, `Bayaran susunan ${bigTitle}`),
    headers: permutationHeaders,
    rows: common4dPermutationBigRows
  },
  {
    title: text(`${smallTitle} permutation payout`, `${smallTitle} 全保派彩`, `Bayaran susunan ${smallTitle}`),
    headers: permutationHeaders,
    rows: common4dPermutationSmallRows
  }
];

const jackpot4dRows: PayoutCell[][] = [
  ['Jackpot 1', text('Two selected numbers match any two of the 1st, 2nd or 3rd prizes', '所选两组号码分别匹配头奖、二奖或三奖中的任意两个', 'Dua nombor pilihan sepadan dengan mana-mana dua hadiah pertama, kedua atau ketiga'), text('Minimum RM 2,000,000, no fixed cap', '最低 RM 2,000,000，无固定上限', 'Minimum RM 2,000,000, tiada had tetap')],
  ['Jackpot 2', text('One number matches a top-three prize and the other matches a Special Prize', '一组匹配前三奖，另一组匹配特别奖', 'Satu nombor sepadan hadiah tiga teratas dan satu lagi sepadan Hadiah Khas'), text('Minimum RM 100,000, no fixed cap', '最低 RM 100,000，无固定上限', 'Minimum RM 100,000, tiada had tetap')],
  ['Group 3', text('At least one selected number matches the 1st, 2nd or 3rd prize', '至少一组匹配前三奖', 'Sekurang-kurangnya satu nombor sepadan hadiah tiga teratas'), text('RM 168, listed total payout cap RM 10,000,000', 'RM 168，资料所列总派彩上限 RM 10,000,000', 'RM 168, had jumlah bayaran yang disenaraikan RM 10,000,000')],
  ['Group 4', text('At least one selected number matches a Special Prize', '至少一组匹配特别奖', 'Sekurang-kurangnya satu nombor sepadan Hadiah Khas'), text('RM 68, listed total payout cap RM 10,000,000', 'RM 68，资料所列总派彩上限 RM 10,000,000', 'RM 68, had jumlah bayaran yang disenaraikan RM 10,000,000')],
  ['Group 5', text('At least one selected number matches a Consolation Prize', '至少一组匹配安慰奖', 'Sekurang-kurangnya satu nombor sepadan Hadiah Saguhati'), text('RM 28, listed total payout cap RM 10,000,000', 'RM 28，资料所列总派彩上限 RM 10,000,000', 'RM 28, had jumlah bayaran yang disenaraikan RM 10,000,000')]
];

function getProvider(code: string): ProviderConfig {
  return regions.flatMap((region) => region.providers).find((provider) => provider.code === code) ?? {code, name: code, shortName: code};
}

function fourDGame(title: LocalizedText, stake: LocalizedText, overview?: LocalizedText): PayoutGame {
  return {
    title,
    stake,
    overview: overview ?? text('A selected four-digit number must match the relevant draw prize number exactly for the selected bet type.', '所选四位号码需要与对应开奖奖项号码完全一致，并按投注类别计算派彩。', 'Nombor empat digit pilihan perlu sepadan tepat dengan nombor hadiah cabutan mengikut jenis taruhan.'),
    tables: [standard4dTable()]
  };
}

function permutationGame(title: LocalizedText, stake: LocalizedText, labels = {big: 'Big', small: 'Small'}): PayoutGame {
  return {
    title,
    stake,
    overview: text('Permutation betting covers different arrangements of the same digits. The actual category depends on repeated digits in the selected number.', '全保投注覆盖同一组数字可组成的不同排列。实际排列数量取决于号码中是否有重复数字。', 'Taruhan susunan meliputi aturan berbeza bagi digit yang sama. Kategori sebenar bergantung pada digit berulang.'),
    tables: permutationTables(labels.big, labels.small)
  };
}

export const providerPayoutPages: ProviderPayoutPage[] = [
  {
    slug: 'magnum',
    providerCode: 'magnum',
    title: text('Magnum Payout Structure', '万能派彩结构', 'Struktur Bayaran Hadiah Magnum'),
    menuLabel: text('Magnum', '万能', 'Magnum'),
    metaTitle: text('Magnum 4D Guide | Prize Structure and Game Information | 4D AI', '万能 4D 游戏指南｜派彩结构与游戏资料｜4D AI', 'Panduan Permainan Magnum 4D | Struktur Hadiah dan Maklumat Permainan | 4D AI'),
    metaDescription: text('Learn about Magnum 4D game formats, prize structures, jackpot options and payout information. This independent guide is provided by 4D AI for general reference.', '了解万能 4D 的主要游戏形式、派彩结构、Jackpot 玩法及相关资料。本独立指南由 4D AI 整理，仅供一般资讯参考。', 'Ketahui format permainan Magnum 4D, struktur bayaran hadiah, pilihan jackpot dan maklumat berkaitan. Panduan bebas ini disediakan oleh 4D AI untuk rujukan umum.'),
    intro: text('Learn about Magnum 4D game formats, prize structures and jackpot options in one independent information guide.', '本指南整理万能 4D 的主要游戏形式、派彩结构及 Jackpot 玩法，方便用户查阅基本资料。', 'Panduan ini menerangkan format permainan utama Magnum 4D, struktur bayaran hadiah dan pilihan jackpot.'),
    dataNote: text('Figures are informational and may change. Check Magnum official materials for current rules before relying on any payout table.', '资料用于一般参考，派彩与规则可能调整；请以 Magnum 最新官方资料为准。', 'Angka ini untuk maklumat umum dan boleh berubah. Rujuk bahan rasmi Magnum untuk peraturan terkini.'),
    guide: {
      heroTitle: text('Magnum 4D Guide', '万能 4D 游戏指南', 'Panduan Permainan Magnum 4D'),
      heroIntro: text('Learn about Magnum\'s 4D game formats, prize structures and jackpot options. This independent guide is provided by 4D AI for general information and does not represent an official Magnum publication.', '本指南整理万能 4D 的主要游戏形式、派彩结构及 Jackpot 玩法，方便用户查阅基本资料。本页面由 4D AI 独立整理，仅供一般资讯参考，并非万能官方发布内容。', 'Panduan ini menerangkan format permainan utama Magnum 4D, struktur bayaran hadiah dan pilihan jackpot. Kandungan ini disusun secara bebas oleh 4D AI untuk maklumat umum dan bukan penerbitan rasmi Magnum.'),
      tags: [text('Malaysia', '马来西亚', 'Malaysia'), text('Number Game Guide', '数字游戏指南', 'Panduan Permainan Nombor'), text('Reference Only', '仅供参考', 'Untuk Rujukan Sahaja')],
      breadcrumb: {
        home: text('Home', '首页', 'Laman Utama'),
        more: text('More', '更多', 'Lagi'),
        providerGuides: text('Provider Guides', 'Provider 指南', 'Panduan Penyedia')
      },
      aboutTitle: text('About Magnum', '关于万能', 'Mengenai Magnum'),
      aboutParagraphs: [
        text('Magnum is a Malaysian number-game provider offering several game formats, including conventional 4D, permutation-based entries and jackpot variations. Each game has its own entry method, prize categories and payout arrangement.', '万能是马来西亚的数字游戏 Provider，提供传统 4D、全保排列、Jackpot 及其他相关游戏形式。不同游戏拥有各自的投注方式、奖项类别和派彩安排。', 'Magnum ialah penyedia permainan nombor di Malaysia yang menawarkan beberapa format permainan, termasuk 4D biasa, pertaruhan berasaskan susunan nombor dan variasi jackpot. Setiap permainan mempunyai kaedah penyertaan, kategori hadiah dan aturan bayaran yang berbeza.'),
        text('This page brings together the main game formats and payout information in one place so users can understand the differences more easily. 4D AI does not operate Magnum games, sell tickets or process claims. The information is provided for general reference only.', '本页面将主要游戏形式和派彩资料整理在同一处，帮助用户更容易了解各项游戏之间的差异。4D AI 不经营万能游戏、不销售票券，也不处理兑奖；页面资料仅供一般资讯参考。', 'Halaman ini menghimpunkan format permainan utama dan maklumat bayaran hadiah supaya pengguna dapat memahami perbezaannya dengan lebih mudah. 4D AI tidak mengendalikan permainan Magnum, tidak menjual tiket dan tidak memproses tuntutan hadiah. Maklumat ini disediakan untuk rujukan umum sahaja.'),
        text('Game rules, payout amounts and jackpot arrangements may be revised over time. Users should always check the provider\'s latest official publication before relying on any figure shown here.', '游戏规则、派彩金额和奖池安排可能随时间调整。用户在使用任何资料前，应查阅 Provider 最新的官方公布。', 'Peraturan permainan, jumlah bayaran hadiah dan aturan jackpot mungkin berubah dari semasa ke semasa. Pengguna hendaklah menyemak penerbitan rasmi terkini daripada penyedia sebelum bergantung pada mana-mana angka di halaman ini.')
      ],
      summaryTitle: text('Provider Summary', 'Provider 摘要', 'Ringkasan Penyedia'),
      summary: [
        {label: text('Provider', 'Provider', 'Penyedia'), value: text('Magnum', '万能', 'Magnum')},
        {label: text('Country', '地区', 'Negara'), value: text('Malaysia', '马来西亚', 'Malaysia')},
        {label: text('Currency', '货币', 'Mata Wang'), value: text('MYR (RM)', 'MYR (RM)', 'MYR (RM)')},
        {label: text('Main Games', '主要游戏', 'Permainan Utama'), value: text('4D, 4D Permutation, 4D Jackpot, Gold Jackpot, Powerball', '4D、4D 全保、4D Jackpot、Gold Jackpot、Powerball', '4D, 4D Permutation, 4D Jackpot, Gold Jackpot, Powerball')},
        {label: text('Category', '类别', 'Kategori'), value: text('Number Games', '数字游戏', 'Permainan Nombor')},
        {label: text('Guide Type', '指南类型', 'Jenis Panduan'), value: text('Independent Information Guide', '独立资讯指南', 'Panduan Maklumat Bebas')}
      ],
      availableGamesTitle: text('Available Games', '主要游戏', 'Permainan Tersedia'),
      availableGames: [
        {title: text('4D', '4D', '4D'), description: text('A conventional four-digit game in which the selected number is compared with the published prize numbers.', '传统四位数字游戏，所选号码会与公布的各奖项号码进行比较。', 'Permainan empat digit biasa yang membandingkan nombor pilihan dengan nombor hadiah yang diterbitkan.')},
        {title: text('4D Permutation', '4D 全保', '4D Permutation'), description: text('A format that covers valid arrangements of the selected digits. The number of arrangements depends on repeated digits.', '覆盖所选数字可组成的有效排列，实际排列数量取决于号码中是否存在重复数字。', 'Format yang meliputi susunan sah bagi digit yang dipilih. Bilangan susunan bergantung pada kewujudan digit berulang.')},
        {title: text('4D Jackpot', '4D Jackpot', '4D Jackpot'), description: text('A paired-number jackpot format that uses two four-digit selections and awards prizes according to the prize categories matched.', '使用两组四位号码组成配对，并根据两组号码所匹配的奖项类别计算派彩。', 'Format jackpot berpasangan yang menggunakan dua pilihan empat digit dan membayar hadiah berdasarkan kategori hadiah yang dipadankan.')},
        {title: text('Jackpot M-System', 'Jackpot M-System', 'Jackpot M-System'), description: text('A system entry that combines multiple selected numbers into several pairs, with jackpot shares calculated according to the selected system size.', '将多组所选号码组成多个配对，Jackpot 份额会按照所选系统规模计算。', 'Penyertaan sistem yang menggabungkan beberapa nombor pilihan kepada beberapa pasangan, dengan bahagian jackpot dikira mengikut saiz sistem.')},
        {title: text('Gold Jackpot', 'Gold Jackpot', 'Gold Jackpot'), description: text('A jackpot format using a six-digit selection together with an additional Gold Number.', '结合一组六位号码和一个额外 Gold Number 的 Jackpot 游戏形式。', 'Format jackpot yang menggunakan satu pilihan enam digit bersama satu Gold Number tambahan.')},
        {title: text('Jackpot Powerball', 'Jackpot Powerball', 'Jackpot Powerball'), description: text('A format combining one four-digit selection with two Powerball numbers.', '结合一组四位号码和两组 Powerball 号码的游戏形式。', 'Format yang menggabungkan satu pilihan empat digit dengan dua nombor Powerball.')}
      ],
      prizeStructureTitle: text('Prize Structure', '派彩结构', 'Struktur Hadiah'),
      informationNotesTitle: text('Information Notes', '资讯说明', 'Nota Maklumat'),
      informationNotes: [
        text('Payout figures on this page are shown for general reference. Provider rules, jackpot arrangements and prize categories may change over time.', '本页面显示的派彩数字仅供一般参考。Provider 规则、Jackpot 安排和奖项类别可能随时间调整。', 'Angka bayaran di halaman ini ditunjukkan untuk rujukan umum. Peraturan penyedia, aturan jackpot dan kategori hadiah mungkin berubah dari semasa ke semasa.'),
        text('Minimum jackpot amounts refer to starting or minimum pool arrangements under provider rules and do not mean every winner receives the full amount shown.', 'Jackpot 最低金额是指 Provider 规则下的起始或最低奖池安排，并不代表每一名得主必然获得页面显示的全部金额。', 'Jumlah jackpot minimum merujuk kepada aturan kumpulan hadiah permulaan atau minimum di bawah peraturan penyedia dan tidak bermaksud setiap pemenang menerima keseluruhan jumlah yang dipaparkan.')
      ],
      faqTitle: text('Frequently Asked Questions', '常见问题', 'Soalan Lazim'),
      faqs: [
        {question: text('What is the difference between Big and Small?', '大和小有什么区别？', 'Apakah perbezaan antara Big dan Small?'), answer: text('Big entries generally cover the first, second, third, special and consolation prize categories, while Small entries usually cover only the first three prize categories with different fixed payouts. The exact coverage should be checked against the latest official rules.', '大通常涵盖头奖、二奖、三奖、特别奖和安慰奖；小通常只涵盖前三奖，并采用不同的固定派彩。实际涵盖范围应以最新官方规则为准。', 'Penyertaan Big lazimnya meliputi hadiah pertama, kedua, ketiga, khas dan saguhati, manakala Small biasanya hanya meliputi tiga hadiah utama dengan bayaran tetap yang berbeza. Liputan sebenar hendaklah disemak berdasarkan peraturan rasmi terkini.')},
        {question: text('What is 4D Permutation?', '什么是 4D 全保？', 'Apakah 4D Permutation?'), answer: text('4D Permutation covers valid arrangements of the selected digits. The number of arrangements depends on whether one or more digits are repeated, which is why different permutation categories have different payout amounts.', '4D 全保涵盖所选数字可组成的有效排列。排列数量取决于号码中是否有重复数字，因此不同排列类别会有不同派彩。', '4D Permutation meliputi susunan sah bagi digit yang dipilih. Bilangan susunan bergantung pada sama ada terdapat digit berulang, sebab itu kategori susunan yang berbeza mempunyai jumlah bayaran yang berbeza.')},
        {question: text('How does 4D Jackpot work?', '4D Jackpot 如何计算中奖条件？', 'Bagaimanakah 4D Jackpot berfungsi?'), answer: text('4D Jackpot uses two four-digit selections. The prize category depends on how the two selected numbers match the published first, second, third, special or consolation results.', '4D Jackpot 使用两组四位号码。奖项类别取决于这两组号码与公布的头奖、二奖、三奖、特别奖或安慰奖之间的匹配组合。', '4D Jackpot menggunakan dua pilihan empat digit. Kategori hadiah bergantung pada cara kedua-dua nombor tersebut sepadan dengan keputusan hadiah pertama, kedua, ketiga, khas atau saguhati yang diterbitkan.')},
        {question: text('Are Magnum payout amounts always fixed?', '万能的派彩金额是否永远固定？', 'Adakah jumlah bayaran Magnum sentiasa tetap?'), answer: text('Some prizes use fixed payout amounts, while jackpot prizes depend on the applicable pool and provider rules. Payout structures may change, so users should verify the latest official information.', '部分奖项采用固定派彩，而 Jackpot 奖项会受到相关奖池和 Provider 规则影响。派彩结构可能调整，因此应查阅最新官方资料。', 'Sebahagian hadiah menggunakan jumlah bayaran tetap, manakala hadiah jackpot bergantung pada kumpulan hadiah dan peraturan penyedia. Struktur bayaran mungkin berubah, jadi pengguna perlu menyemak maklumat rasmi terkini.')},
        {question: text('Does 4D AI operate Magnum games?', '4D AI 是否经营万能游戏？', 'Adakah 4D AI mengendalikan permainan Magnum?'), answer: text('No. 4D AI is an independent information and historical-data platform. It does not sell tickets, accept entries, operate draws or process prize claims.', '不是。4D AI 是独立的资讯与历史数据平台，不销售票券、不接受投注、不经营开奖，也不处理兑奖。', 'Tidak. 4D AI ialah platform maklumat dan data sejarah yang bebas. Ia tidak menjual tiket, menerima penyertaan, mengendalikan cabutan atau memproses tuntutan hadiah.')}
      ],
      verificationTitle: text('Verification notice', '资料核对提示', 'Notis pengesahan'),
      verificationText: text('Please verify game rules, payout amounts and jackpot arrangements with Magnum\'s latest official publication before relying on the figures shown here.', '使用本页面数字前，请以 Magnum 最新官方公布的游戏规则、派彩金额及奖池安排为准。', 'Sila sahkan peraturan permainan, jumlah bayaran hadiah dan aturan jackpot melalui penerbitan rasmi terkini Magnum sebelum bergantung pada angka yang dipaparkan di sini.'),
      disclaimerTitle: text('Disclaimer', '免责声明', 'Penafian'),
      disclaimerText: text('This page is provided for general information only. 4D AI organises information and historical data, and does not operate any lottery or betting game. Historical data cannot determine future draw results. Rules and payout structures should always be checked against the provider\'s latest official materials. 4D AI does not guarantee that every figure remains current and does not guarantee any betting outcome.', '本页面仅供一般资讯参考。4D AI 只整理资讯和历史数据，不经营任何彩票或博彩游戏。历史数据不能决定未来开奖结果。规则和派彩结构应始终以 Provider 最新官方资料为准。4D AI 不保证资料持续保持最新，也不保证任何投注结果。', 'Halaman ini disediakan untuk maklumat umum sahaja. 4D AI menyusun maklumat dan data sejarah, serta tidak mengendalikan sebarang permainan loteri atau pertaruhan. Data sejarah tidak boleh menentukan keputusan cabutan akan datang. Peraturan dan struktur bayaran hendaklah sentiasa disemak dengan bahan rasmi terkini penyedia. 4D AI tidak menjamin setiap angka kekal terkini dan tidak menjamin apa-apa keputusan pertaruhan.'),
      relatedGuidesTitle: text('Related Provider Guides', '相关 Provider 指南', 'Panduan Penyedia Berkaitan'),
      relatedSlugs: ['da-ma-cai', 'sports-toto', 'singapore-pools', 'stc', 'sabah-88', 'sarawak']
    },
    games: [
      fourDGame(text('4D', '4D', '4D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')),
      permutationGame(text('4D Permutation', '4D 全保', '4D Susunan'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')),
      {
        title: text('4D Jackpot', '4D Jackpot', '4D Jackpot'),
        stake: text('Per RM2 normal bet', '每 RM2 普通投注', 'Setiap taruhan biasa RM2'),
        overview: text('A normal jackpot entry uses two four-digit numbers from 0000 to 9999. Jackpot amounts are minimum or shared-pool references, not guaranteed amounts for every winner.', '普通 Jackpot 投注选择两组 0000 至 9999 的四位号码。Jackpot 金额是最低或奖池参考，不代表每名得主保证领取。', 'Entri jackpot biasa menggunakan dua nombor empat digit 0000 hingga 9999. Jumlah jackpot ialah rujukan minimum atau kolam hadiah, bukan jaminan untuk setiap pemenang.'),
        bullets: [text('When Jackpot 1 exceeds RM 30,000,000, the provided information says part of the accumulated pool may move to Jackpot 2. Refer to the latest official terms for the exact arrangement.', '资料指出，当 Jackpot 1 超过 RM 30,000,000 时，部分累积安排可能转入 Jackpot 2；具体安排请查阅最新官方条款。', 'Jika Jackpot 1 melebihi RM 30,000,000, maklumat yang diberi menyatakan sebahagian kolam terkumpul mungkin dipindahkan ke Jackpot 2. Rujuk terma rasmi terkini.')],
        tables: [{title: text('Prize groups', '奖项组别', 'Kumpulan hadiah'), headers: [prize, condition, payout], rows: jackpot4dRows}]
      },
      {
        title: text('4D Jackpot M-System', '4D Jackpot M-System', '4D Jackpot M-System'),
        stake: text('M-10 starts from RM10; M-50 corresponds to RM50', 'M-10 最低 RM10；M-50 对应 RM50', 'M-10 bermula daripada RM10; M-50 bersamaan RM50'),
        overview: text('M-System forms multiple pairings from 10 to 50 selected numbers. Payouts for jackpot combinations are calculated by system ratio.', 'M-System 可选择 10 至 50 个号码，并形成多组配对；Jackpot 派彩按系统组合比例计算。', 'M-System membentuk beberapa pasangan daripada 10 hingga 50 nombor pilihan; bayaran jackpot dikira mengikut nisbah sistem.'),
        bullets: [text('Only M-10, M-20 and M-50 figures are listed here. Other systems between M-20 and M-50 follow the same formula in the provided material.', '本页只列出资料提供的 M-10、M-20 与 M-50；M-20 至 M-50 之间按相同公式递进。', 'Hanya M-10, M-20 dan M-50 disenaraikan. Sistem lain antara M-20 dan M-50 mengikut formula yang sama dalam bahan diberi.')],
        tables: [{
          title: text('System ratio table', '系统比例表', 'Jadual nisbah sistem'),
          headers: [text('System', '系统', 'Sistem'), text('Two numbers match top-three prizes', '两组均匹配前三奖', 'Dua nombor sepadan hadiah tiga teratas'), text('Top-three prize + Special Prize', '一组匹配前三奖 + 一组特别奖', 'Hadiah tiga teratas + Hadiah Khas'), text('One top-three prize', '一组匹配前三奖', 'Satu hadiah tiga teratas'), text('One Special Prize', '一个特别奖', 'Satu Hadiah Khas'), text('One Consolation Prize', '一个安慰奖', 'Satu Hadiah Saguhati')],
          rows: [
            ['M-10', 'Jackpot 1 1/9', 'Jackpot 2 1/9', 'RM 168', 'RM 68', 'RM 28'],
            ['M-20', 'Jackpot 1 1/19', 'Jackpot 2 1/19', 'RM 168', 'RM 68', 'RM 28'],
            ['M-50', 'Jackpot 1 1/49', 'Jackpot 2 1/49', 'RM 168', 'RM 68', 'RM 28']
          ]
        }]
      },
      {
        title: text('4D Gold Jackpot', '4D Gold Jackpot / 金积宝', '4D Gold Jackpot'),
        stake: text('Minimum RM2 or multiples', '最低投注 RM2 或其倍数', 'Minimum RM2 atau gandaan'),
        overview: text('Players select one six-digit number, understood as three two-digit groups from 00 to 99, plus one Gold Number from 00 to 19.', '选择一组 6 位号码，可理解为三个 00 至 99 的两位数组合，并选择一个 00 至 19 的 Gold Number。', 'Pilih satu nombor enam digit, difahami sebagai tiga kumpulan dua digit 00 hingga 99, serta satu Gold Number 00 hingga 19.'),
        tables: [{
          title: text('Gold Jackpot payouts', '金积宝派彩', 'Bayaran Gold Jackpot'),
          headers: [prize, condition, payout],
          rows: [
            [first, text('All six digits and the Gold Number match exactly', '6 位号码和 Gold Number 全部完全匹配', 'Enam digit dan Gold Number sepadan tepat'), text('Jackpot 1, minimum RM 2,000,000', 'Jackpot 1，最低 RM 2,000,000', 'Jackpot 1, minimum RM 2,000,000')],
            [second, text('First five or last five digits match, and the Gold Number matches', '6 位号码的前 5 位或后 5 位匹配，同时 Gold Number 匹配', 'Lima digit depan atau belakang sepadan, dan Gold Number sepadan'), text('Jackpot 2, minimum RM 100,000', 'Jackpot 2，最低 RM 100,000', 'Jackpot 2, minimum RM 100,000')],
            [third, text('All six digits match', '6 位号码完全匹配', 'Semua enam digit sepadan'), 'RM 100,000'],
            [fourth, text('First five or last five digits match', '前 5 位或后 5 位匹配', 'Lima digit depan atau belakang sepadan'), 'RM 3,388'],
            [fifth, text('First four or last four digits match', '前 4 位或后 4 位匹配', 'Empat digit depan atau belakang sepadan'), 'RM 338'],
            [sixth, text('First three or last three digits match', '前 3 位或后 3 位匹配', 'Tiga digit depan atau belakang sepadan'), 'RM 38'],
            [seventh, text('First two or last two digits match', '前 2 位或后 2 位匹配', 'Dua digit depan atau belakang sepadan'), 'RM 4']
          ]
        }]
      },
      {
        title: text('4D Jackpot Powerball', '4D Jackpot Powerball / 积宝强力球', '4D Jackpot Powerball'),
        stake: text('Minimum RM2 or multiples', '最低投注 RM2 或其倍数', 'Minimum RM2 atau gandaan'),
        overview: text('Players select one four-digit number from 0000 to 9999 and two Powerball numbers from 00 to 99.', '选择一组 0000 至 9999 的四位号码，并选择两组 00 至 99 的 Powerball 号码。', 'Pilih satu nombor empat digit 0000 hingga 9999 dan dua nombor Powerball 00 hingga 99.'),
        tables: [{
          title: text('Powerball payout table', '强力球派彩表', 'Jadual bayaran Powerball'),
          headers: [prize, condition, payout],
          rows: [
            ['Jackpot 1 First Prize', text('4D number matches 1st Prize and both Powerball numbers match', '4D 号码匹配头奖，并且两组 Powerball 全部匹配', 'Nombor 4D sepadan Hadiah Pertama dan kedua-dua Powerball sepadan'), text('100% of Jackpot 1, minimum RM 2,000,000', 'Jackpot 1 的 100%，最低 RM 2,000,000', '100% Jackpot 1, minimum RM 2,000,000')],
            ['Jackpot 1 Second Prize', text('4D number matches 2nd Prize and both Powerball numbers match', '4D 号码匹配二奖，并且两组 Powerball 全部匹配', 'Nombor 4D sepadan Hadiah Kedua dan kedua-dua Powerball sepadan'), 'Jackpot 1 50%'],
            ['Jackpot 1 Third Prize', text('4D number matches 3rd Prize and both Powerball numbers match', '4D 号码匹配三奖，并且两组 Powerball 全部匹配', 'Nombor 4D sepadan Hadiah Ketiga dan kedua-dua Powerball sepadan'), 'Jackpot 1 25%'],
            ['Jackpot 2', text('4D number matches a Special or Consolation Prize and both Powerball numbers match', '4D 号码匹配特别奖或安慰奖，并且两组 Powerball 全部匹配', 'Nombor 4D sepadan Hadiah Khas atau Saguhati dan kedua-dua Powerball sepadan'), text('Minimum RM 100,000', '最低 RM 100,000', 'Minimum RM 100,000')],
            [third, text('4D number matches 1st, 2nd or 3rd Prize', '4D 号码匹配头奖、二奖或三奖', 'Nombor 4D sepadan Hadiah Pertama, Kedua atau Ketiga'), 'RM 100'],
            [fourth, text('4D number matches a Special or Consolation Prize', '4D 号码匹配特别奖或安慰奖', 'Nombor 4D sepadan Hadiah Khas atau Saguhati'), 'RM 20'],
            [fifth, text('At least one selected Powerball matches a drawn Powerball', '所选 Powerball 至少匹配其中一个开奖 Powerball', 'Sekurang-kurangnya satu Powerball pilihan sepadan Powerball cabutan'), 'RM 7']
          ]
        }]
      }
    ]
  },
  {
    slug: 'da-ma-cai',
    providerCode: 'da_ma_cai',
    title: text('Da Ma Cai Payout Structure', '大马彩派彩结构', 'Struktur Bayaran Hadiah Da Ma Cai'),
    menuLabel: text('Da Ma Cai', '大马彩', 'Da Ma Cai'),
    metaTitle: text('Da Ma Cai Payout Structure - 4D AI', '大马彩派彩结构 - 4D AI', 'Struktur Bayaran Hadiah Da Ma Cai - 4D AI'),
    metaDescription: text('Reference payout information for Da Ma Cai 3D, 1+3D, Super 1+3D and jackpot games.', '查看大马彩 3D、1+3D、Super 1+3D 与 Jackpot 派彩资讯。', 'Maklumat rujukan bayaran untuk Da Ma Cai 3D, 1+3D, Super 1+3D dan jackpot.'),
    intro: text('Da Ma Cai includes 3D, 1+3D and jackpot-style games. This page separates each payout table so the game type is clear.', '大马彩包含 3D、1+3D 与 Jackpot 类玩法；本页按游戏拆分派彩资料。', 'Da Ma Cai merangkumi permainan 3D, 1+3D dan jackpot; halaman ini memisahkan jadual mengikut jenis permainan.'),
    dataNote: text('Use these tables as general reference only. Current rules and payout arrangements should be checked against Da Ma Cai official information.', '本页表格仅供一般参考；现行规则及派彩安排请查阅大马彩最新官方资料。', 'Gunakan jadual ini sebagai rujukan umum sahaja. Semak peraturan dan bayaran terkini melalui maklumat rasmi Da Ma Cai.'),
    games: [
      {
        title: text('3D', '3D', '3D'),
        stake: text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'),
        overview: text('Select one three-digit number from 000 to 999. The listed bet types are ABC and A.', '从 000 至 999 选择一组三位号码；资料列出的投注类型为 ABC 或 A。', 'Pilih satu nombor tiga digit 000 hingga 999. Jenis taruhan yang disenaraikan ialah ABC dan A.'),
        tables: [{title: text('3D payout', '3D 派彩', 'Bayaran 3D'), headers: [prize, 'ABC', 'A'], rows: [[first, 'RM 250', 'RM 660'], [second, 'RM 210', na], [third, 'RM 150', na]]}]
      },
      fourDGame(text('1+3D', '1+3D', '1+3D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'), text('ABC / Big covers top-three, Special and Consolation prizes. A / Small covers only the top-three prizes with higher fixed payouts.', 'ABC / Big 覆盖头奖、二奖、三奖、10 个特别奖和 10 个安慰奖；A / Small 只覆盖前三奖但固定派彩较高。', 'ABC / Big meliputi hadiah tiga teratas, Khas dan Saguhati. A / Small hanya meliputi hadiah tiga teratas dengan bayaran tetap lebih tinggi.')),
      permutationGame(text('1+3D Permutation', '1+3D 全保', 'Susunan 1+3D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'), {big: 'Big / ABC', small: 'Small / A'}),
      {
        title: text('Super 1+3D', 'Super 1+3D', 'Super 1+3D'),
        stake: text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'),
        overview: text('Select one four-digit number and one prize category: 1ST, 2ND, 3RD, STA, CON, TP3 or ALL. This game does not use A or ABC bet types.', '选择四位号码并同时选择 1ST、2ND、3RD、STA、CON、TP3 或 ALL 奖项类别；此游戏不使用 A 或 ABC 类型。', 'Pilih satu nombor empat digit dan kategori hadiah 1ST, 2ND, 3RD, STA, CON, TP3 atau ALL. Permainan ini tidak menggunakan jenis A atau ABC.'),
        tables: [{
          title: text('Super 1+3D payout', 'Super 1+3D 派彩', 'Bayaran Super 1+3D'),
          headers: [prize, condition, payout],
          rows: [
            ['1ST', text('Number and category match 1+3D 1st Prize', '所选号码和类别匹配 1+3D 头奖', 'Nombor dan kategori sepadan Hadiah Pertama 1+3D'), 'RM 6,500'],
            ['2ND', text('Number and category match 1+3D 2nd Prize', '所选号码和类别匹配 1+3D 二奖', 'Nombor dan kategori sepadan Hadiah Kedua 1+3D'), 'RM 6,500'],
            ['3RD', text('Number and category match 1+3D 3rd Prize', '所选号码和类别匹配 1+3D 三奖', 'Nombor dan kategori sepadan Hadiah Ketiga 1+3D'), 'RM 6,500'],
            ['STA', text('Number and category match any Special Prize', '所选号码和类别匹配任一特别奖', 'Nombor dan kategori sepadan mana-mana Hadiah Khas'), 'RM 650'],
            ['CON', text('Number and category match any Consolation Prize', '所选号码和类别匹配任一安慰奖', 'Nombor dan kategori sepadan mana-mana Hadiah Saguhati'), 'RM 650'],
            ['TP3', text('Number matches 1st, 2nd or 3rd Prize', '所选号码匹配头奖、二奖或三奖', 'Nombor sepadan Hadiah Pertama, Kedua atau Ketiga'), 'RM 2,168'],
            ['ALL', text('Number matches any top-three, Special or Consolation prize', '所选号码匹配任何主要、特别或安慰奖', 'Nombor sepadan mana-mana hadiah utama, Khas atau Saguhati'), text('Top-three RM 1,300; Special RM 130; Consolation RM 130', '头奖、二奖、三奖 RM 1,300；特别奖 RM 130；安慰奖 RM 130', 'Tiga teratas RM 1,300; Khas RM 130; Saguhati RM 130')]
          ]
        }]
      },
      {
        title: text('Super 1+3D Permutation', 'Super 1+3D 全保', 'Susunan Super 1+3D'),
        stake: text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'),
        overview: text('Permutation payouts vary by prize category and number of possible arrangements.', '全保派彩依奖项类别和排列数量而不同。', 'Bayaran susunan berbeza mengikut kategori hadiah dan bilangan susunan.'),
        tables: [{
          title: text('Super permutation payout', 'Super 全保派彩', 'Bayaran susunan Super'),
          headers: permutationHeaders,
          rows: [
            ['1ST', 'RM 271', 'RM 542', 'RM 1,084', 'RM 1,625'],
            ['2ND', 'RM 271', 'RM 542', 'RM 1,084', 'RM 1,625'],
            ['3RD', 'RM 271', 'RM 542', 'RM 1,084', 'RM 1,625'],
            ['STA / CON', 'RM 28', 'RM 55', 'RM 109', 'RM 163'],
            ['TP3', 'RM 91', 'RM 181', 'RM 362', 'RM 542'],
            [text('ALL, top-three prizes', 'ALL，头奖/二奖/三奖', 'ALL, hadiah tiga teratas'), 'RM 55', 'RM 109', 'RM 217', 'RM 325'],
            [text('ALL, Special / Consolation', 'ALL，特别奖/安慰奖', 'ALL, Khas / Saguhati'), 'RM 6', 'RM 11', 'RM 22', 'RM 33']
          ]
        }]
      },
      {
        title: text('1+3D Jackpot', '1+3D Jackpot', '1+3D Jackpot'),
        stake: text('Per RM2 bet', '每 RM2 投注', 'Setiap taruhan RM2'),
        overview: text('The jackpot table distinguishes minimum jackpot references from fixed lower-group payouts and listed payout caps.', 'Jackpot 表格区分最低奖池、固定派彩和资料所列总派彩上限。', 'Jadual jackpot membezakan rujukan jackpot minimum, bayaran tetap dan had jumlah bayaran yang disenaraikan.'),
        tables: [{title: text('1+3D Jackpot payout', '1+3D Jackpot 派彩', 'Bayaran 1+3D Jackpot'), headers: [prize, condition, payout], rows: jackpot4dRows}]
      },
      {
        title: text('DMC Jackpot', 'DMC Jackpot', 'DMC Jackpot'),
        stake: text('Per RM2 bet', '每 RM2 投注', 'Setiap taruhan RM2'),
        overview: text('This game combines one four-digit number with one three-digit number. Jackpot 2 depends on listed 1+3D and 3D prize combinations.', '此玩法选择一组四位号码和一组三位号码；Jackpot 2 根据资料列出的 1+3D 与 3D 奖项组合判断。', 'Permainan ini menggabungkan satu nombor empat digit dan satu nombor tiga digit. Jackpot 2 bergantung pada kombinasi hadiah 1+3D dan 3D yang disenaraikan.'),
        bullets: [text('Jackpot 2 combinations listed: 1+3D 2nd + 3D 1st; 1+3D 3rd + 3D 1st; 1+3D 2nd + 3D 3rd; 1+3D 3rd + 3D 2nd; 1+3D 1st + 3D 3rd.', 'Jackpot 2 组合包括：1+3D 二奖 + 3D 头奖、1+3D 三奖 + 3D 头奖、1+3D 二奖 + 3D 三奖、1+3D 三奖 + 3D 二奖、1+3D 头奖 + 3D 三奖。', 'Kombinasi Jackpot 2: 1+3D Kedua + 3D Pertama; 1+3D Ketiga + 3D Pertama; 1+3D Kedua + 3D Ketiga; 1+3D Ketiga + 3D Kedua; 1+3D Pertama + 3D Ketiga.')],
        tables: [{
          title: text('DMC Jackpot payout', 'DMC Jackpot 派彩', 'Bayaran DMC Jackpot'),
          headers: [prize, condition, payout, maxPayout],
          rows: [
            ['Jackpot 1', text('The two numbers match 1+3D 1st and 2nd prizes respectively', '两组号码分别匹配 1+3D 头奖和二奖', 'Dua nombor masing-masing sepadan Hadiah Pertama dan Kedua 1+3D'), text('Minimum RM 1,800,000', '最低 RM 1,800,000', 'Minimum RM 1,800,000'), text('No fixed cap', '无固定上限', 'Tiada had tetap')],
            ['Jackpot 2', text('Matches listed 1+3D and 3D prize combinations', '符合资料列出的 1+3D 与 3D 奖项组合', 'Sepadan kombinasi hadiah 1+3D dan 3D yang disenaraikan'), text('Minimum RM 100,000', '最低 RM 100,000', 'Minimum RM 100,000'), text('No fixed cap', '无固定上限', 'Tiada had tetap')],
            [third, text('1+3D number matches 1st, 2nd or 3rd Prize', '1+3D 号码匹配头奖、二奖或三奖', 'Nombor 1+3D sepadan Hadiah Pertama, Kedua atau Ketiga'), 'RM 250', 'RM 10,000,000'],
            [fourth, text('1+3D number matches a Special Prize', '1+3D 号码匹配特别奖', 'Nombor 1+3D sepadan Hadiah Khas'), 'RM 150', 'RM 10,000,000'],
            [fifth, text('1+3D number matches a Consolation Prize', '1+3D 号码匹配安慰奖', 'Nombor 1+3D sepadan Hadiah Saguhati'), 'RM 50', 'RM 10,000,000'],
            [sixth, text('3D number matches 3D 1st, 2nd or 3rd Prize', '3D 号码匹配 3D 头奖、二奖或三奖', 'Nombor 3D sepadan Hadiah Pertama, Kedua atau Ketiga 3D'), 'RM 20', 'RM 10,000,000']
          ]
        }]
      },
      {
        title: text('3D Jackpot', '3D Jackpot', '3D Jackpot'),
        stake: text('Per RM2 bet', '每 RM2 投注', 'Setiap taruhan RM2'),
        overview: text('Select three 3D numbers from 000 to 999. The three numbers form one combination entry.', '从 000 至 999 选择三组 3D 号码，三组号码形成一项组合投注。', 'Pilih tiga nombor 3D daripada 000 hingga 999. Tiga nombor itu membentuk satu entri kombinasi.'),
        tables: [{
          title: text('3D Jackpot payout', '3D Jackpot 派彩', 'Bayaran 3D Jackpot'),
          headers: [prize, condition, payout, maxPayout],
          rows: [
            ['Jackpot 1', text('Three numbers match the 3D top-three prizes in any order', '三组号码以任意顺序匹配 3D 前三奖', 'Tiga nombor sepadan hadiah tiga teratas 3D dalam apa-apa susunan'), text('Minimum RM 600,000', '最低 RM 600,000', 'Minimum RM 600,000'), text('No fixed cap', '无固定上限', 'Tiada had tetap')],
            [second, text('Any two numbers match any two of the top-three prizes', '任意两组号码匹配前三奖中的任意两个', 'Mana-mana dua nombor sepadan mana-mana dua hadiah tiga teratas'), 'RM 500', 'RM 5,000,000'],
            [consolation, text('Any one number matches one of the top-three prizes', '任意一组号码匹配前三奖之一', 'Mana-mana satu nombor sepadan satu hadiah tiga teratas'), 'RM 3', 'RM 5,000,000']
          ]
        }]
      }
    ]
  },
  {
    slug: 'sports-toto',
    providerCode: 'sports_toto',
    title: text('Sports Toto Payout Structure', '多多博彩派彩结构', 'Struktur Bayaran Hadiah Sports Toto'),
    menuLabel: text('Sports Toto', '多多博彩', 'Sports Toto'),
    metaTitle: text('Sports Toto Payout Structure - 4D AI', '多多博彩派彩结构 - 4D AI', 'Struktur Bayaran Hadiah Sports Toto - 4D AI'),
    metaDescription: text('Reference payout information for Sports Toto 4D, 5D, 6D and Toto jackpot games.', '查看多多博彩 4D、5D、6D 与 Toto Jackpot 派彩资讯。', 'Maklumat bayaran rujukan untuk Sports Toto 4D, 5D, 6D dan permainan jackpot Toto.'),
    intro: text('Sports Toto payout information is grouped by game so fixed 4D payouts, jackpot references and lotto-style tables stay separate.', '本页按游戏整理多多博彩派彩资料，清楚区分固定 4D 派彩、Jackpot 参考和 Lotto 类玩法。', 'Maklumat bayaran Sports Toto disusun mengikut permainan supaya bayaran tetap 4D, rujukan jackpot dan jadual lotto kekal jelas.'),
    dataNote: text('Jackpot entries list minimum jackpot or pool references only. Actual distribution follows the latest provider rules.', 'Jackpot 项目只列最低奖池或奖池参考；实际分配以最新官方规则为准。', 'Entri jackpot hanya menyenaraikan jackpot minimum atau rujukan kolam; pembahagian sebenar tertakluk kepada peraturan rasmi terkini.'),
    games: [
      fourDGame(text('4D', '4D', '4D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')),
      permutationGame(text('4D Permutation', '4D 全保', '4D Susunan'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')),
      {title: text('4D Jackpot', '4D Jackpot', '4D Jackpot'), stake: text('Per RM2 bet', '每 RM2 投注', 'Setiap taruhan RM2'), overview: text('The table separates minimum jackpot references from fixed lower-group payouts and listed payout caps.', '表格区分最低 Jackpot 参考、固定派彩和资料所列总派彩上限。', 'Jadual membezakan rujukan jackpot minimum, bayaran tetap dan had jumlah bayaran yang disenaraikan.'), tables: [{title: text('4D Jackpot payout', '4D Jackpot 派彩', 'Bayaran 4D Jackpot'), headers: [prize, condition, payout], rows: jackpot4dRows}]},
      {
        title: text('5D', '5D', '5D'),
        stake: text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'),
        overview: text('Select one five-digit number from 00000 to 99999. Each winning number receives one prize category only.', '从 00000 至 99999 选择五位号码；每个中奖号码只获得一个奖项。', 'Pilih satu nombor lima digit 00000 hingga 99999. Setiap nombor menang menerima satu kategori hadiah sahaja.'),
        tables: [{title: text('5D payout', '5D 派彩', 'Bayaran 5D'), headers: [prize, condition, payout], rows: [[first, text('Five-digit number matches the 1st Prize', '五位号码匹配头奖', 'Nombor lima digit sepadan Hadiah Pertama'), 'RM 15,000'], [second, text('Five-digit number matches the 2nd Prize', '五位号码匹配二奖', 'Nombor lima digit sepadan Hadiah Kedua'), 'RM 5,000'], [third, text('Five-digit number matches the 3rd Prize', '五位号码匹配三奖', 'Nombor lima digit sepadan Hadiah Ketiga'), 'RM 3,000'], [fourth, text('Matches the last four digits of the 1st Prize number', '匹配头奖号码的后四位', 'Sepadan empat digit akhir nombor Hadiah Pertama'), 'RM 500'], [fifth, text('Matches the last three digits of the 1st Prize number', '匹配头奖号码的后三位', 'Sepadan tiga digit akhir nombor Hadiah Pertama'), 'RM 20'], [sixth, text('Matches the last two digits of the 1st Prize number', '匹配头奖号码的后两位', 'Sepadan dua digit akhir nombor Hadiah Pertama'), 'RM 5']]}]
      },
      {
        title: text('6D', '6D', '6D'),
        stake: text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'),
        overview: text('Select one six-digit number from 000000 to 999999. Each winning number receives one prize category only.', '从 000000 至 999999 选择六位号码；每个中奖号码只获得一个奖项。', 'Pilih satu nombor enam digit 000000 hingga 999999. Setiap nombor menang menerima satu kategori hadiah sahaja.'),
        tables: [{title: text('6D payout', '6D 派彩', 'Bayaran 6D'), headers: [prize, condition, payout], rows: [[first, text('Six-digit number matches exactly', '六位号码完全匹配', 'Nombor enam digit sepadan tepat'), 'RM 100,000'], [second, text('Matches the first five or last five digits of the 1st Prize', '匹配头奖的前五位或后五位', 'Sepadan lima digit depan atau belakang Hadiah Pertama'), 'RM 3,000'], [third, text('Matches the first four or last four digits of the 1st Prize', '匹配头奖的前四位或后四位', 'Sepadan empat digit depan atau belakang Hadiah Pertama'), 'RM 300'], [fourth, text('Matches the first three or last three digits of the 1st Prize', '匹配头奖的前三位或后三位', 'Sepadan tiga digit depan atau belakang Hadiah Pertama'), 'RM 30'], [fifth, text('Matches the first two or last two digits of the 1st Prize', '匹配头奖的前两位或后两位', 'Sepadan dua digit depan atau belakang Hadiah Pertama'), 'RM 4']]}]
      },
      lottoGame(text('Star Toto 6/50', 'Star Toto 6/50', 'Star Toto 6/50'), text('Select 6 unique numbers from 1 to 50. Minimum bet RM1.', '从 1 至 50 选择 6 个不重复号码。最低投注 RM1。', 'Pilih 6 nombor unik daripada 1 hingga 50. Minimum taruhan RM1.'), [['Jackpot 1', text('All 6 numbers match', '6 个号码全部匹配', 'Semua 6 nombor sepadan'), text('Minimum RM 1,188,888', '最低 RM 1,188,888', 'Minimum RM 1,188,888')], ['Jackpot 2', text('5 numbers plus Bonus Number match', '匹配 5 个号码及 Bonus Number', '5 nombor serta Bonus Number sepadan'), text('Minimum RM 100,000', '最低 RM 100,000', 'Minimum RM 100,000')], [third, text('5 numbers match', '匹配 5 个号码', '5 nombor sepadan'), 'RM 2,008'], [fourth, text('4 numbers plus Bonus Number match', '匹配 4 个号码及 Bonus Number', '4 nombor serta Bonus Number sepadan'), 'RM 788'], [fifth, text('4 numbers match', '匹配 4 个号码', '4 nombor sepadan'), 'RM 28'], [sixth, text('3 numbers plus Bonus Number match', '匹配 3 个号码及 Bonus Number', '3 nombor serta Bonus Number sepadan'), 'RM 18'], [seventh, text('3 numbers match', '匹配 3 个号码', '3 nombor sepadan'), 'RM 8']], text('If there are multiple jackpot winners, the pool may be distributed according to official rules. This page does not assume a specific sharing formula.', '若有多名 Jackpot 得主，奖池可能按正式规则分配；本页不自行声称具体分配公式。', 'Jika terdapat beberapa pemenang jackpot, kolam mungkin diagihkan mengikut peraturan rasmi. Halaman ini tidak mengandaikan formula pembahagian tertentu.')),
      lottoGame(text('Supreme Toto 6/55', 'Supreme Toto 6/55', 'Supreme Toto 6/55'), text('Select 6 unique numbers from 1 to 55. Minimum bet RM1.', '从 1 至 55 选择 6 个不重复号码。最低投注 RM1。', 'Pilih 6 nombor unik daripada 1 hingga 55. Minimum taruhan RM1.'), [['Jackpot 1', text('All 6 numbers match', '6 个号码全部匹配', 'Semua 6 nombor sepadan'), text('Minimum RM 3,000,000', '最低 RM 3,000,000', 'Minimum RM 3,000,000')], [second, text('5 numbers match', '匹配 5 个号码', '5 nombor sepadan'), 'RM 3,300'], [third, text('4 numbers match', '匹配 4 个号码', '4 nombor sepadan'), 'RM 40'], [fourth, text('3 numbers match', '匹配 3 个号码', '3 nombor sepadan'), 'RM 3']]),
      lottoGame(text('Power Toto 6/58', 'Power Toto 6/58', 'Power Toto 6/58'), text('Select 6 unique numbers from 1 to 58. Minimum bet RM2.', '从 1 至 58 选择 6 个不重复号码。最低投注 RM2。', 'Pilih 6 nombor unik daripada 1 hingga 58. Minimum taruhan RM2.'), [['Jackpot 1', text('All 6 numbers match', '6 个号码全部匹配', 'Semua 6 nombor sepadan'), text('Minimum RM 8,888,888', '最低 RM 8,888,888', 'Minimum RM 8,888,888')], [second, text('5 numbers match', '匹配 5 个号码', '5 nombor sepadan'), 'RM 6,888'], [third, text('4 numbers match', '匹配 4 个号码', '4 nombor sepadan'), 'RM 80'], [fourth, text('3 numbers match', '匹配 3 个号码', '3 nombor sepadan'), 'RM 8']])
    ]
  },
  {
    slug: 'singapore-pools',
    providerCode: 'singapore',
    title: text('Singapore Pools Payout Structure', '新加坡博彩派彩结构', 'Struktur Bayaran Hadiah Singapore Pools'),
    menuLabel: text('Singapore Pools', '新加坡博彩', 'Singapore Pools'),
    metaTitle: text('Singapore Pools Payout Structure - 4D AI', '新加坡博彩派彩结构 - 4D AI', 'Struktur Bayaran Hadiah Singapore Pools - 4D AI'),
    metaDescription: text('Reference payout information for Singapore Pools 4D, 4D iBet and Toto 6/49.', '查看 Singapore Pools 4D、4D iBet 与 Toto 6/49 派彩资讯。', 'Maklumat rujukan bayaran untuk Singapore Pools 4D, 4D iBet dan Toto 6/49.'),
    intro: text('Singapore Pools figures use SGD and are shown separately from Malaysian RM payout tables.', 'Singapore Pools 资料使用 SGD，并与马来西亚 RM 派彩表分开呈现。', 'Angka Singapore Pools menggunakan SGD dan dipaparkan berasingan daripada jadual RM Malaysia.'),
    dataNote: text('Check Singapore Pools latest official rules for current game terms, jackpot arrangements and prize sharing.', '请以 Singapore Pools 最新官方规则确认现行游戏条款、奖池安排与多人分享方式。', 'Semak peraturan rasmi terkini Singapore Pools untuk terma permainan, aturan jackpot dan perkongsian hadiah.'),
    games: [
      {title: text('4D', '4D', '4D'), stake: text('Per SGD1 bet', '每 SGD1 投注', 'Setiap taruhan SGD1'), overview: text('A four-digit number is paid according to Big or Small bet coverage.', '四位号码按 Big 或 Small 投注覆盖范围派彩。', 'Nombor empat digit dibayar mengikut liputan taruhan Big atau Small.'), tables: [standard4dTable('SGD')]},
      {
        title: text('4D iBet', '4D iBet', '4D iBet'),
        stake: text('Per SGD1 bet', '每 SGD1 投注', 'Setiap taruhan SGD1'),
        overview: text('iBet payouts vary by the number of possible arrangements: 24, 12, 6 or 4.', 'iBet 派彩按 24、12、6 或 4 个排列类别区分。', 'Bayaran iBet berbeza mengikut kategori susunan 24, 12, 6 atau 4.'),
        tables: [
          {title: text('Big iBet payout', 'Big iBet 派彩', 'Bayaran Big iBet'), headers: [prize, 'iBet 24', 'iBet 12', 'iBet 6', 'iBet 4'], rows: [[first, 'SGD 83', 'SGD 166', 'SGD 335', 'SGD 500'], [second, 'SGD 41', 'SGD 83', 'SGD 168', 'SGD 250'], [third, 'SGD 20', 'SGD 40', 'SGD 85', 'SGD 127'], [special, 'SGD 10', 'SGD 20', 'SGD 41', 'SGD 62'], [consolation, 'SGD 3', 'SGD 6', 'SGD 10', 'SGD 15']]},
          {title: text('Small iBet payout', 'Small iBet 派彩', 'Bayaran Small iBet'), headers: [prize, 'iBet 24', 'iBet 12', 'iBet 6', 'iBet 4'], rows: [[first, 'SGD 125', 'SGD 250', 'SGD 500', 'SGD 750'], [second, 'SGD 83', 'SGD 167', 'SGD 333', 'SGD 500'], [third, 'SGD 33', 'SGD 66', 'SGD 133', 'SGD 200']]}
        ]
      },
      lottoGame(text('Toto 6/49', 'Toto 6/49', 'Toto 6/49'), text('Select 6 unique numbers from 1 to 49. Minimum bet SGD1.', '从 1 至 49 选择 6 个不重复号码。最低投注 SGD1。', 'Pilih 6 nombor unik daripada 1 hingga 49. Minimum taruhan SGD1.'), [['Group 1', text('All 6 numbers match', '6 个号码全部匹配', 'Semua 6 nombor sepadan'), text('38% of prize pool', '奖池的 38%', '38% daripada kolam hadiah')], ['Group 2', text('5 numbers plus Additional Number match', '匹配 5 个号码及 Additional Number', '5 nombor serta Additional Number sepadan'), text('8% of prize pool', '奖池的 8%', '8% daripada kolam hadiah')], ['Group 3', text('5 numbers match', '匹配 5 个号码', '5 nombor sepadan'), text('5.5% of prize pool', '奖池的 5.5%', '5.5% daripada kolam hadiah')], ['Group 4', text('4 numbers plus Additional Number match', '匹配 4 个号码及 Additional Number', '4 nombor serta Additional Number sepadan'), text('3% of prize pool', '奖池的 3%', '3% daripada kolam hadiah')], ['Group 5', text('4 numbers match', '匹配 4 个号码', '4 nombor sepadan'), 'SGD 50'], ['Group 6', text('3 numbers plus Additional Number match', '匹配 3 个号码及 Additional Number', '3 nombor serta Additional Number sepadan'), 'SGD 25'], ['Group 7', text('3 numbers match', '匹配 3 个号码', '3 nombor sepadan'), 'SGD 10']], text('The provided minimum jackpot is SGD 1,000,000. If Groups 1 to 4 have multiple winners, the relevant prize may be shared by winners.', '资料所列最低 Jackpot 为 SGD 1,000,000。若 Group 1 至 Group 4 有多名得主，相应奖项可能由得主共同分享。', 'Jackpot minimum yang diberi ialah SGD 1,000,000. Jika Kumpulan 1 hingga 4 mempunyai beberapa pemenang, hadiah berkaitan mungkin dikongsi.'))
    ]
  },
  {
    slug: 'stc',
    providerCode: 'sandakan',
    title: text('Sandakan Turf Club (STC) Payout Structure', '山打根赛马会（STC）派彩结构', 'Struktur Bayaran Hadiah Sandakan Turf Club (STC)'),
    menuLabel: text('Sandakan Turf Club (STC)', '山打根赛马会', 'Sandakan Turf Club (STC)'),
    metaTitle: text('STC Payout Structure - 4D AI', 'STC 派彩结构 - 4D AI', 'Struktur Bayaran STC - 4D AI'),
    metaDescription: text('Reference payout information for Sandakan Turf Club 4D and permutation games.', '查看山打根赛马会 4D 与全保派彩资讯。', 'Maklumat rujukan bayaran untuk 4D Sandakan Turf Club dan permainan susunan.'),
    intro: text('STC payout information currently covers 4D fixed payouts and 4D permutation payouts.', 'STC 本页目前整理 4D 固定派彩与 4D 全保派彩。', 'Maklumat STC di halaman ini meliputi bayaran tetap 4D dan bayaran susunan 4D.'),
    dataNote: text('This page lists only the payout information provided for STC. Confirm current rules with the provider materials.', '本页只列出已提供的 STC 派彩资料；现行规则请以 Provider 最新资料为准。', 'Halaman ini hanya menyenaraikan maklumat STC yang diberi. Sahkan peraturan terkini melalui bahan penyedia.'),
    games: [fourDGame(text('4D', '4D', '4D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')), permutationGame(text('4D Permutation', '4D 全保', '4D Susunan'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'))]
  },
  {
    slug: 'sabah-88',
    providerCode: 'sabah88',
    title: text('Sabah 88 Payout Structure', '沙巴 88 派彩结构', 'Struktur Bayaran Hadiah Sabah 88'),
    menuLabel: text('Sabah 88', '沙巴 88', 'Sabah 88'),
    metaTitle: text('Sabah 88 Payout Structure - 4D AI', '沙巴 88 派彩结构 - 4D AI', 'Struktur Bayaran Sabah 88 - 4D AI'),
    metaDescription: text('Reference payout information for Sabah 88 3D, 4D, permutation and Lotto 6/45.', '查看沙巴 88 3D、4D、全保与 Lotto 6/45 派彩资讯。', 'Maklumat rujukan bayaran untuk Sabah 88 3D, 4D, susunan dan Lotto 6/45.'),
    intro: text('Sabah 88 payout information is grouped into 3D, 4D, permutation and Lotto 6/45 sections.', '沙巴 88 派彩资料按 3D、4D、全保和 Lotto 6/45 分区整理。', 'Maklumat bayaran Sabah 88 disusun kepada bahagian 3D, 4D, susunan dan Lotto 6/45.'),
    dataNote: text('For multiple-winner jackpot handling and current terms, check the latest provider information.', '关于多名得主的 Jackpot 派彩方式和现行条款，请查阅 Provider 最新官方资料。', 'Untuk pengendalian jackpot berbilang pemenang dan terma semasa, semak maklumat rasmi penyedia terkini.'),
    games: [
      {title: text('3D', '3D', '3D'), stake: text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'), overview: text('Select one three-digit number from 000 to 999.', '从 000 至 999 选择一组三位号码。', 'Pilih satu nombor tiga digit daripada 000 hingga 999.'), tables: [{title: text('3D payout', '3D 派彩', 'Bayaran 3D'), headers: [prize, payout], rows: [[first, 'RM 500'], [second, 'RM 100'], [third, 'RM 30']]}]},
      fourDGame(text('4D', '4D', '4D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')),
      permutationGame(text('4D Permutation', '4D 全保', '4D Susunan'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1')),
      lottoGame(text('Lotto 6/45', 'Lotto 6/45', 'Lotto 6/45'), text('Select 6 unique numbers from 1 to 45. Minimum bet RM1.', '从 1 至 45 选择 6 个不重复号码。最低投注 RM1。', 'Pilih 6 nombor unik daripada 1 hingga 45. Minimum taruhan RM1.'), [['Jackpot 1', text('All 6 numbers match', '6 个号码全部匹配', 'Semua 6 nombor sepadan'), text('Minimum RM 500,000', '最低 RM 500,000', 'Minimum RM 500,000')], ['Jackpot 2', text('5 numbers plus Bonus Number match', '匹配 5 个号码及 Bonus Number', '5 nombor serta Bonus Number sepadan'), text('Minimum RM 5,000', '最低 RM 5,000', 'Minimum RM 5,000')], [third, text('5 numbers match', '匹配 5 个号码', '5 nombor sepadan'), 'RM 1,400'], [fourth, text('4 numbers plus Bonus Number match', '匹配 4 个号码及 Bonus Number', '4 nombor serta Bonus Number sepadan'), 'RM 250'], [fifth, text('4 numbers match', '匹配 4 个号码', '4 nombor sepadan'), 'RM 19'], [sixth, text('3 numbers plus Bonus Number match', '匹配 3 个号码及 Bonus Number', '3 nombor serta Bonus Number sepadan'), 'RM 5'], [seventh, text('3 numbers match', '匹配 3 个号码', '3 nombor sepadan'), 'RM 2']], text('This page does not infer how multiple winners share jackpot prizes. Refer to the latest provider terms.', '本页不自行推断多名得主如何分享 Jackpot；请查阅 Provider 最新条款。', 'Halaman ini tidak membuat andaian tentang perkongsian jackpot oleh beberapa pemenang. Rujuk terma penyedia terkini.'))
    ]
  },
  {
    slug: 'sarawak',
    providerCode: 'sarawak',
    title: text('Sarawak 4D Payout Structure', '砂拉越大万派彩结构', 'Struktur Bayaran Hadiah Sarawak 4D'),
    menuLabel: text('Sarawak Provider', '砂拉越大万', 'Sarawak Provider'),
    metaTitle: text('Sarawak 4D Payout Structure - 4D AI', '砂拉越大万派彩结构 - 4D AI', 'Struktur Bayaran Sarawak 4D - 4D AI'),
    metaDescription: text('Reference payout information currently available for Sarawak 4D.', '查看目前已提供的砂拉越 4D 派彩资讯。', 'Maklumat rujukan bayaran yang tersedia untuk Sarawak 4D.'),
    intro: text('The existing project provider identifier is sarawak, with display name Sarawak 4D. This page uses that neutral project naming.', '项目现有 provider identifier 为 sarawak，显示名为 Sarawak 4D；本页复用该中性命名。', 'Identifier penyedia sedia ada dalam projek ialah sarawak, dengan nama paparan Sarawak 4D. Halaman ini menggunakan penamaan neutral tersebut.'),
    dataNote: text('Only the 4D payout information provided is listed. No jackpot, permutation or other game data has been added.', '本页只列出已提供的 4D 派彩资料，没有补充 Jackpot、全保或其他未提供的游戏资料。', 'Hanya maklumat bayaran 4D yang diberi disenaraikan. Tiada data jackpot, susunan atau permainan lain ditambah.'),
    footerNote: text('Other Sarawak game rules, if any, should be checked through the provider latest official materials.', '如需其他砂拉越游戏规则，请查阅 Provider 最新官方资料。', 'Peraturan permainan Sarawak lain, jika ada, hendaklah disemak melalui bahan rasmi penyedia terkini.'),
    games: [fourDGame(text('4D', '4D', '4D'), text('Per RM1 bet', '每 RM1 投注', 'Setiap taruhan RM1'))]
  }
];

function lottoGame(title: LocalizedText, overview: LocalizedText, rows: PayoutCell[][], note?: LocalizedText): PayoutGame {
  return {
    title,
    stake: text('Lotto-style game', 'Lotto 类玩法', 'Permainan gaya lotto'),
    overview,
    bullets: note ? [note] : undefined,
    tables: [{title: text('Prize table', '奖项表', 'Jadual hadiah'), headers: [prize, condition, payout], rows}]
  };
}

export const providerPayoutsBySlug = new Map(providerPayoutPages.map((page) => [page.slug, page]));
export const providerPayoutSlugs = providerPayoutPages.map((page) => page.slug);

export function getPayoutProvider(page: ProviderPayoutPage): ProviderConfig {
  return getProvider(page.providerCode);
}

export function cellText(cell: PayoutCell, locale: Locale): string {
  return typeof cell === 'string' ? cell : cell[locale];
}
