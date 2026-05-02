'use client';

import { useLanguage } from '@/hooks/useLanguage';

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  const languages = [
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'ms', label: 'Melayu', flag: '🇲🇾' },
  ];

  return (
    <select
      value={language}
      onChange={(e) => setLanguage(e.target.value as 'zh' | 'en' | 'ms')}
      className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.flag} {lang.label}
        </option>
      ))}
    </select>
  );
}
