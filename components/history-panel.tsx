'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export default function HistoryPanel() {
  const [selectedProvider, setSelectedProvider] = useState('magnum');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchNumber, setSearchNumber] = useState('');
  const { t } = useLanguage();

  const providers = [
    { id: 'magnum', name: 'Magnum 4D' },
    { id: 'toto', name: 'Sports Toto' },
    { id: 'damacai', name: 'Da Ma Cai' },
  ];

  const handleSearch = async () => {
    // TODO: 实现搜索功能
    console.log('Searching...', { selectedProvider, startDate, endDate, searchNumber });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-bold text-slate-900 mb-6">
        📊 {t('historyTitle')}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('provider')}
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          >
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('startDate')}
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('endDate')}
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            {t('searchNumber')}
          </label>
          <input
            type="text"
            value={searchNumber}
            onChange={(e) => setSearchNumber(e.target.value)}
            placeholder="1234"
            maxLength={4}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
          />
        </div>
      </div>

      <button
        onClick={handleSearch}
        className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700"
      >
        {t('search')}
      </button>

      <div className="mt-8 text-center text-slate-500">
        {t('noHistoryResults')}
      </div>
    </div>
  );
}
