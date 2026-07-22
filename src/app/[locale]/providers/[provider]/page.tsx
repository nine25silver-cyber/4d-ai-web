import {notFound} from 'next/navigation';
import type {Metadata} from 'next';
import {routing, type Locale} from '@/i18n/routing';
import {buildMetadata} from '@/lib/seo';
import {ProviderPayoutContent} from '@/components/ProviderPayoutContent';
import {
  providerPayoutPages,
  providerPayoutsBySlug,
  type ProviderGuideContent,
  type ProviderPayoutPage,
  type ProviderPayoutSlug
} from '@/lib/provider-payouts';

const daMaCaiGuide: ProviderGuideContent = {
  heroTitle: {
    en: 'Da Ma Cai Game Guide',
    zh: '大马彩游戏指南',
    ms: 'Panduan Permainan Da Ma Cai'
  },
  heroIntro: {
    en: 'Review Da Ma Cai game categories, common terminology and prize structures in one independent information guide. This page is for general reference and is not an official Da Ma Cai publication.',
    zh: '本指南整理大马彩相关游戏类别、常见术语与派彩结构，供用户作一般资讯和研究参考。本页面并非大马彩官方发布内容。',
    ms: 'Semak kategori permainan Da Ma Cai, istilah lazim dan struktur hadiah dalam satu panduan maklumat bebas. Halaman ini untuk rujukan umum dan bukan penerbitan rasmi Da Ma Cai.'
  },
  tags: [
    {en: 'Malaysia', zh: '马来西亚', ms: 'Malaysia'},
    {en: 'Game Structure', zh: '游戏结构', ms: 'Struktur Permainan'},
    {en: 'Reference Only', zh: '仅供参考', ms: 'Untuk Rujukan Sahaja'}
  ],
  breadcrumb: {
    home: {en: 'Home', zh: '首页', ms: 'Laman Utama'},
    more: {en: 'More', zh: '更多', ms: 'Lagi'},
    providerGuides: {en: 'Provider Guides', zh: 'Provider 指南', ms: 'Panduan Penyedia'}
  },
  aboutTitle: {
    en: 'About Da Ma Cai',
    zh: '关于大马彩',
    ms: 'Mengenai Da Ma Cai'
  },
  aboutParagraphs: [
    {
      en: 'This page organises Da Ma Cai game categories, common terms and payout structures so users can compare the available information in a clearer format.',
      zh: '本页面整理大马彩相关游戏类别、常见术语与派彩结构，让用户能以更清楚的方式比较现有资料。',
      ms: 'Halaman ini menyusun kategori permainan Da Ma Cai, istilah lazim dan struktur bayaran supaya pengguna boleh membandingkan maklumat yang tersedia dengan lebih jelas.'
    },
    {
      en: '4D AI is an independent information platform. It does not operate Da Ma Cai games, sell tickets, accept bets or process prize claims. The content is not betting advice and does not guarantee future results.',
      zh: '4D AI 是独立资讯平台，不经营大马彩游戏、不销售票券、不接受投注，也不处理兑奖。本页面内容不构成投注建议，也不保证未来结果。',
      ms: '4D AI ialah platform maklumat bebas. Ia tidak mengendalikan permainan Da Ma Cai, tidak menjual tiket, tidak menerima pertaruhan dan tidak memproses tuntutan hadiah. Kandungan ini bukan nasihat pertaruhan dan tidak menjamin keputusan masa hadapan.'
    },
    {
      en: 'Game rules, payout amounts and jackpot arrangements may change. Users should verify official rules and payout information with the provider latest official publication before relying on any figure.',
      zh: '游戏规则、派彩金额及奖池安排可能调整。用户在依赖任何数字前，应以相关 Provider 最新官方公布的规则与派彩资料为准。',
      ms: 'Peraturan permainan, jumlah bayaran dan aturan jackpot boleh berubah. Pengguna perlu menyemak peraturan rasmi dan maklumat bayaran melalui penerbitan rasmi terkini penyedia sebelum bergantung pada mana-mana angka.'
    }
  ],
  summaryTitle: {
    en: 'Provider Summary',
    zh: 'Provider 摘要',
    ms: 'Ringkasan Penyedia'
  },
  summary: [
    {label: {en: 'Provider', zh: 'Provider', ms: 'Penyedia'}, value: {en: 'Da Ma Cai', zh: '大马彩', ms: 'Da Ma Cai'}},
    {label: {en: 'Guide coverage', zh: '指南涵盖', ms: 'Liputan panduan'}, value: {en: '3D, 1+3D, Permutation, Super, Jackpot', zh: '3D、1+3D、全保、Super、Jackpot', ms: '3D, 1+3D, Susunan, Super, Jackpot'}},
    {label: {en: 'Information type', zh: '资料类型', ms: 'Jenis maklumat'}, value: {en: 'Game structure and payout reference', zh: '游戏结构与派彩参考', ms: 'Rujukan struktur permainan dan bayaran'}},
    {label: {en: 'Official status', zh: '官方状态', ms: 'Status rasmi'}, value: {en: 'Independent informational guide', zh: '独立资讯指南', ms: 'Panduan maklumat bebas'}},
    {label: {en: 'Verification', zh: '核对方式', ms: 'Pengesahan'}, value: {en: 'Check latest official publication', zh: '请核对最新官方公布', ms: 'Semak penerbitan rasmi terkini'}}
  ],
  availableGamesTitle: {
    en: 'Available Games',
    zh: '主要游戏',
    ms: 'Permainan Tersedia'
  },
  availableGames: [
    {title: {en: '3D', zh: '3D', ms: '3D'}, description: {en: 'A three-digit game category using numbers from 000 to 999 with listed prize tiers.', zh: '三位数字游戏类别，号码范围为 000 至 999，并按资料列出的奖级呈现。', ms: 'Kategori permainan tiga digit menggunakan nombor 000 hingga 999 dengan peringkat hadiah yang disenaraikan.'}},
    {title: {en: '1+3D', zh: '1+3D', ms: '1+3D'}, description: {en: 'A four-digit game category with Big / ABC and Small / A style coverage shown in the payout table.', zh: '四位数字游戏类别，派彩表列出 Big / ABC 与 Small / A 等覆盖方式。', ms: 'Kategori permainan empat digit dengan liputan gaya Big / ABC dan Small / A seperti dalam jadual bayaran.'}},
    {title: {en: '1+3D Permutation', zh: '1+3D 全保', ms: 'Susunan 1+3D'}, description: {en: 'A permutation format where valid arrangements depend on the selected digits and repeated-number pattern.', zh: '全保排列形式，有效排列数量取决于所选数字及是否存在重复数字。', ms: 'Format susunan yang bergantung pada digit pilihan dan corak digit berulang.'}},
    {title: {en: 'Super 1+3D', zh: 'Super 1+3D', ms: 'Super 1+3D'}, description: {en: 'A four-digit category organised by selected prize categories such as 1ST, 2ND, 3RD, STA, CON, TP3 or ALL.', zh: '按 1ST、2ND、3RD、STA、CON、TP3 或 ALL 等所选奖项类别整理的四位数字玩法。', ms: 'Kategori empat digit yang disusun mengikut kategori hadiah pilihan seperti 1ST, 2ND, 3RD, STA, CON, TP3 atau ALL.'}},
    {title: {en: 'Super 1+3D Permutation', zh: 'Super 1+3D 全保', ms: 'Susunan Super 1+3D'}, description: {en: 'A Super permutation table that separates payout references by prize category and arrangement count.', zh: 'Super 全保表按奖项类别与排列数量区分派彩参考。', ms: 'Jadual susunan Super yang membezakan rujukan bayaran mengikut kategori hadiah dan bilangan susunan.'}},
    {title: {en: '1+3D Jackpot', zh: '1+3D Jackpot', ms: '1+3D Jackpot'}, description: {en: 'A jackpot category that separates minimum pool references from fixed lower-group payout rows.', zh: 'Jackpot 类别，表格区分最低奖池参考与较低组别固定派彩。', ms: 'Kategori jackpot yang membezakan rujukan kumpulan minimum daripada baris bayaran tetap kumpulan lain.'}},
    {title: {en: 'DMC Jackpot', zh: 'DMC Jackpot', ms: 'DMC Jackpot'}, description: {en: 'A combined 1+3D and 3D jackpot format with listed prize groups and maximum payout references.', zh: '结合 1+3D 与 3D 的 Jackpot 形式，并列出奖项组别及最高派彩参考。', ms: 'Format jackpot gabungan 1+3D dan 3D dengan kumpulan hadiah serta rujukan bayaran maksimum yang disenaraikan.'}},
    {title: {en: '3D Jackpot', zh: '3D Jackpot', ms: '3D Jackpot'}, description: {en: 'A 3D jackpot category based on three selected 3D numbers and listed matching conditions.', zh: '基于三组所选 3D 号码及资料列出的匹配条件整理的 3D Jackpot 类别。', ms: 'Kategori 3D Jackpot berdasarkan tiga nombor 3D pilihan dan syarat padanan yang disenaraikan.'}}
  ],
  prizeStructureTitle: {
    en: 'Prize Structure',
    zh: '派彩结构',
    ms: 'Struktur Hadiah'
  },
  informationNotesTitle: {
    en: 'Information Notes',
    zh: '资讯说明',
    ms: 'Nota Maklumat'
  },
  informationNotes: [
    {
      en: 'Different game categories may use different number formats, prize groups or combination methods.',
      zh: '不同游戏类别可能使用不同号码格式、奖级或组合方式。',
      ms: 'Kategori permainan yang berbeza mungkin menggunakan format nombor, kumpulan hadiah atau kaedah gabungan yang berbeza.'
    },
    {
      en: 'Permutation means a selected set of digits may form multiple valid arrangements according to the relevant rules.',
      zh: 'Permutation / 全保表示所选数字组合可能按相关规则形成多个有效排列。',
      ms: 'Susunan bermaksud set digit pilihan boleh membentuk beberapa susunan sah mengikut peraturan berkaitan.'
    },
    {
      en: 'Jackpot pools and distribution arrangements may change according to the provider latest rules, and a minimum jackpot reference is not a guaranteed amount for every winner.',
      zh: 'Jackpot 奖池及分配方式可能依 Provider 最新规则调整；最低奖池参考并不代表每名得主保证获得该金额。',
      ms: 'Kumpulan jackpot dan aturan agihan boleh berubah mengikut peraturan terkini penyedia, dan rujukan jackpot minimum bukan jumlah terjamin untuk setiap pemenang.'
    },
    {
      en: 'The payout tables are an informational organisation of available reference data. Official results, rules, amounts and jackpot arrangements should be checked against the provider latest official publication.',
      zh: '派彩表只是对可用参考资料的一般资讯整理。正式结果、规则、金额及奖池安排应以 Provider 最新官方公布为准。',
      ms: 'Jadual bayaran ialah susunan maklumat rujukan yang tersedia. Keputusan rasmi, peraturan, jumlah dan aturan jackpot perlu disemak berdasarkan penerbitan rasmi terkini penyedia.'
    }
  ],
  faqTitle: {
    en: 'Frequently Asked Questions',
    zh: '常见问题',
    ms: 'Soalan Lazim'
  },
  faqs: [
    {question: {en: 'What is this Da Ma Cai guide for?', zh: '本大马彩指南用于什么？', ms: 'Untuk apakah panduan Da Ma Cai ini?'}, answer: {en: 'It organises Da Ma Cai game categories, terminology and payout structures for general information and research reference.', zh: '本指南整理大马彩游戏类别、术语与派彩结构，用于一般资讯和研究参考。', ms: 'Ia menyusun kategori permainan Da Ma Cai, istilah dan struktur bayaran untuk maklumat umum serta rujukan kajian.'}},
    {question: {en: 'Does 4D AI sell Da Ma Cai tickets?', zh: '4D AI 是否销售大马彩彩票？', ms: 'Adakah 4D AI menjual tiket Da Ma Cai?'}, answer: {en: 'No. 4D AI does not sell tickets, accept bets, operate draws or process prize claims.', zh: '不是。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。', ms: 'Tidak. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah.'}},
    {question: {en: 'Is 4D AI officially affiliated with Da Ma Cai?', zh: '4D AI 是否与大马彩有官方合作？', ms: 'Adakah 4D AI mempunyai hubungan rasmi dengan Da Ma Cai?'}, answer: {en: 'No official relationship is claimed on this page. The guide is independent informational content and is not an official Da Ma Cai publication.', zh: '本页面不声称任何官方关系。本指南属于独立资讯内容，并非大马彩官方发布内容。', ms: 'Tiada hubungan rasmi dituntut di halaman ini. Panduan ini ialah kandungan maklumat bebas dan bukan penerbitan rasmi Da Ma Cai.'}},
    {question: {en: 'What is the difference between 3D and 1+3D?', zh: '3D 与 1+3D 有什么区别？', ms: 'Apakah perbezaan antara 3D dan 1+3D?'}, answer: {en: '3D uses a three-digit number, while 1+3D uses a four-digit number and includes different prize-category coverage in the payout table.', zh: '3D 使用三位号码；1+3D 使用四位号码，并在派彩表中包含不同奖项覆盖方式。', ms: '3D menggunakan nombor tiga digit, manakala 1+3D menggunakan nombor empat digit dan mempunyai liputan kategori hadiah yang berbeza dalam jadual bayaran.'}},
    {question: {en: 'What does permutation mean?', zh: 'Permutation / 全保是什么意思？', ms: 'Apakah maksud susunan?'}, answer: {en: 'Permutation refers to valid arrangements of the selected digits. The number of arrangements can differ when digits repeat.', zh: 'Permutation / 全保指所选数字可组成的有效排列；如果数字重复，排列数量可能不同。', ms: 'Susunan merujuk kepada aturan sah bagi digit yang dipilih. Bilangan susunan boleh berbeza apabila digit berulang.'}},
    {question: {en: 'Are jackpot amounts guaranteed?', zh: 'Jackpot 金额是否保证？', ms: 'Adakah jumlah jackpot dijamin?'}, answer: {en: 'No. Jackpot figures may be minimum pool or payout references and do not guarantee that every winner receives the full amount shown.', zh: '不是。Jackpot 数字可能是最低奖池或派彩参考，并不保证每名得主获得页面显示的全部金额。', ms: 'Tidak. Angka jackpot mungkin rujukan kumpulan minimum atau bayaran dan tidak menjamin setiap pemenang menerima keseluruhan jumlah yang dipaparkan.'}},
    {question: {en: 'Where should users verify official rules and payouts?', zh: '用户应在哪里核对官方规则和派彩？', ms: 'Di manakah pengguna perlu menyemak peraturan dan bayaran rasmi?'}, answer: {en: 'Users should verify game rules, payout amounts and jackpot arrangements with the provider latest official publication.', zh: '用户应以相关 Provider 最新官方公布核对游戏规则、派彩金额及奖池安排。', ms: 'Pengguna perlu menyemak peraturan permainan, jumlah bayaran dan aturan jackpot melalui penerbitan rasmi terkini penyedia.'}}
  ],
  verificationTitle: {
    en: 'Verification notice',
    zh: '资料核对提示',
    ms: 'Notis pengesahan'
  },
  verificationText: {
    en: 'Please verify game rules, payout amounts and jackpot arrangements with the provider\'s latest official publication.',
    zh: '请以相关 Provider 最新官方公布的游戏规则、派彩金额及奖池安排为准。',
    ms: 'Sila semak peraturan permainan, jumlah bayaran hadiah dan aturan jackpot berdasarkan penerbitan rasmi terkini daripada penyedia berkaitan.'
  },
  disclaimerTitle: {
    en: 'Disclaimer',
    zh: '免责声明',
    ms: 'Penafian'
  },
  disclaimerText: {
    en: 'This is an independent informational guide and not official Da Ma Cai content. 4D AI does not sell tickets, accept bets, operate draws or process prize claims. Results are not guaranteed, historical information does not determine future outcomes, and official provider information takes precedence.',
    zh: '本页面是独立资讯指南，并非大马彩官方内容。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。页面不保证任何结果，历史资料不能决定未来结果，并且应以官方 Provider 资料为优先。',
    ms: 'Ini ialah panduan maklumat bebas dan bukan kandungan rasmi Da Ma Cai. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah. Keputusan tidak dijamin, maklumat sejarah tidak menentukan keputusan masa hadapan, dan maklumat rasmi penyedia perlu diutamakan.'
  },
  relatedGuidesTitle: {
    en: 'Related Provider Guides',
    zh: '相关 Provider 指南',
    ms: 'Panduan Penyedia Berkaitan'
  },
  relatedSlugs: ['magnum', 'sports-toto', 'singapore-pools', 'stc', 'sabah-88', 'sarawak']
};

