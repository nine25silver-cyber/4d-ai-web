'use client';

import {useEffect, useState} from 'react';
import type {ThreePlusOneAiHitHistoryRecord} from '@/lib/cloudflare';

type Labels = {
  hitCountLabel: string;
  recommendedLabel: string;
  resultLabel: string;
  noHitText: string;
  expandLabel: string;
  collapseLabel: string;
};

type Props = {
  records: ThreePlusOneAiHitHistoryRecord[];
  labels: Labels;
};

export function ThreePlusOneHitHistoryClient({records, labels}: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(records[0]?.id ?? null);

  useEffect(() => {
    if (records.length === 0) {
      setExpandedId(null);
      return;
    }
    if (!records.some((record) => record.id === expandedId)) {
      setExpandedId(records[0]?.id ?? null);
    }
  }, [expandedId, records]);

  return (
    <div className="mt-4 space-y-3">
      {records.map((record) => {
        const expanded = expandedId === record.id;
        return (
          <article key={record.id} className="overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              aria-expanded={expanded}
              aria-label={expanded ? labels.collapseLabel : labels.expandLabel}
              onClick={() => setExpandedId(expanded ? null : record.id)}
              className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-slate-50"
            >
              <span className="text-base font-black text-slate-950">{record.drawDate}</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-black text-slate-700">
                  {labels.hitCountLabel.replace('{count}', `${record.hitCount}`)}
                </span>
                <span
                  aria-hidden="true"
                  className={`h-2.5 w-2.5 border-b-2 border-r-2 border-slate-400 transition ${expanded ? '-rotate-135' : 'rotate-45'}`}
                />
              </span>
            </button>

            {expanded ? (
              <div className="border-t border-slate-100 px-4 pb-4 pt-3">
                <div className="grid gap-4 md:grid-cols-[220px_1fr]">
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">{labels.recommendedLabel}</p>
                    <div className="mt-2 flex gap-1.5">
                      {record.recommendation4.map((digit, index) => (
                        <span
                          key={`${record.id}-${digit}-${index}`}
                          className="flex h-9 w-10 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm font-black text-slate-950"
                        >
                          {digit}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-slate-500">{labels.resultLabel}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {record.prizes.map((prize) => (
                        <span
                          key={`${record.id}-${prize.label}`}
                          className={`rounded-lg border px-3 py-2 text-sm font-black ${
                            prize.hit
                              ? 'border-amber-300 bg-amber-50 text-amber-950'
                              : 'border-slate-200 bg-slate-50 text-slate-500'
                          }`}
                        >
                          {`${prize.label} ${prize.number}`}
                        </span>
                      ))}
                    </div>
                    {record.hitCount === 0 ? (
                      <p className="mt-2 text-xs font-bold text-slate-500">{labels.noHitText}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
