'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'zh' | 'en' | 'ms';

interface LanguageStore {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const translations = {
  zh: {
    subtitle: '马来西亚4D最新开奖结果',
    showHistory: '查看历史',
    hideHistory: '隐藏历史',
    dataSource: '数据来源: Cloudflare JSON 代理',
    westMalaysia: '西马',
    eastMalaysia: '东马',
    singapore: '新加坡',
    cambodia: '柬埔寨',
    refresh: '刷新',
    refreshing: '刷新中...',
    draw: '开奖',
    first: '头奖',
    second: '二奖',
    third: '三奖',
    viewAll: '查看全部',
    noResults: '暂无结果',
    historyTitle: '历史开奖查询',
    provider: '彩票公司',
    startDate: '开始日期',
    endDate: '结束日期',
    searchNumber: '搜索号码',
    search: '搜索',
    searching: '搜索中...',
    date: '日期',
    drawNumber: '开奖号',
    noHistoryResults: '点击搜索按钮查询历史开奖记录',
  },
  en: {
    subtitle: 'Malaysia 4D Latest Results',
    showHistory: 'Show History',
    hideHistory: 'Hide History',
    dataSource: 'Data source: Cloudflare JSON proxy',
    westMalaysia: 'West Malaysia',
    eastMalaysia: 'East Malaysia',
    singapore: 'Singapore',
    cambodia: 'Cambodia',
    refresh: 'Refresh',
    refreshing: 'Refreshing...',
    draw: 'Draw',
    first: '1st Prize',
    second: '2nd Prize',
    third: '3rd Prize',
    viewAll: 'View All',
    noResults: 'No results',
    historyTitle: 'History',
    provider: 'Provider',
    startDate: 'Start Date',
    endDate: 'End Date',
    searchNumber: 'Number',
    search: 'Search',
    searching: 'Searching...',
    date: 'Date',
    drawNumber: 'Draw No.',
    noHistoryResults: 'Click search to query',
  },
  ms: {
    subtitle: 'Keputusan Terkini 4D Malaysia',
    showHistory: 'Tunjuk Sejarah',
    hideHistory: 'Sembunyikan',
    dataSource: 'Sumber: Cloudflare JSON',
    westMalaysia: 'Malaysia Barat',
    eastMalaysia: 'Malaysia Timur',
    singapore: 'Singapura',
    cambodia: 'Kemboja',
    refresh: 'Muat Semula',
    refreshing: 'Memuatkan...',
    draw: 'Cabutan',
    first: 'Hadiah 1',
    second: 'Hadiah 2',
    third: 'Hadiah 3',
    viewAll: 'Lihat Semua',
    noResults: 'Tiada',
    historyTitle: 'Sejarah',
    provider: 'Penyedia',
    startDate: 'Tarikh Mula',
    endDate: 'Tarikh Tamat',
    searchNumber: 'Nombor',
    search: 'Cari',
    searching: 'Mencari...',
    date: 'Tarikh',
    drawNumber: 'No. Cabutan',
    noHistoryResults: 'Klik cari',
  },
};

const useLanguageStore = create<LanguageStore>()(
  persist(
    (set) => ({
      language: 'zh',
      setLanguage: (lang) => set({ language: lang }),
    }),
    {
      name: '4d-language-storage',
    }
  )
);

export function useLanguage() {
  const { language, setLanguage } = useLanguageStore();
  const t = (key: keyof typeof translations.zh) => {
    return translations[language][key] || translations.zh[key];
  };
  return { language, setLanguage, t };
}
