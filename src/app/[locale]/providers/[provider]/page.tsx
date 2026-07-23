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

const sportsTotoGuide: ProviderGuideContent = {
  heroTitle: {
    en: 'Sports Toto Game Guide',
    zh: '多多博彩游戏指南',
    ms: 'Panduan Permainan Sports Toto'
  },
  heroIntro: {
    en: 'Review Sports Toto game categories, common terminology and prize structures in one independent information guide. This page is for general reference and is not an official Sports Toto publication.',
    zh: '本指南整理多多博彩相关游戏类别、常见术语与派彩结构，供用户作一般资讯和研究参考。本页面并非 Sports Toto 官方发布内容。',
    ms: 'Semak kategori permainan Sports Toto, istilah lazim dan struktur hadiah dalam satu panduan maklumat bebas. Halaman ini untuk rujukan umum dan bukan penerbitan rasmi Sports Toto.'
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
    en: 'About Sports Toto',
    zh: '关于多多博彩',
    ms: 'Mengenai Sports Toto'
  },
  aboutParagraphs: [
    {
      en: 'This page organises Sports Toto game categories, common terms and payout structures so users can compare the available information in a clearer format.',
      zh: '本页面整理多多博彩相关游戏类别、常见术语与派彩结构，让用户能以更清楚的方式比较现有资料。',
      ms: 'Halaman ini menyusun kategori permainan Sports Toto, istilah lazim dan struktur bayaran supaya pengguna boleh membandingkan maklumat yang tersedia dengan lebih jelas.'
    },
    {
      en: '4D AI is an independent information platform. It does not operate Sports Toto games, sell tickets, accept bets or process prize claims. The content is not betting advice and does not promise prizes or future results.',
      zh: '4D AI 是独立资讯平台，不经营 Sports Toto 游戏、不销售票券、不接受投注，也不处理兑奖。本页面内容不构成投注建议，也不承诺中奖或未来结果。',
      ms: '4D AI ialah platform maklumat bebas. Ia tidak mengendalikan permainan Sports Toto, tidak menjual tiket, tidak menerima pertaruhan dan tidak memproses tuntutan hadiah. Kandungan ini bukan nasihat pertaruhan dan tidak menjanjikan hadiah atau keputusan masa hadapan.'
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
    {label: {en: 'Provider', zh: 'Provider', ms: 'Penyedia'}, value: {en: 'Sports Toto', zh: '多多博彩', ms: 'Sports Toto'}},
    {label: {en: 'Guide coverage', zh: '指南涵盖', ms: 'Liputan panduan'}, value: {en: '4D, Permutation, Jackpot, 5D, 6D, 6/50, 6/55, 6/58', zh: '4D、全保、Jackpot、5D、6D、6/50、6/55、6/58', ms: '4D, Susunan, Jackpot, 5D, 6D, 6/50, 6/55, 6/58'}},
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
    {title: {en: '4D', zh: '4D', ms: '4D'}, description: {en: 'A four-digit game category with listed prize tiers and Big / Small payout coverage.', zh: '四位数字游戏类别，按资料列出的奖级与 Big / Small 派彩覆盖方式呈现。', ms: 'Kategori permainan empat digit dengan peringkat hadiah dan liputan bayaran Big / Small yang disenaraikan.'}},
    {title: {en: '4D Permutation', zh: '4D 全保', ms: '4D Susunan'}, description: {en: 'A permutation format where valid arrangements depend on the selected digits and repeated-number pattern.', zh: '全保排列形式，有效排列数量取决于所选数字及是否存在重复数字。', ms: 'Format susunan yang bergantung pada digit pilihan dan corak digit berulang.'}},
    {title: {en: '4D Jackpot', zh: '4D Jackpot', ms: '4D Jackpot'}, description: {en: 'A jackpot category that separates minimum jackpot references from fixed lower-group payout rows.', zh: 'Jackpot 类别，表格区分最低奖池参考与较低组别固定派彩。', ms: 'Kategori jackpot yang membezakan rujukan jackpot minimum daripada baris bayaran tetap kumpulan lain.'}},
    {title: {en: '5D', zh: '5D', ms: '5D'}, description: {en: 'A five-digit game category using listed prize tiers for selected number matches.', zh: '五位数字游戏类别，按资料列出的奖级与号码匹配条件整理。', ms: 'Kategori permainan lima digit menggunakan peringkat hadiah yang disenaraikan untuk padanan nombor pilihan.'}},
    {title: {en: '6D', zh: '6D', ms: '6D'}, description: {en: 'A six-digit game category with exact and partial digit-match prize references.', zh: '六位数字游戏类别，包含完整匹配及部分位数匹配的派彩参考。', ms: 'Kategori permainan enam digit dengan rujukan hadiah padanan tepat dan padanan separa digit.'}},
    {title: {en: 'Star Toto 6/50', zh: 'Star Toto 6/50', ms: 'Star Toto 6/50'}, description: {en: 'A lotto-style format using six selected numbers from a 1 to 50 number pool.', zh: 'Lotto 类游戏形式，从 1 至 50 的号码池选择六个号码。', ms: 'Format gaya lotto menggunakan enam nombor pilihan daripada kumpulan nombor 1 hingga 50.'}},
    {title: {en: 'Supreme Toto 6/55', zh: 'Supreme Toto 6/55', ms: 'Supreme Toto 6/55'}, description: {en: 'A lotto-style format using six selected numbers from a 1 to 55 number pool.', zh: 'Lotto 类游戏形式，从 1 至 55 的号码池选择六个号码。', ms: 'Format gaya lotto menggunakan enam nombor pilihan daripada kumpulan nombor 1 hingga 55.'}},
    {title: {en: 'Power Toto 6/58', zh: 'Power Toto 6/58', ms: 'Power Toto 6/58'}, description: {en: 'A lotto-style format using six selected numbers from a 1 to 58 number pool.', zh: 'Lotto 类游戏形式，从 1 至 58 的号码池选择六个号码。', ms: 'Format gaya lotto menggunakan enam nombor pilihan daripada kumpulan nombor 1 hingga 58.'}}
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
      en: '4D, 5D and 6D use different number formats and prize-tier structures.',
      zh: '4D、5D 和 6D 使用不同号码格式及奖级结构。',
      ms: '4D, 5D dan 6D menggunakan format nombor serta struktur peringkat hadiah yang berbeza.'
    },
    {
      en: 'Permutation refers to valid arrangements of selected digits. The applicable rules should be checked against the provider latest information.',
      zh: 'Permutation / 全保涉及所选号码的有效排列组合，具体规则应以 Provider 最新资料为准。',
      ms: 'Susunan merujuk kepada aturan sah bagi digit pilihan. Peraturan berkaitan perlu disemak berdasarkan maklumat terkini penyedia.'
    },
    {
      en: 'Jackpot games may involve prize pools, matching combinations and distribution rules. Minimum jackpot references are not stated as amounts every winner will receive.',
      zh: 'Jackpot 游戏可能涉及奖池、中奖组合及分配规则；最低奖池参考不代表每位得主可获得该金额。',
      ms: 'Permainan jackpot mungkin melibatkan kumpulan hadiah, kombinasi padanan dan peraturan agihan. Rujukan jackpot minimum tidak dinyatakan sebagai jumlah yang akan diterima oleh setiap pemenang.'
    },
    {
      en: 'Star Toto 6/50, Supreme Toto 6/55 and Power Toto 6/58 use different number pools and game structures.',
      zh: 'Star Toto 6/50、Supreme Toto 6/55 与 Power Toto 6/58 属于不同号码池与游戏结构。',
      ms: 'Star Toto 6/50, Supreme Toto 6/55 dan Power Toto 6/58 menggunakan kumpulan nombor serta struktur permainan yang berbeza.'
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
    {question: {en: 'What is this Sports Toto guide for?', zh: '本多多博彩指南用于什么？', ms: 'Untuk apakah panduan Sports Toto ini?'}, answer: {en: 'It organises Sports Toto game categories, terminology and payout structures for general information and research reference.', zh: '本指南整理多多博彩游戏类别、术语与派彩结构，用于一般资讯和研究参考。', ms: 'Ia menyusun kategori permainan Sports Toto, istilah dan struktur bayaran untuk maklumat umum serta rujukan kajian.'}},
    {question: {en: 'Does 4D AI sell Sports Toto tickets?', zh: '4D AI 是否销售 Sports Toto 票券？', ms: 'Adakah 4D AI menjual tiket Sports Toto?'}, answer: {en: 'No. 4D AI does not sell tickets, accept bets, operate draws or process prize claims.', zh: '不是。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。', ms: 'Tidak. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah.'}},
    {question: {en: 'Is 4D AI officially affiliated with Sports Toto?', zh: '4D AI 是否与 Sports Toto 有官方合作？', ms: 'Adakah 4D AI mempunyai hubungan rasmi dengan Sports Toto?'}, answer: {en: 'No official relationship is claimed on this page. The guide is independent informational content and is not an official Sports Toto publication.', zh: '本页面不声称任何官方关系。本指南属于独立资讯内容，并非 Sports Toto 官方发布内容。', ms: 'Tiada hubungan rasmi dituntut di halaman ini. Panduan ini ialah kandungan maklumat bebas dan bukan penerbitan rasmi Sports Toto.'}},
    {question: {en: 'What is the difference between 4D, 5D and 6D?', zh: '4D、5D 与 6D 有什么区别？', ms: 'Apakah perbezaan antara 4D, 5D dan 6D?'}, answer: {en: 'They use different number lengths and prize structures. The payout tables separate each game so users can compare the listed reference information.', zh: '它们使用不同号码长度与奖级结构。本页面将各游戏分开呈现，方便用户比较资料列出的参考信息。', ms: 'Permainan ini menggunakan panjang nombor dan struktur hadiah yang berbeza. Jadual bayaran memisahkan setiap permainan supaya pengguna boleh membandingkan maklumat rujukan yang disenaraikan.'}},
    {question: {en: 'What does permutation mean?', zh: 'Permutation / 全保是什么意思？', ms: 'Apakah maksud susunan?'}, answer: {en: 'Permutation refers to valid arrangements of selected digits. The number of arrangements can differ when digits repeat.', zh: 'Permutation / 全保指所选数字可组成的有效排列；如果数字重复，排列数量可能不同。', ms: 'Susunan merujuk kepada aturan sah bagi digit yang dipilih. Bilangan susunan boleh berbeza apabila digit berulang.'}},
    {question: {en: 'How are 6/50, 6/55 and 6/58 different?', zh: '6/50、6/55 与 6/58 有什么不同？', ms: 'Bagaimanakah 6/50, 6/55 dan 6/58 berbeza?'}, answer: {en: 'They use different number pools and prize structures. This guide keeps Star Toto 6/50, Supreme Toto 6/55 and Power Toto 6/58 in separate sections.', zh: '它们使用不同号码池与奖级结构。本指南将 Star Toto 6/50、Supreme Toto 6/55 与 Power Toto 6/58 分开呈现。', ms: 'Permainan ini menggunakan kumpulan nombor dan struktur hadiah yang berbeza. Panduan ini memisahkan Star Toto 6/50, Supreme Toto 6/55 dan Power Toto 6/58 dalam seksyen berasingan.'}},
    {question: {en: 'Are jackpot amounts guaranteed?', zh: 'Jackpot 金额是否固定承诺？', ms: 'Adakah jumlah jackpot dijanjikan?'}, answer: {en: 'No. Jackpot figures may be minimum pool or payout references and do not mean every winner receives the full amount shown.', zh: '不是。Jackpot 数字可能是最低奖池或派彩参考，并不代表每名得主获得页面显示的全部金额。', ms: 'Tidak. Angka jackpot mungkin rujukan kumpulan minimum atau bayaran dan tidak bermaksud setiap pemenang menerima keseluruhan jumlah yang dipaparkan.'}},
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
    en: 'This is an independent informational guide and not official Sports Toto content. 4D AI does not sell tickets, accept bets, operate draws or process prize claims. It does not promise results, historical information does not determine future outcomes, AI analysis is not an official prediction, and official provider information takes precedence.',
    zh: '本页面是独立资讯指南，并非 Sports Toto 官方内容。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。页面不承诺任何结果，历史资料不能决定未来结果，AI 分析并非官方预测，并且应以官方 Provider 资料为优先。',
    ms: 'Ini ialah panduan maklumat bebas dan bukan kandungan rasmi Sports Toto. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah. Ia tidak menjanjikan keputusan, maklumat sejarah tidak menentukan keputusan masa hadapan, analisis AI bukan ramalan rasmi, dan maklumat rasmi penyedia perlu diutamakan.'
  },
  relatedGuidesTitle: {
    en: 'Related Provider Guides',
    zh: '相关 Provider 指南',
    ms: 'Panduan Penyedia Berkaitan'
  },
  relatedSlugs: ['magnum', 'da-ma-cai', 'singapore-pools', 'stc', 'sabah-88', 'sarawak']
};

const sportsTotoMeta = {
  title: {
    en: 'Sports Toto Game Guide | 4D AI',
    zh: '多多博彩游戏指南 | 4D AI',
    ms: 'Panduan Permainan Sports Toto | 4D AI'
  },
  description: {
    en: 'Sports Toto game guide covering prize structure, terminology and 4D, 5D, 6D and jackpot games. This is an independent informational reference and official provider information takes precedence.',
    zh: '多多博彩游戏指南，整理派彩结构、游戏术语以及 4D、5D、6D 与 Jackpot 游戏资料。本页面为独立资讯参考，并以官方 Provider 资料为优先。',
    ms: 'Panduan permainan Sports Toto yang merangkumi struktur hadiah, istilah serta permainan 4D, 5D, 6D dan jackpot. Ini ialah rujukan maklumat bebas dan maklumat rasmi penyedia perlu diutamakan.'
  }
};

const singaporePoolsGuide: ProviderGuideContent = {
  heroTitle: {
    en: 'Singapore Pools Game Guide',
    zh: '新加坡博彩游戏指南',
    ms: 'Panduan Permainan Singapore Pools'
  },
  heroIntro: {
    en: 'Review Singapore Pools game categories, common terminology and prize structures in one independent information guide. This page is for general reference and is not an official Singapore Pools publication.',
    zh: '本指南整理 Singapore Pools 相关游戏类别、常见术语与派彩结构，供用户作一般资讯和研究参考。本页面并非 Singapore Pools 官方发布内容。',
    ms: 'Semak kategori permainan Singapore Pools, istilah lazim dan struktur hadiah dalam satu panduan maklumat bebas. Halaman ini untuk rujukan umum dan bukan penerbitan rasmi Singapore Pools.'
  },
  tags: [
    {en: 'Singapore', zh: '新加坡', ms: 'Singapura'},
    {en: 'Game Structure', zh: '游戏结构', ms: 'Struktur Permainan'},
    {en: 'Reference Only', zh: '仅供参考', ms: 'Untuk Rujukan Sahaja'}
  ],
  breadcrumb: {
    home: {en: 'Home', zh: '首页', ms: 'Laman Utama'},
    more: {en: 'More', zh: '更多', ms: 'Lagi'},
    providerGuides: {en: 'Provider Guides', zh: 'Provider 指南', ms: 'Panduan Penyedia'}
  },
  aboutTitle: {
    en: 'About Singapore Pools',
    zh: '关于新加坡博彩',
    ms: 'Mengenai Singapore Pools'
  },
  aboutParagraphs: [
    {
      en: 'This page organises Singapore Pools game categories, common terms and payout structures so users can compare the available information in a clearer format.',
      zh: '本页面整理 Singapore Pools 相关游戏类别、常见术语与派彩结构，让用户能以更清楚的方式比较现有资料。',
      ms: 'Halaman ini menyusun kategori permainan Singapore Pools, istilah lazim dan struktur bayaran supaya pengguna boleh membandingkan maklumat yang tersedia dengan lebih jelas.'
    },
    {
      en: '4D AI is an independent information platform. It does not operate Singapore Pools games, sell tickets, accept bets or process prize claims. The content is not betting advice and does not promise prizes or future results.',
      zh: '4D AI 是独立资讯平台，不经营 Singapore Pools 游戏、不销售票券、不接受投注，也不处理兑奖。本页面内容不构成投注建议，也不承诺中奖或未来结果。',
      ms: '4D AI ialah platform maklumat bebas. Ia tidak mengendalikan permainan Singapore Pools, tidak menjual tiket, tidak menerima pertaruhan dan tidak memproses tuntutan hadiah. Kandungan ini bukan nasihat pertaruhan dan tidak menjanjikan hadiah atau keputusan masa hadapan.'
    },
    {
      en: 'Game rules, payout amounts, prize tiers and jackpot arrangements may change. Users should verify official rules and payout information with the provider latest official publication before relying on any figure.',
      zh: '游戏规则、派彩金额、奖级及奖池安排可能调整。用户在依赖任何数字前，应以相关 Provider 最新官方公布的规则与派彩资料为准。',
      ms: 'Peraturan permainan, jumlah bayaran, peringkat hadiah dan aturan jackpot boleh berubah. Pengguna perlu menyemak peraturan rasmi dan maklumat bayaran melalui penerbitan rasmi terkini penyedia sebelum bergantung pada mana-mana angka.'
    }
  ],
  summaryTitle: {
    en: 'Provider Summary',
    zh: 'Provider 摘要',
    ms: 'Ringkasan Penyedia'
  },
  summary: [
    {label: {en: 'Provider', zh: 'Provider', ms: 'Penyedia'}, value: {en: 'Singapore Pools', zh: '新加坡博彩', ms: 'Singapore Pools'}},
    {label: {en: 'Guide coverage', zh: '指南涵盖', ms: 'Liputan panduan'}, value: {en: '4D, 4D iBet, Toto 6/49', zh: '4D、4D iBet、Toto 6/49', ms: '4D, 4D iBet, Toto 6/49'}},
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
    {title: {en: '4D', zh: '4D', ms: '4D'}, description: {en: 'A four-digit game category with listed prize tiers and Big / Small payout coverage.', zh: '四位数字游戏类别，按资料列出的奖级与 Big / Small 派彩覆盖方式呈现。', ms: 'Kategori permainan empat digit dengan peringkat hadiah dan liputan bayaran Big / Small yang disenaraikan.'}},
    {title: {en: '4D iBet', zh: '4D iBet', ms: '4D iBet'}, description: {en: 'An iBet format where payout references vary by the listed arrangement category.', zh: 'iBet 形式，派彩参考按资料列出的不同排列类别区分。', ms: 'Format iBet dengan rujukan bayaran yang berbeza mengikut kategori susunan yang disenaraikan.'}},
    {title: {en: 'Toto 6/49', zh: 'Toto 6/49', ms: 'Toto 6/49'}, description: {en: 'A lotto-style format using six selected numbers from a 1 to 49 number pool.', zh: 'Lotto 类游戏形式，从 1 至 49 的号码池选择六个号码。', ms: 'Format gaya lotto menggunakan enam nombor pilihan daripada kumpulan nombor 1 hingga 49.'}}
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
      en: '4D uses a four-digit number format and its own listed prize-tier structure.',
      zh: '4D 使用四位号码格式及其对应的资料列出奖级结构。',
      ms: '4D menggunakan format nombor empat digit dan struktur peringkat hadiah yang disenaraikan.'
    },
    {
      en: '4D iBet involves different arrangement categories. The applicable rules should be checked against the provider latest information.',
      zh: '4D iBet 涉及不同组合或排列类别，具体规则应以 Provider 最新资料为准。',
      ms: '4D iBet melibatkan kategori susunan yang berbeza. Peraturan berkaitan perlu disemak berdasarkan maklumat terkini penyedia.'
    },
    {
      en: 'Toto 6/49 uses a number pool and prize structure that differs from 4D games.',
      zh: 'Toto 6/49 使用不同于 4D 的号码池和奖级结构。',
      ms: 'Toto 6/49 menggunakan kumpulan nombor dan struktur hadiah yang berbeza daripada permainan 4D.'
    },
    {
      en: 'Different games may use different prize tiers, rules and payout methods, and pool or distribution arrangements may change.',
      zh: '不同游戏的奖级、规则和派彩方式并不相同，奖池和分配安排也可能变化。',
      ms: 'Permainan berbeza mungkin menggunakan peringkat hadiah, peraturan dan kaedah bayaran yang berbeza, manakala aturan kumpulan hadiah atau agihan boleh berubah.'
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
    {question: {en: 'What is this Singapore Pools guide for?', zh: '本新加坡博彩指南用于什么？', ms: 'Untuk apakah panduan Singapore Pools ini?'}, answer: {en: 'It organises Singapore Pools game categories, terminology and payout structures for general information and research reference.', zh: '本指南整理 Singapore Pools 游戏类别、术语与派彩结构，用于一般资讯和研究参考。', ms: 'Ia menyusun kategori permainan Singapore Pools, istilah dan struktur bayaran untuk maklumat umum serta rujukan kajian.'}},
    {question: {en: 'Does 4D AI sell Singapore Pools tickets?', zh: '4D AI 是否销售 Singapore Pools 票券？', ms: 'Adakah 4D AI menjual tiket Singapore Pools?'}, answer: {en: 'No. 4D AI does not sell tickets, accept bets, operate draws or process prize claims.', zh: '不是。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。', ms: 'Tidak. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah.'}},
    {question: {en: 'Is 4D AI officially affiliated with Singapore Pools?', zh: '4D AI 是否与 Singapore Pools 有官方合作？', ms: 'Adakah 4D AI mempunyai hubungan rasmi dengan Singapore Pools?'}, answer: {en: 'No official relationship is claimed on this page. The guide is independent informational content and is not an official Singapore Pools publication.', zh: '本页面不声称任何官方关系。本指南属于独立资讯内容，并非 Singapore Pools 官方发布内容。', ms: 'Tiada hubungan rasmi dituntut di halaman ini. Panduan ini ialah kandungan maklumat bebas dan bukan penerbitan rasmi Singapore Pools.'}},
    {question: {en: 'What is the difference between 4D and Toto 6/49?', zh: '4D 与 Toto 6/49 有什么区别？', ms: 'Apakah perbezaan antara 4D dan Toto 6/49?'}, answer: {en: '4D uses a four-digit number format, while Toto 6/49 uses six selected numbers from a 1 to 49 number pool. Their prize structures are listed separately.', zh: '4D 使用四位号码格式；Toto 6/49 从 1 至 49 的号码池选择六个号码。两者的奖级结构分开呈现。', ms: '4D menggunakan format nombor empat digit, manakala Toto 6/49 menggunakan enam nombor pilihan daripada kumpulan nombor 1 hingga 49. Struktur hadiah kedua-duanya disenaraikan secara berasingan.'}},
    {question: {en: 'What is 4D iBet?', zh: '4D iBet 是什么？', ms: 'Apakah 4D iBet?'}, answer: {en: '4D iBet is shown as a separate 4D arrangement format where payout references vary by arrangement category. Users should verify current rules with the provider latest information.', zh: '4D iBet 在本页作为独立的 4D 排列形式呈现，派彩参考按排列类别区分。用户应以 Provider 最新资料核对现行规则。', ms: '4D iBet dipaparkan sebagai format susunan 4D berasingan dengan rujukan bayaran yang berbeza mengikut kategori susunan. Pengguna perlu menyemak peraturan semasa melalui maklumat terkini penyedia.'}},
    {question: {en: 'Are payout or jackpot amounts guaranteed?', zh: '派彩或 Jackpot 金额是否固定承诺？', ms: 'Adakah jumlah bayaran atau jackpot dijanjikan?'}, answer: {en: 'No. Figures may be payout, pool or percentage references and do not mean every winner receives a specific full amount shown.', zh: '不是。页面数字可能是派彩、奖池或比例参考，并不代表每名得主获得某个页面显示的完整金额。', ms: 'Tidak. Angka mungkin rujukan bayaran, kumpulan hadiah atau peratusan dan tidak bermaksud setiap pemenang menerima jumlah penuh tertentu yang dipaparkan.'}},
    {question: {en: 'Does historical data predict future results?', zh: '历史数据是否能预测未来结果？', ms: 'Adakah data sejarah meramalkan keputusan masa hadapan?'}, answer: {en: 'No. Historical information can be used for reference, but it does not determine future outcomes and AI analysis is not an official prediction.', zh: '不能。历史资料可用于参考，但不能决定未来结果，AI 分析也不是官方预测。', ms: 'Tidak. Maklumat sejarah boleh digunakan sebagai rujukan, tetapi ia tidak menentukan keputusan masa hadapan dan analisis AI bukan ramalan rasmi.'}},
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
    en: 'This is an independent informational guide and not official Singapore Pools content. 4D AI does not sell tickets, accept bets, operate draws or process prize claims. It does not promise results, historical information does not determine future outcomes, AI analysis is not an official prediction, and official provider information takes precedence.',
    zh: '本页面是独立资讯指南，并非 Singapore Pools 官方内容。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。页面不承诺任何结果，历史资料不能决定未来结果，AI 分析并非官方预测，并且应以官方 Provider 资料为优先。',
    ms: 'Ini ialah panduan maklumat bebas dan bukan kandungan rasmi Singapore Pools. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah. Ia tidak menjanjikan keputusan, maklumat sejarah tidak menentukan keputusan masa hadapan, analisis AI bukan ramalan rasmi, dan maklumat rasmi penyedia perlu diutamakan.'
  },
  relatedGuidesTitle: {
    en: 'Related Provider Guides',
    zh: '相关 Provider 指南',
    ms: 'Panduan Penyedia Berkaitan'
  },
  relatedSlugs: ['magnum', 'da-ma-cai', 'sports-toto', 'stc', 'sabah-88', 'sarawak']
};

const singaporePoolsMeta = {
  title: {
    en: 'Singapore Pools Game Guide | 4D AI',
    zh: '新加坡博彩游戏指南 | 4D AI',
    ms: 'Panduan Permainan Singapore Pools | 4D AI'
  },
  description: {
    en: 'Singapore Pools game guide covering prize structure, terminology, 4D, 4D iBet and Toto 6/49. This is an independent informational reference and official provider information takes precedence.',
    zh: '新加坡博彩游戏指南，整理派彩结构、游戏术语、4D、4D iBet 与 Toto 6/49 资料。本页面为独立资讯参考，并以官方 Provider 资料为优先。',
    ms: 'Panduan permainan Singapore Pools yang merangkumi struktur hadiah, istilah, 4D, 4D iBet dan Toto 6/49. Ini ialah rujukan maklumat bebas dan maklumat rasmi penyedia perlu diutamakan.'
  }
};

const stcGuide: ProviderGuideContent = {
  heroTitle: {
    en: 'Sandakan Turf Club Game Guide',
    zh: '山打根赛马会游戏指南',
    ms: 'Panduan Permainan Sandakan Turf Club'
  },
  heroIntro: {
    en: 'Review Sandakan Turf Club (STC) 4D game categories, common terminology and prize structures in one independent information guide. This page is for general reference and is not an official Sandakan Turf Club publication.',
    zh: '本指南整理山打根赛马会（STC）现有 4D 游戏类别、常见术语与派彩结构，供用户作一般资讯和研究参考。本页面并非 STC 官方发布内容。',
    ms: 'Semak kategori permainan 4D Sandakan Turf Club (STC), istilah lazim dan struktur hadiah dalam satu panduan maklumat bebas. Halaman ini untuk rujukan umum dan bukan penerbitan rasmi Sandakan Turf Club.'
  },
  tags: [
    {en: 'STC', zh: 'STC', ms: 'STC'},
    {en: '4D Structure', zh: '4D 结构', ms: 'Struktur 4D'},
    {en: 'Reference Only', zh: '仅供参考', ms: 'Untuk Rujukan Sahaja'}
  ],
  breadcrumb: {
    home: {en: 'Home', zh: '首页', ms: 'Laman Utama'},
    more: {en: 'More', zh: '更多', ms: 'Lagi'},
    providerGuides: {en: 'Provider Guides', zh: 'Provider 指南', ms: 'Panduan Penyedia'}
  },
  aboutTitle: {
    en: 'About Sandakan Turf Club',
    zh: '关于山打根赛马会',
    ms: 'Mengenai Sandakan Turf Club'
  },
  aboutParagraphs: [
    {
      en: 'This page organises the STC 4D game categories, common terms and payout structures currently available in the typed provider data.',
      zh: '本页面整理 typed Provider data 中目前已有的 STC 4D 游戏类别、常见术语与派彩结构。',
      ms: 'Halaman ini menyusun kategori permainan 4D STC, istilah lazim dan struktur bayaran yang tersedia dalam data penyedia bertip.'
    },
    {
      en: '4D AI is an independent information platform. It does not operate STC games, sell tickets, accept bets or process prize claims. The content is not betting advice and does not promise prizes or future results.',
      zh: '4D AI 是独立资讯平台，不经营 STC 游戏、不销售票券、不接受投注，也不处理兑奖。本页面内容不构成投注建议，也不承诺中奖或未来结果。',
      ms: '4D AI ialah platform maklumat bebas. Ia tidak mengendalikan permainan STC, tidak menjual tiket, tidak menerima pertaruhan dan tidak memproses tuntutan hadiah. Kandungan ini bukan nasihat pertaruhan dan tidak menjanjikan hadiah atau keputusan masa hadapan.'
    },
    {
      en: 'Game rules and payout amounts may change. Users should verify official rules and payout information with the provider latest official publication before relying on any figure.',
      zh: '游戏规则与派彩金额可能调整。用户在依赖任何数字前，应以相关 Provider 最新官方公布的规则与派彩资料为准。',
      ms: 'Peraturan permainan dan jumlah bayaran boleh berubah. Pengguna perlu menyemak peraturan rasmi dan maklumat bayaran melalui penerbitan rasmi terkini penyedia sebelum bergantung pada mana-mana angka.'
    }
  ],
  summaryTitle: {
    en: 'Provider Summary',
    zh: 'Provider 摘要',
    ms: 'Ringkasan Penyedia'
  },
  summary: [
    {label: {en: 'Provider', zh: 'Provider', ms: 'Penyedia'}, value: {en: 'Sandakan Turf Club (STC)', zh: '山打根赛马会（STC）', ms: 'Sandakan Turf Club (STC)'}},
    {label: {en: 'Guide coverage', zh: '指南涵盖', ms: 'Liputan panduan'}, value: {en: '4D, 4D Permutation', zh: '4D、4D 全保', ms: '4D, 4D Susunan'}},
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
    {title: {en: '4D', zh: '4D', ms: '4D'}, description: {en: 'A four-digit game category with listed prize tiers and Big / Small payout coverage.', zh: '四位数字游戏类别，按资料列出的奖级与 Big / Small 派彩覆盖方式呈现。', ms: 'Kategori permainan empat digit dengan peringkat hadiah dan liputan bayaran Big / Small yang disenaraikan.'}},
    {title: {en: '4D Permutation', zh: '4D 全保', ms: '4D Susunan'}, description: {en: 'A permutation format where valid arrangements depend on the selected digits and repeated-number pattern.', zh: '全保排列形式，有效排列数量取决于所选数字及是否存在重复数字。', ms: 'Format susunan yang bergantung pada digit pilihan dan corak digit berulang.'}}
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
      en: '4D uses a four-digit number format and its own listed prize-tier structure.',
      zh: '4D 使用四位号码格式及其对应的资料列出奖级结构。',
      ms: '4D menggunakan format nombor empat digit dan struktur peringkat hadiah yang disenaraikan.'
    },
    {
      en: '4D Permutation refers to different valid arrangements of selected digits.',
      zh: '4D Permutation / 全保指所选数字可形成的不同有效排列结构。',
      ms: '4D Susunan merujuk kepada aturan sah yang berbeza bagi digit pilihan.'
    },
    {
      en: 'When selected digits repeat, the number of valid arrangements may differ from entries where all four digits are different.',
      zh: '当所选数字有重复时，有效排列数量可能不同于四个数字都不同的情况。',
      ms: 'Apabila digit pilihan berulang, bilangan susunan sah mungkin berbeza daripada entri yang mempunyai empat digit berlainan.'
    },
    {
      en: 'The applicable combinations, prize tiers and payout rules should be checked against the provider latest official information.',
      zh: '具体组合、奖级与派彩规则应以 Provider 最新官方资料为准。',
      ms: 'Kombinasi, peringkat hadiah dan peraturan bayaran berkaitan perlu disemak berdasarkan maklumat rasmi terkini penyedia.'
    },
    {
      en: 'The payout tables are an informational organisation of available reference data. Official results, rules and payout amounts should be checked against the provider latest official publication.',
      zh: '派彩表只是对可用参考资料的一般资讯整理。正式结果、规则和派彩金额应以 Provider 最新官方公布为准。',
      ms: 'Jadual bayaran ialah susunan maklumat rujukan yang tersedia. Keputusan rasmi, peraturan dan jumlah bayaran perlu disemak berdasarkan penerbitan rasmi terkini penyedia.'
    }
  ],
  faqTitle: {
    en: 'Frequently Asked Questions',
    zh: '常见问题',
    ms: 'Soalan Lazim'
  },
  faqs: [
    {question: {en: 'What is this STC guide for?', zh: '本 STC 指南用于什么？', ms: 'Untuk apakah panduan STC ini?'}, answer: {en: 'It organises STC 4D game categories, terminology and payout structures for general information and research reference.', zh: '本指南整理 STC 4D 游戏类别、术语与派彩结构，用于一般资讯和研究参考。', ms: 'Ia menyusun kategori permainan 4D STC, istilah dan struktur bayaran untuk maklumat umum serta rujukan kajian.'}},
    {question: {en: 'Does 4D AI sell STC tickets?', zh: '4D AI 是否销售 STC 票券？', ms: 'Adakah 4D AI menjual tiket STC?'}, answer: {en: 'No. 4D AI does not sell tickets, accept bets, operate draws or process prize claims.', zh: '不是。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。', ms: 'Tidak. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah.'}},
    {question: {en: 'Is 4D AI officially affiliated with Sandakan Turf Club?', zh: '4D AI 是否与山打根赛马会有官方合作？', ms: 'Adakah 4D AI mempunyai hubungan rasmi dengan Sandakan Turf Club?'}, answer: {en: 'No official relationship is claimed on this page. The guide is independent informational content and is not an official Sandakan Turf Club publication.', zh: '本页面不声称任何官方关系。本指南属于独立资讯内容，并非山打根赛马会官方发布内容。', ms: 'Tiada hubungan rasmi dituntut di halaman ini. Panduan ini ialah kandungan maklumat bebas dan bukan penerbitan rasmi Sandakan Turf Club.'}},
    {question: {en: 'What is STC 4D?', zh: 'STC 4D 是什么？', ms: 'Apakah STC 4D?'}, answer: {en: 'STC 4D is presented here as a four-digit game category with payout references organised by the typed provider data.', zh: '本页面将 STC 4D 作为四位数字游戏类别呈现，并按 typed Provider data 整理派彩参考。', ms: 'STC 4D dipaparkan di sini sebagai kategori permainan empat digit dengan rujukan bayaran yang disusun berdasarkan data penyedia bertip.'}},
    {question: {en: 'What does 4D Permutation mean?', zh: '4D Permutation / 全保是什么意思？', ms: 'Apakah maksud 4D Susunan?'}, answer: {en: 'It refers to different valid arrangements of selected digits. Repeated digits can change the number of arrangements, and current rules should be verified with the provider latest official information.', zh: '它指所选数字可形成的不同有效排列。数字重复时排列数量可能改变，现行规则应以 Provider 最新官方资料核对。', ms: 'Ia merujuk kepada aturan sah yang berbeza bagi digit pilihan. Digit berulang boleh mengubah bilangan susunan, dan peraturan semasa perlu disemak melalui maklumat rasmi terkini penyedia.'}},
    {question: {en: 'Does permutation guarantee more winning chances?', zh: 'Permutation / 全保是否承诺更容易中奖？', ms: 'Adakah susunan menjanjikan peluang menang yang lebih tinggi?'}, answer: {en: 'No. Permutation is a number-arrangement structure. It does not promise prizes, does not make future results predictable and does not replace official rules or payout information.', zh: '不是。Permutation / 全保只是号码排列结构，不承诺中奖，不代表未来结果可预测，也不能取代官方规则或派彩资料。', ms: 'Tidak. Susunan ialah struktur aturan nombor. Ia tidak menjanjikan hadiah, tidak menjadikan keputusan masa hadapan boleh diramal dan tidak menggantikan peraturan atau maklumat bayaran rasmi.'}},
    {question: {en: 'Where should users verify official rules and payouts?', zh: '用户应在哪里核对官方规则和派彩？', ms: 'Di manakah pengguna perlu menyemak peraturan dan bayaran rasmi?'}, answer: {en: 'Users should verify game rules and payout amounts with the provider latest official publication.', zh: '用户应以相关 Provider 最新官方公布核对游戏规则和派彩金额。', ms: 'Pengguna perlu menyemak peraturan permainan dan jumlah bayaran melalui penerbitan rasmi terkini penyedia.'}}
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
    en: 'This is an independent informational guide and not official Sandakan Turf Club content. 4D AI does not sell tickets, accept bets, operate draws or process prize claims. It does not promise results, historical information does not determine future outcomes, AI analysis is not an official prediction, and official provider information takes precedence.',
    zh: '本页面是独立资讯指南，并非山打根赛马会官方内容。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。页面不承诺任何结果，历史资料不能决定未来结果，AI 分析并非官方预测，并且应以官方 Provider 资料为优先。',
    ms: 'Ini ialah panduan maklumat bebas dan bukan kandungan rasmi Sandakan Turf Club. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah. Ia tidak menjanjikan keputusan, maklumat sejarah tidak menentukan keputusan masa hadapan, analisis AI bukan ramalan rasmi, dan maklumat rasmi penyedia perlu diutamakan.'
  },
  relatedGuidesTitle: {
    en: 'Related Provider Guides',
    zh: '相关 Provider 指南',
    ms: 'Panduan Penyedia Berkaitan'
  },
  relatedSlugs: ['magnum', 'da-ma-cai', 'sports-toto', 'singapore-pools', 'sabah-88', 'sarawak']
};

