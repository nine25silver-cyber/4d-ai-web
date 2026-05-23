'use client';

import {useMemo, useState} from 'react';
import {useSearchParams} from 'next/navigation';
import {AiHitHistoryPreviewClient, type AiHitHistoryRow} from '@/components/AiHitHistoryPreviewClient';

type Labels = {
  locked: string;
  hitCountPendingValue: string;
  hitRowCountLabel: string;
  hitRecommendedLabel: string;
  hitResultLabel: string;
  hitPrizePlaceholder: string;
  hitExpandLabel: string;
  hitCollapseLabel: string;
  hitHistoryEyebrow: string;
  hitHistoryTitle: string;
  hitCountInlineLabel: string;
  viewDetails: string;
  hideDetails: string;
};

type Props = {
  providerCode: string;
  labels: Labels;
  initialHitCount?: number | null;
  rows?: AiHitHistoryRow[];
  displayCount?: number;
  sourceDebug?: string;
};

export function AiHitHistorySectionClient({providerCode, labels, initialHitCount, rows, displayCount, sourceDebug}: Props) {
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [resolvedCount, setResolvedCount] = useState<number | null>(typeof initialHitCount === 'number' ? initialHitCount : null);
  const [resolvedPeriods, setResolvedPeriods] = useState<number>(typeof displayCount === 'number' ? displayCount : 0);
  const [debugTopRows, setDebugTopRows] = useState<string[]>([]);
  const [debugStatus, setDebugStatus] = useState<string>('waiting');

  const countText = useMemo(() => {
    if (typeof resolvedCount === 'number') return `${resolvedCount}`;
    return labels.hitCountPendingValue;
  }, [labels.hitCountPendingValue, resolvedCount]);
  const showDebugPanel = process.env.NODE_ENV !== 'production' || searchParams.get('debug') === '1';

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase text-blue-800">{labels.hitHistoryEyebrow}</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">{labels.hitHistoryTitle}</h2>
          <p className="mt-2 text-sm font-black text-slate-700">{labels.hitCountInlineLabel} {countText}</p>
          <p className="mt-1 text-xs font-bold text-slate-500">当前展示 {resolvedPeriods}/100 期</p>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-black text-slate-800 hover:bg-slate-100"
        >
          {open ? labels.hideDetails : labels.viewDetails}
        </button>
      </div>

      <div className={open ? '' : 'hidden'}>
        <AiHitHistoryPreviewClient
          providerCode={providerCode}
          hitCount={typeof initialHitCount === 'number' ? initialHitCount : null}
          rows={rows}
          onResolvedCount={setResolvedCount}
          onResolvedPeriods={setResolvedPeriods}
          onDebugTopRows={setDebugTopRows}
          onDebugStatus={setDebugStatus}
          labels={{
            locked: labels.locked,
            hitCountPendingValue: labels.hitCountPendingValue,
            hitRowCountLabel: labels.hitRowCountLabel,
            hitRecommendedLabel: labels.hitRecommendedLabel,
            hitResultLabel: labels.hitResultLabel,
            hitPrizePlaceholder: labels.hitPrizePlaceholder,
            hitExpandLabel: labels.hitExpandLabel,
            hitCollapseLabel: labels.hitCollapseLabel
          }}
        />
      </div>
      {showDebugPanel ? (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700">
          <p className="font-black text-slate-900">对照调试: 前5条 draw_date + checked_at</p>
          {sourceDebug ? <p className="mt-1 font-mono text-[11px] text-slate-600">{sourceDebug}</p> : null}
          <p className="mt-1 font-mono text-[11px] text-slate-600">client_debug={debugStatus}</p>
          {debugTopRows.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {debugTopRows.map((line) => <li key={line} className="font-mono">{line}</li>)}
            </ul>
          ) : (
            <p className="mt-2">等待载入...</p>
          )}
        </div>
      ) : null}
    </section>
  );
}
