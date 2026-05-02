'use client';

import { useState } from 'react';
import ProviderDashboard from '@/components/provider-dashboard';
import HistoryPanel from '@/components/history-panel';
import LanguageSelector from '@/components/language-selector';
import { useLanguage } from '@/hooks/useLanguage';

export default function HomePage() {
  const [showHistory, setShowHistory] = useState(false);
  const { t } = useLanguage();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 border-b border-slate-200 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">4D</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">4D AI</h1>
                <p className="text-sm text-slate-600">{t('subtitle')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition text-sm font-medium text-slate-700"
              >
                {showHistory ? t('hideHistory') : t('showHistory')}
              </button>
              <LanguageSelector />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showHistory && (
          <div className="mb-8">
            <HistoryPanel />
          </div>
        )}
        
        <ProviderDashboard />
      </div>

      <footer className="mt-16 py-8 border-t border-slate-200">
        <div className="container mx-auto px-4 text-center text-sm text-slate-600">
          <strong className="text-slate-900">4D AI</strong>
          <span className="mx-2">•</span>
          <span>{t('dataSource')}</span>
        </div>
      </footer>
    </main>
  );
}