const stcMeta = {
  title: {
    en: 'Sandakan Turf Club Game Guide | 4D AI',
    zh: '山打根赛马会游戏指南 | 4D AI',
    ms: 'Panduan Permainan Sandakan Turf Club | 4D AI'
  },
  description: {
    en: 'Sandakan Turf Club STC game guide covering 4D, 4D Permutation, prize structure and terminology. This is an independent informational reference and official provider information takes precedence.',
    zh: '山打根赛马会 STC 游戏指南，整理 4D、4D 全保、派彩结构与游戏术语。本页面为独立资讯参考，并以官方 Provider 资料为优先。',
    ms: 'Panduan permainan Sandakan Turf Club STC yang merangkumi 4D, 4D Susunan, struktur hadiah dan istilah. Ini ialah rujukan maklumat bebas dan maklumat rasmi penyedia perlu diutamakan.'
  }
};

const sabah88Guide: ProviderGuideContent = {
  heroTitle: {
    en: 'Sabah 88 Game Guide',
    zh: 'Sabah 88 游戏指南',
    ms: 'Panduan Permainan Sabah 88'
  },
  heroIntro: {
    en: 'Review Sabah 88 game categories, common terminology and prize structures for 3D, 4D, 4D Permutation and Lotto 6/45 in one independent information guide. This page is for general reference and is not an official Sabah 88 publication.',
    zh: '本指南整理 Sabah 88 现有 3D、4D、4D 全保与 Lotto 6/45 游戏类别、常见术语与派彩结构，供用户作一般资讯和研究参考。本页面并非 Sabah 88 官方发布内容。',
    ms: 'Semak kategori permainan Sabah 88, istilah lazim dan struktur hadiah untuk 3D, 4D, 4D Susunan dan Lotto 6/45 dalam satu panduan maklumat bebas. Halaman ini untuk rujukan umum dan bukan penerbitan rasmi Sabah 88.'
  },
  tags: [
    {en: 'Sabah 88', zh: 'Sabah 88', ms: 'Sabah 88'},
    {en: '3D, 4D and Lotto', zh: '3D、4D 与 Lotto', ms: '3D, 4D dan Lotto'},
    {en: 'Reference Only', zh: '仅供参考', ms: 'Untuk Rujukan Sahaja'}
  ],
  breadcrumb: {
    home: {en: 'Home', zh: '首页', ms: 'Laman Utama'},
    more: {en: 'More', zh: '更多', ms: 'Lagi'},
    providerGuides: {en: 'Provider Guides', zh: 'Provider 指南', ms: 'Panduan Penyedia'}
  },
  aboutTitle: {
    en: 'About Sabah 88',
    zh: '关于 Sabah 88',
    ms: 'Mengenai Sabah 88'
  },
  aboutParagraphs: [
    {
      en: 'This page organises the Sabah 88 game categories, common terms and payout structures currently available in the typed provider data.',
      zh: '本页面整理 typed Provider data 中目前已有的 Sabah 88 游戏类别、常见术语与派彩结构。',
      ms: 'Halaman ini menyusun kategori permainan Sabah 88, istilah lazim dan struktur bayaran yang tersedia dalam data penyedia bertip.'
    },
    {
      en: '4D AI is an independent information platform. It does not operate Sabah 88 games, sell tickets, accept bets or process prize claims. The content is not betting advice and does not promise prizes or future results.',
      zh: '4D AI 是独立资讯平台，不经营 Sabah 88 游戏、不销售票券、不接受投注，也不处理兑奖。本页面内容不构成投注建议，也不承诺中奖或未来结果。',
      ms: '4D AI ialah platform maklumat bebas. Ia tidak mengendalikan permainan Sabah 88, tidak menjual tiket, tidak menerima pertaruhan dan tidak memproses tuntutan hadiah. Kandungan ini bukan nasihat pertaruhan dan tidak menjanjikan hadiah atau keputusan masa hadapan.'
    },
    {
      en: 'Official rules, payout amounts, prize tiers and Lotto jackpot arrangements may change. Users should verify the latest official provider publication before relying on any figure.',
      zh: '正式规则、派彩金额、奖级及 Lotto 奖池安排可能调整。用户在依赖任何数字前，应以相关 Provider 最新官方公布为准。',
      ms: 'Peraturan rasmi, jumlah bayaran, peringkat hadiah dan aturan jackpot Lotto boleh berubah. Pengguna perlu menyemak penerbitan rasmi terkini penyedia sebelum bergantung pada mana-mana angka.'
    }
  ],
  summaryTitle: {
    en: 'Provider Summary',
    zh: 'Provider 摘要',
    ms: 'Ringkasan Penyedia'
  },
  summary: [
    {label: {en: 'Provider', zh: 'Provider', ms: 'Penyedia'}, value: {en: 'Sabah 88', zh: 'Sabah 88', ms: 'Sabah 88'}},
    {label: {en: 'Guide coverage', zh: '指南涵盖', ms: 'Liputan panduan'}, value: {en: '3D, 4D, 4D Permutation, Lotto 6/45', zh: '3D、4D、4D 全保、Lotto 6/45', ms: '3D, 4D, 4D Susunan, Lotto 6/45'}},
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
    {title: {en: '4D', zh: '4D', ms: '4D'}, description: {en: 'A four-digit game category with listed prize tiers and Big / Small payout coverage.', zh: '四位数字游戏类别，按资料列出的奖级与 Big / Small 派彩覆盖方式呈现。', ms: 'Kategori permainan empat digit dengan peringkat hadiah dan liputan bayaran Big / Small yang disenaraikan.'}},
    {title: {en: '4D Permutation', zh: '4D 全保', ms: '4D Susunan'}, description: {en: 'A permutation format where valid arrangements depend on the selected digits and repeated-number pattern.', zh: '全保排列形式，有效排列数量取决于所选数字及是否存在重复数字。', ms: 'Format susunan yang bergantung pada digit pilihan dan corak digit berulang.'}},
    {title: {en: 'Lotto 6/45', zh: 'Lotto 6/45', ms: 'Lotto 6/45'}, description: {en: 'A lotto-style category with a separate number pool, prize groups and jackpot references.', zh: 'Lotto 类游戏，使用不同号码池、奖级结构与 Jackpot 参考资料。', ms: 'Kategori gaya lotto dengan kolam nombor, kumpulan hadiah dan rujukan jackpot yang berasingan.'}}
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
      en: '3D and 4D use different number lengths and prize-tier structures.',
      zh: '3D 与 4D 使用不同号码长度及奖级结构。',
      ms: '3D dan 4D menggunakan panjang nombor dan struktur peringkat hadiah yang berbeza.'
    },
    {
      en: '4D Permutation refers to different valid arrangements of selected digits, and repeated digits can change the number of valid arrangements.',
      zh: '4D Permutation / 全保指所选数字可形成的不同有效排列；当数字重复时，有效排列数量可能改变。',
      ms: '4D Susunan merujuk kepada aturan sah yang berbeza bagi digit pilihan, dan digit berulang boleh mengubah bilangan susunan sah.'
    },
    {
      en: 'Lotto 6/45 uses a number pool and prize-group structure that is different from 3D and 4D games.',
      zh: 'Lotto 6/45 使用不同于 3D 与 4D 的号码池和奖级结构。',
      ms: 'Lotto 6/45 menggunakan kolam nombor dan struktur kumpulan hadiah yang berbeza daripada permainan 3D dan 4D.'
    },
    {
      en: 'Lotto jackpot pools and distribution arrangements may change according to the provider latest rules, and jackpot references are not guaranteed amounts for every winner.',
      zh: 'Lotto 奖池和分配安排可能依 Provider 最新规则调整；Jackpot 参考金额并不代表每名得主保证获得该金额。',
      ms: 'Kumpulan jackpot Lotto dan aturan agihan boleh berubah mengikut peraturan terkini penyedia, dan rujukan jackpot bukan jumlah terjamin untuk setiap pemenang.'
    },
    {
      en: 'The payout tables are an informational organisation of available reference data. Official results, rules, payout amounts and jackpot arrangements should be checked against the provider latest official publication.',
      zh: '派彩表只是对可用参考资料的一般资讯整理。正式结果、规则、派彩金额及奖池安排应以 Provider 最新官方公布为准。',
      ms: 'Jadual bayaran ialah susunan maklumat rujukan yang tersedia. Keputusan rasmi, peraturan, jumlah bayaran dan aturan jackpot perlu disemak berdasarkan penerbitan rasmi terkini penyedia.'
    }
  ],
  faqTitle: {
    en: 'Frequently Asked Questions',
    zh: '常见问题',
    ms: 'Soalan Lazim'
  },
  faqs: [
    {question: {en: 'What is this Sabah 88 guide for?', zh: '本 Sabah 88 指南用于什么？', ms: 'Untuk apakah panduan Sabah 88 ini?'}, answer: {en: 'It organises Sabah 88 game categories, terminology and payout structures for general information and research reference.', zh: '本指南整理 Sabah 88 游戏类别、术语与派彩结构，用于一般资讯和研究参考。', ms: 'Ia menyusun kategori permainan Sabah 88, istilah dan struktur bayaran untuk maklumat umum serta rujukan kajian.'}},
    {question: {en: 'Does 4D AI sell Sabah 88 tickets?', zh: '4D AI 是否销售 Sabah 88 票券？', ms: 'Adakah 4D AI menjual tiket Sabah 88?'}, answer: {en: 'No. 4D AI does not sell tickets, accept bets, operate draws or process prize claims.', zh: '不是。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。', ms: 'Tidak. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah.'}},
    {question: {en: 'Is 4D AI officially affiliated with Sabah 88?', zh: '4D AI 是否与 Sabah 88 有官方合作？', ms: 'Adakah 4D AI mempunyai hubungan rasmi dengan Sabah 88?'}, answer: {en: 'No official relationship is claimed on this page. The guide is independent informational content and is not an official Sabah 88 publication.', zh: '本页面不声称任何官方关系。本指南属于独立资讯内容，并非 Sabah 88 官方发布内容。', ms: 'Tiada hubungan rasmi dituntut di halaman ini. Panduan ini ialah kandungan maklumat bebas dan bukan penerbitan rasmi Sabah 88.'}},
    {question: {en: 'What is the difference between 3D and 4D?', zh: '3D 与 4D 有什么区别？', ms: 'Apakah perbezaan antara 3D dan 4D?'}, answer: {en: '3D uses a three-digit number format, while 4D uses a four-digit number format and has a different prize-tier structure.', zh: '3D 使用三位号码格式；4D 使用四位号码格式，并采用不同奖级结构。', ms: '3D menggunakan format nombor tiga digit, manakala 4D menggunakan format nombor empat digit dan mempunyai struktur peringkat hadiah yang berbeza.'}},
    {question: {en: 'What does 4D Permutation mean?', zh: '4D Permutation / 全保是什么意思？', ms: 'Apakah maksud 4D Susunan?'}, answer: {en: 'It refers to different valid arrangements of selected digits. Permutation does not promise prizes, does not make future results predictable and does not replace official rules or payout information.', zh: '它指所选数字可形成的不同有效排列。Permutation / 全保不承诺中奖，不代表未来结果可预测，也不能取代官方规则或派彩资料。', ms: 'Ia merujuk kepada aturan sah yang berbeza bagi digit pilihan. Susunan tidak menjanjikan hadiah, tidak menjadikan keputusan masa hadapan boleh diramal dan tidak menggantikan peraturan atau maklumat bayaran rasmi.'}},
    {question: {en: 'What is Lotto 6/45?', zh: 'Lotto 6/45 是什么？', ms: 'Apakah Lotto 6/45?'}, answer: {en: 'Lotto 6/45 is presented here as a lotto-style game category using six selected numbers from a 1 to 45 number pool and listed prize groups.', zh: '本页面将 Lotto 6/45 作为 Lotto 类游戏呈现，使用 1 至 45 的号码池选择六个号码，并按资料列出的奖级整理。', ms: 'Lotto 6/45 dipaparkan di sini sebagai kategori permainan gaya lotto yang menggunakan enam nombor pilihan daripada kolam nombor 1 hingga 45 dan kumpulan hadiah yang disenaraikan.'}},
    {question: {en: 'Are Lotto prize pools guaranteed?', zh: 'Lotto 奖池金额是否保证？', ms: 'Adakah kumpulan hadiah Lotto dijamin?'}, answer: {en: 'No. Lotto prize pools and jackpot references may change, and a pool reference is not a guaranteed amount for every winner. Historical information and AI analysis do not determine future outcomes.', zh: '不是。Lotto 奖池及 Jackpot 参考金额可能变化，奖池参考并不代表每名得主保证获得该金额。历史资料与 AI 分析不能决定未来结果。', ms: 'Tidak. Kumpulan hadiah Lotto dan rujukan jackpot boleh berubah, dan rujukan kumpulan bukan jumlah terjamin untuk setiap pemenang. Maklumat sejarah dan analisis AI tidak menentukan keputusan masa hadapan.'}},
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
    en: 'This is an independent informational guide and not official Sabah 88 content. 4D AI does not sell tickets, accept bets, operate draws or process prize claims. It does not promise results, historical information does not determine future outcomes, AI analysis is not an official prediction, and official provider information takes precedence.',
    zh: '本页面是独立资讯指南，并非 Sabah 88 官方内容。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。页面不承诺任何结果，历史资料不能决定未来结果，AI 分析并非官方预测，并且应以官方 Provider 资料为优先。',
    ms: 'Ini ialah panduan maklumat bebas dan bukan kandungan rasmi Sabah 88. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah. Ia tidak menjanjikan keputusan, maklumat sejarah tidak menentukan keputusan masa hadapan, analisis AI bukan ramalan rasmi, dan maklumat rasmi penyedia perlu diutamakan.'
  },
  relatedGuidesTitle: {
    en: 'Related Provider Guides',
    zh: '相关 Provider 指南',
    ms: 'Panduan Penyedia Berkaitan'
  },
  relatedSlugs: ['magnum', 'da-ma-cai', 'sports-toto', 'singapore-pools', 'stc', 'sarawak']
};