const daMaCaiMeta = {
  title: {
    en: 'Da Ma Cai Game Guide | 4D AI',
    zh: '大马彩游戏指南 | 4D AI',
    ms: 'Panduan Permainan Da Ma Cai | 4D AI'
  },
  description: {
    en: 'Da Ma Cai game guide covering prize structure, game terminology and payout reference information. This is an independent informational reference and official provider information takes precedence.',
    zh: '大马彩游戏指南，整理派彩结构、游戏术语与派彩参考资料。本页面为独立资讯参考，并以官方 Provider 资料为优先。',
    ms: 'Panduan permainan Da Ma Cai yang merangkumi struktur hadiah, istilah permainan dan maklumat rujukan bayaran. Ini ialah rujukan maklumat bebas dan maklumat rasmi penyedia perlu diutamakan.'
  }
};

function withDaMaCaiGuide(page: ProviderPayoutPage): ProviderPayoutPage {
  if (page.slug !== 'da-ma-cai') return page;
  return {
    ...page,
    metaTitle: daMaCaiMeta.title,
    metaDescription: daMaCaiMeta.description,
    guide: daMaCaiGuide
  };
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => providerPayoutPages.map((page) => ({locale, provider: page.slug})));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; provider: string}>}): Promise<Metadata> {
  const {locale, provider} = await params;
  const rawPage = providerPayoutsBySlug.get(provider as ProviderPayoutSlug);
  if (!rawPage) return {};
  const page = withDaMaCaiGuide(rawPage);
  return buildMetadata({
    locale,
    path: `/providers/${page.slug}`,
    title: page.metaTitle[locale],
    description: page.metaDescription[locale]
  });
}

export default async function ProviderPayoutPage({params}: {params: Promise<{locale: Locale; provider: string}>}) {
  const {locale, provider} = await params;
  const rawPage = providerPayoutsBySlug.get(provider as ProviderPayoutSlug);
  if (!rawPage) notFound();
  const page = withDaMaCaiGuide(rawPage);

  return <ProviderPayoutContent locale={locale} page={page} />;
}
