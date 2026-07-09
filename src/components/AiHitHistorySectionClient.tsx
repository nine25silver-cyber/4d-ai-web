'use client';

import {useState} from 'react';
import {AiHitHistoryPreviewClient, type AiHitHistoryRow} from '@/components/AiHitHistoryPreviewClient';

type Labels = {
  locked: string;
  hitCountPendingValue: string;
  hitRowCountLabel: string;
  hitRecommendedLabel: string;
  hitResultLabel: string;
  hitNoWinText: string;
  hitPrizePlaceholder: string;
  hitExpandLabel: string;
  hitCollapseLabel: string;
  hitDisplayCountLabel: string;
  firstPrizeLabel: string;
  secondPrizeLabel: string;
  thirdPrizeLabel: string;
  specialPrizeLabel: string;
  consolationPrizeLabel: string;
};

type Props = {
  providerCode: string;
  expertTitle: string;
  labels: Labels;
  initialHitCount?: number | null;
  rows?: AiHitHistoryRow[];
  displayCount?: number;
};

export function AiHitHistorySectionClient({providerCode, expertTitle, labels, initialHitCount, rows, displayCount}: Props) {
  const [resolvedPeriods, setResolvedPeriods] = useState<number>(typeof displayCount === 'number' ? displayCount : 0);
  const displayCountText = labels.hitDisplayCountLabel
    .replace('{count}', String(resolvedPeriods))
    .replace('{total}', '100');

  return (
    <section className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h3 className="text-lg font-black text-slate-950">{expertTitle}</h3>
        <p className="text-xs font-bold text-slate-500">{displayCountText}</p>
      </div>
      <AiHitHistoryPreviewClient
        providerCode={providerCode}
        hitCount={typeof initialHitCount === 'number' ? initialHitCount : null}
        rows={rows}
        onResolvedPeriods={setResolvedPeriods}
        labels={{
          locked: labels.locked,
          hitCountPendingValue: labels.hitCountPendingValue,
          hitRowCountLabel: labels.hitRowCountLabel,
          hitRecommendedLabel: labels.hitRecommendedLabel,
          hitResultLabel: labels.hitResultLabel,
          hitNoWinText: labels.hitNoWinText,
          hitPrizePlaceholder: labels.hitPrizePlaceholder,
          hitExpandLabel: labels.hitExpandLabel,
          hitCollapseLabel: labels.hitCollapseLabel,
          firstPrizeLabel: labels.firstPrizeLabel,
          secondPrizeLabel: labels.secondPrizeLabel,
          thirdPrizeLabel: labels.thirdPrizeLabel,
          specialPrizeLabel: labels.specialPrizeLabel,
          consolationPrizeLabel: labels.consolationPrizeLabel
        }}
      />
    </section>
  );
}