const sabah88Meta = {
  title: {
    en: 'Sabah 88 Game Guide | 4D AI',
    zh: 'Sabah 88 游戏指南 | 4D AI',
    ms: 'Panduan Permainan Sabah 88 | 4D AI'
  },
  description: {
    en: 'Sabah 88 game guide covering 3D, 4D, 4D Permutation, Lotto 6/45, prize structure and terminology. This is an independent informational reference and official provider information takes precedence.',
    zh: 'Sabah 88 游戏指南，整理 3D、4D、4D 全保、Lotto 6/45、派彩结构与游戏术语。本页面为独立资讯参考，并以官方 Provider 资料为优先。',
    ms: 'Panduan permainan Sabah 88 yang merangkumi 3D, 4D, 4D Susunan, Lotto 6/45, struktur hadiah dan istilah. Ini ialah rujukan maklumat bebas dan maklumat rasmi penyedia perlu diutamakan.'
  }
};

const sarawakGuide: ProviderGuideContent = {
  heroTitle: {
    en: 'Sarawak 4D Game Guide',
    zh: '砂拉越 4D 游戏指南',
    ms: 'Panduan Permainan Sarawak 4D'
  },
  heroIntro: {
    en: 'Review Sarawak 4D game information, common terminology and prize structure in one independent information guide. This page currently reflects only the 4D game available in the typed provider data and is not an official Sarawak 4D publication.',
    zh: '本指南整理 Sarawak 4D 的游戏资料、常见术语与派彩结构，供用户作一般资讯和研究参考。本页面目前只反映 typed Provider data 中已有的 4D 游戏，并非 Sarawak 4D 官方发布内容。',
    ms: 'Semak maklumat permainan Sarawak 4D, istilah lazim dan struktur hadiah dalam satu panduan maklumat bebas. Halaman ini buat masa ini hanya mencerminkan permainan 4D yang tersedia dalam data penyedia bertip dan bukan penerbitan rasmi Sarawak 4D.'
  },
  tags: [
    {en: 'Sarawak 4D', zh: '砂拉越 4D', ms: 'Sarawak 4D'},
    {en: '4D Structure', zh: '4D 结构', ms: 'Struktur 4D'},
    {en: 'Reference Only', zh: '仅供参考', ms: 'Untuk Rujukan Sahaja'}
  ],
  breadcrumb: {
    home: {en: 'Home', zh: '首页', ms: 'Laman Utama'},
    more: {en: 'More', zh: '更多', ms: 'Lagi'},
    providerGuides: {en: 'Provider Guides', zh: 'Provider 指南', ms: 'Panduan Penyedia'}
  },
  aboutTitle: {
    en: 'About Sarawak 4D',
    zh: '关于砂拉越 4D',
    ms: 'Mengenai Sarawak 4D'
  },
  aboutParagraphs: [
    {
      en: 'This page organises Sarawak 4D game categories, common terms and payout structures currently available in the typed provider data.',
      zh: '本页面整理 typed Provider data 中目前已有的 Sarawak 4D 游戏类别、常见术语与派彩结构。',
      ms: 'Halaman ini menyusun kategori permainan Sarawak 4D, istilah lazim dan struktur bayaran yang tersedia dalam data penyedia bertip.'
    },
    {
      en: 'The current page displays only 4D because that is the only Sarawak game currently represented in the typed data. 4D AI does not add jackpot, permutation, 3D, Lotto or other game formats that are not present in the source data.',
      zh: '当前页面只展示 4D，因为这是 typed data 中目前代表的唯一 Sarawak 游戏。4D AI 不补充 Jackpot、全保、3D、Lotto 或其他源数据中不存在的玩法。',
      ms: 'Halaman semasa hanya memaparkan 4D kerana itulah satu-satunya permainan Sarawak yang diwakili dalam data bertip. 4D AI tidak menambah jackpot, susunan, 3D, Lotto atau format permainan lain yang tiada dalam data sumber.'
    },
    {
      en: '4D AI is an independent information platform. It does not operate Sarawak 4D games, sell tickets, accept bets or process prize claims. The content is not betting advice and does not promise prizes or future results.',
      zh: '4D AI 是独立资讯平台，不经营 Sarawak 4D 游戏、不销售票券、不接受投注，也不处理兑奖。本页面内容不构成投注建议，也不承诺中奖或未来结果。',
      ms: '4D AI ialah platform maklumat bebas. Ia tidak mengendalikan permainan Sarawak 4D, tidak menjual tiket, tidak menerima pertaruhan dan tidak memproses tuntutan hadiah. Kandungan ini bukan nasihat pertaruhan dan tidak menjanjikan hadiah atau keputusan masa hadapan.'
    },
    {
      en: 'Official rules, results and payout amounts may change. Users should verify the latest official provider publication before relying on any figure.',
      zh: '正式规则、开奖结果与派彩金额可能调整。用户在依赖任何数字前，应以相关 Provider 最新官方公布为准。',
      ms: 'Peraturan rasmi, keputusan dan jumlah bayaran boleh berubah. Pengguna perlu menyemak penerbitan rasmi terkini penyedia sebelum bergantung pada mana-mana angka.'
    }
  ],
  summaryTitle: {
    en: 'Provider Summary',
    zh: 'Provider 摘要',
    ms: 'Ringkasan Penyedia'
  },
  summary: [
    {label: {en: 'Provider', zh: 'Provider', ms: 'Penyedia'}, value: {en: 'Sarawak 4D', zh: 'Sarawak 4D', ms: 'Sarawak 4D'}},
    {label: {en: 'Guide coverage', zh: '指南范围', ms: 'Liputan panduan'}, value: {en: '4D', zh: '4D', ms: '4D'}},
    {label: {en: 'Information type', zh: '资讯类型', ms: 'Jenis maklumat'}, value: {en: 'Game structure and payout reference', zh: '游戏结构与派彩参考', ms: 'Rujukan struktur permainan dan bayaran'}},
    {label: {en: 'Platform role', zh: '平台角色', ms: 'Peranan platform'}, value: {en: 'Independent informational guide', zh: '独立资讯指南', ms: 'Panduan maklumat bebas'}},
    {label: {en: 'Verification', zh: '资料核对', ms: 'Pengesahan'}, value: {en: 'Check the provider latest official publication', zh: '请核对 Provider 最新官方公布', ms: 'Semak penerbitan rasmi terkini penyedia'}}
  ],
  availableGamesTitle: {
    en: 'Available Games',
    zh: '主要游戏',
    ms: 'Permainan Tersedia'
  },
  availableGames: [
    {
      title: {en: '4D', zh: '4D', ms: '4D'},
      description: {
        en: 'A four-digit game category with listed prize tiers and Big / Small payout coverage in the available typed data.',
        zh: '四位数字游戏类别，按当前 typed data 中已有的奖级与 Big / Small 派彩覆盖方式呈现。',
        ms: 'Kategori permainan empat digit dengan peringkat hadiah dan liputan bayaran Big / Small dalam data bertip yang tersedia.'
      }
    }
  ],
  prizeStructureTitle: {
    en: 'Prize Structure',
    zh: '派彩结构',
    ms: 'Struktur Hadiah'
  },
  informationNotesTitle: {
    en: 'Information Notes',
    zh: '资料说明',
    ms: 'Nota Maklumat'
  },
  informationNotes: [
    {
      en: 'Sarawak 4D is presented here as a four-digit number format using the prize-tier structure available in the typed data.',
      zh: 'Sarawak 4D 在本页面以四位数字格式呈现，并使用 typed data 中已有的奖级结构。',
      ms: 'Sarawak 4D dipaparkan di sini sebagai format nombor empat digit menggunakan struktur peringkat hadiah yang tersedia dalam data bertip.'
    },
    {
      en: 'Different prize tiers may have different payout arrangements, and users should read the payout table carefully before comparing figures.',
      zh: '不同奖级可能有不同派彩安排，用户在比较数字前应仔细阅读派彩表。',
      ms: 'Peringkat hadiah yang berbeza mungkin mempunyai aturan bayaran yang berbeza, dan pengguna perlu membaca jadual bayaran dengan teliti sebelum membandingkan angka.'
    },
    {
      en: 'This page only organises existing Sarawak 4D typed data. It does not add jackpot, permutation, 3D, Lotto or other game formats that are not currently listed.',
      zh: '本页面只整理现有 Sarawak 4D typed data，不新增目前未列出的 Jackpot、全保、3D、Lotto 或其他玩法。',
      ms: 'Halaman ini hanya menyusun data bertip Sarawak 4D yang sedia ada. Ia tidak menambah jackpot, susunan, 3D, Lotto atau format permainan lain yang belum disenaraikan.'
    },
    {
      en: 'This guide is not betting instruction, number selection advice or a winning strategy. Historical results do not determine future draw outcomes.',
      zh: '本指南不是投注指示、选号建议或结果预测方案。历史开奖结果不能决定未来开奖结果。',
      ms: 'Panduan ini bukan arahan pertaruhan, nasihat pemilihan nombor atau strategi menang. Keputusan sejarah tidak menentukan keputusan cabutan masa hadapan.'
    },
    {
      en: 'The payout table is general information only. Official results, rules and payout amounts from the latest provider publication take precedence.',
      zh: '派彩表仅供一般资讯参考。开奖结果、规则与派彩金额应以 Provider 最新官方公布为准。',
      ms: 'Jadual bayaran adalah maklumat umum sahaja. Keputusan, peraturan dan jumlah bayaran rasmi daripada penerbitan terkini penyedia perlu diutamakan.'
    }
  ],
  faqTitle: {
    en: 'Sarawak 4D FAQ',
    zh: 'Sarawak 4D 常见问题',
    ms: 'Soalan Lazim Sarawak 4D'
  },
  faqs: [
    {
      question: {en: 'What is this Sarawak 4D guide for?', zh: '这个 Sarawak 4D 指南用途是什么？', ms: 'Apakah tujuan panduan Sarawak 4D ini?'},
      answer: {
        en: 'It is an independent information guide that organises Sarawak 4D game structure, common terms and available payout reference details for easier review.',
        zh: '这是独立资讯指南，用于整理 Sarawak 4D 的游戏结构、常见术语与当前可用的派彩参考资料，方便用户查看。',
        ms: 'Ia ialah panduan maklumat bebas yang menyusun struktur permainan Sarawak 4D, istilah lazim dan butiran rujukan bayaran yang tersedia untuk semakan lebih mudah.'
      }
    },
    {
      question: {en: 'Does 4D AI sell Sarawak 4D tickets?', zh: '4D AI 是否销售 Sarawak 4D 票券？', ms: 'Adakah 4D AI menjual tiket Sarawak 4D?'},
      answer: {
        en: 'No. 4D AI does not sell tickets, accept bets, operate draws or process prize claims for Sarawak 4D.',
        zh: '不是。4D AI 不销售 Sarawak 4D 票券、不接受投注、不经营开奖，也不处理兑奖。',
        ms: 'Tidak. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah Sarawak 4D.'
      }
    },
    {
      question: {en: 'Is 4D AI officially affiliated with Sarawak 4D?', zh: '4D AI 是否与 Sarawak 4D 官方有关联？', ms: 'Adakah 4D AI mempunyai hubungan rasmi dengan Sarawak 4D?'},
      answer: {
        en: 'No. This page is an independent reference and is not official Sarawak 4D content or an official provider channel.',
        zh: '没有。本页面是独立参考资料，并非 Sarawak 4D 官方内容或官方 Provider 渠道。',
        ms: 'Tidak. Halaman ini ialah rujukan bebas dan bukan kandungan rasmi Sarawak 4D atau saluran rasmi penyedia.'
      }
    },
    {
      question: {en: 'What is Sarawak 4D?', zh: 'Sarawak 4D 是什么？', ms: 'Apakah Sarawak 4D?'},
      answer: {
        en: 'On this page, Sarawak 4D refers to the 4D game category represented in the typed provider data, with listed prize tiers and payout reference information.',
        zh: '在本页面中，Sarawak 4D 指 typed Provider data 中已有的 4D 游戏类别，并按资料列出奖级与派彩参考信息。',
        ms: 'Pada halaman ini, Sarawak 4D merujuk kepada kategori permainan 4D yang diwakili dalam data penyedia bertip, dengan peringkat hadiah dan maklumat rujukan bayaran yang disenaraikan.'
      }
    },
    {
      question: {en: 'Does historical data predict future Sarawak 4D results?', zh: '历史数据是否能预测未来 Sarawak 4D 结果？', ms: 'Adakah data sejarah meramalkan keputusan Sarawak 4D masa hadapan?'},
      answer: {
        en: 'No. Historical result information can be reviewed for reference, but it does not determine or make future draw outcomes predictable.',
        zh: '不能。历史开奖结果可作为参考资料查看，但不能决定未来开奖结果，也不能让未来结果变得可预测。',
        ms: 'Tidak. Maklumat keputusan sejarah boleh disemak sebagai rujukan, tetapi ia tidak menentukan atau menjadikan keputusan cabutan masa hadapan boleh diramal.'
      }
    },
    {
      question: {en: 'Does AI analysis guarantee winning numbers?', zh: 'AI 分析是否能确定中奖号码？', ms: 'Adakah analisis AI menjamin nombor menang?'},
      answer: {
        en: 'No. AI analysis on 4D AI is informational only, is not an official prediction and does not promise prizes or future results.',
        zh: '不能。4D AI 的 AI 分析仅供资讯参考，并非官方预测，也不承诺中奖或未来结果。',
        ms: 'Tidak. Analisis AI di 4D AI hanya untuk maklumat, bukan ramalan rasmi dan tidak menjanjikan hadiah atau keputusan masa hadapan.'
      }
    },
    {
      question: {en: 'Where should users verify official rules and payouts?', zh: '用户应在哪里核对官方规则和派彩？', ms: 'Di manakah pengguna perlu menyemak peraturan dan bayaran rasmi?'},
      answer: {
        en: 'Users should verify game rules, payout amounts and jackpot arrangements with the provider latest official publication.',
        zh: '用户应以相关 Provider 最新官方公布核对游戏规则、派彩金额及奖池安排。',
        ms: 'Pengguna perlu menyemak peraturan permainan, jumlah bayaran dan aturan jackpot melalui penerbitan rasmi terkini penyedia.'
      }
    }
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
    en: 'This is an independent informational guide and not official Sarawak 4D content. 4D AI does not sell tickets, accept bets, operate draws or process prize claims. It does not promise results, historical information does not determine future outcomes, AI analysis is not an official prediction, and official provider information takes precedence.',
    zh: '本页面是独立资讯指南，并非 Sarawak 4D 官方内容。4D AI 不销售票券、不接受投注、不经营开奖，也不处理兑奖。页面不承诺任何结果，历史资料不能决定未来结果，AI 分析并非官方预测，并且应以官方 Provider 资料为优先。',
    ms: 'Ini ialah panduan maklumat bebas dan bukan kandungan rasmi Sarawak 4D. 4D AI tidak menjual tiket, menerima pertaruhan, mengendalikan cabutan atau memproses tuntutan hadiah. Ia tidak menjanjikan keputusan, maklumat sejarah tidak menentukan keputusan masa hadapan, analisis AI bukan ramalan rasmi, dan maklumat rasmi penyedia perlu diutamakan.'
  },
  relatedGuidesTitle: {
    en: 'Related Provider Guides',
    zh: '相关 Provider 指南',
    ms: 'Panduan Penyedia Berkaitan'
  },
  relatedSlugs: ['magnum', 'da-ma-cai', 'sports-toto', 'singapore-pools', 'stc', 'sabah-88']
};

