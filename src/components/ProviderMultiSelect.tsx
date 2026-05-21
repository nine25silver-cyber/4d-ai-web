'use client';

import {useMemo, useState} from 'react';
import type {ProviderConfig} from '@/lib/providers';
import {ProviderLogoBadge} from '@/components/ProviderLogoBadge';

type Props = {
  providers: ProviderConfig[];
  labels: {
    title: string;
    text: string;
    selected: string;
    selectAll: string;
    clearAll: string;
  };
};

export function ProviderMultiSelect({providers, labels}: Props) {
  const [selected, setSelected] = useState(() => new Set(providers.map((provider) => provider.code)));
  const selectedNames = useMemo(
    () => providers.filter((provider) => selected.has(provider.code)).map((provider) => provider.shortName).join(', '),
    [providers, selected]
  );

  function toggle(code: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  }

  return (
    <section className="md:col-span-2">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-black text-slate-800">{labels.title}</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">{labels.text}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => setSelected(new Set(providers.map((provider) => provider.code)))} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
            {labels.selectAll}
          </button>
          <button type="button" onClick={() => setSelected(new Set())} className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs font-black text-slate-700 hover:border-blue-300">
            {labels.clearAll}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {providers.map((provider) => {
          const active = selected.has(provider.code);
          return (
            <button
              key={provider.code}
              type="button"
              onClick={() => toggle(provider.code)}
              aria-pressed={active}
              className={`min-h-[76px] rounded-lg border p-3 text-left transition ${active ? 'border-[#1e3a8a] bg-[#eff6ff] shadow-sm' : 'border-slate-200 bg-white hover:border-[#1e3a8a]'}`}
            >
              <ProviderLogoBadge provider={provider} active={active} />
              <span className="mt-2 block text-xs font-black leading-4 text-slate-900">{provider.name}</span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs font-semibold text-slate-500">
        {labels.selected}: <span className="text-slate-800">{selectedNames || '-'}</span>
      </p>
    </section>
  );
}