const sarawakMeta = {
  title: {
    en: 'Sarawak 4D Game Guide | 4D AI',
    zh: '砂拉越 4D 游戏指南 | 4D AI',
    ms: 'Panduan Permainan Sarawak 4D | 4D AI'
  },
  description: {
    en: 'Sarawak 4D game guide covering 4D prize structure and terminology. This is an independent informational reference and official provider information takes precedence.',
    zh: '砂拉越 4D 游戏指南，整理 4D 派彩结构与游戏术语。本页面为独立资讯参考，并以官方 Provider 资料为优先。',
    ms: 'Panduan permainan Sarawak 4D yang merangkumi struktur hadiah 4D dan istilah. Ini ialah rujukan maklumat bebas dan maklumat rasmi penyedia perlu diutamakan.'
  }
};

function withProviderGuide(page: ProviderPayoutPage): ProviderPayoutPage {
  if (page.slug === 'da-ma-cai') {
    return {
      ...page,
      metaTitle: daMaCaiMeta.title,
      metaDescription: daMaCaiMeta.description,
      guide: daMaCaiGuide
    };
  }
  if (page.slug === 'sports-toto') {
    return {
      ...page,
      metaTitle: sportsTotoMeta.title,
      metaDescription: sportsTotoMeta.description,
      guide: sportsTotoGuide
    };
  }
  if (page.slug === 'singapore-pools') {
    return {
      ...page,
      metaTitle: singaporePoolsMeta.title,
      metaDescription: singaporePoolsMeta.description,
      guide: singaporePoolsGuide
    };
  }
  if (page.slug === 'stc') {
    return {
      ...page,
      metaTitle: stcMeta.title,
      metaDescription: stcMeta.description,
      guide: stcGuide
    };
  }
  if (page.slug === 'sabah-88') {
    return {
      ...page,
      metaTitle: sabah88Meta.title,
      metaDescription: sabah88Meta.description,
      guide: sabah88Guide
    };
  }
  if (page.slug === 'sarawak') {
    return {
      ...page,
      metaTitle: sarawakMeta.title,
      metaDescription: sarawakMeta.description,
      guide: sarawakGuide
    };
  }
  return page;
}

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => providerPayoutPages.map((page) => ({locale, provider: page.slug})));
}

export async function generateMetadata({params}: {params: Promise<{locale: Locale; provider: string}>}): Promise<Metadata> {
  const {locale, provider} = await params;
  const rawPage = providerPayoutsBySlug.get(provider as ProviderPayoutSlug);
  if (!rawPage) return {};
  const page = withProviderGuide(rawPage);
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
  const page = withProviderGuide(rawPage);

  return <ProviderPayoutContent locale={locale} page={page} />;
}
