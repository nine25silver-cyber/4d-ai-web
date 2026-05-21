import type {ResultCardLabels} from '@/components/ResultCard';

type Translator = (key: string, values?: Record<string, string>) => string;

export function resultCardLabels(t: Translator): ResultCardLabels {
  return {
    firstPrize: t('firstPrize'),
    secondPrize: t('secondPrize'),
    thirdPrize: t('thirdPrize'),
    specialPrize: t('specialPrize'),
    consolationPrize: t('consolationPrize'),
    sourceLabel: t('sourceLabel'),
    updatedLabel: t('updatedLabel'),
    unavailable: t('unavailable'),
    providerResult: t('providerResult'),
    unavailableReason: t('unavailableReason', {reason: '__REASON__'}),
    drawLabel: t('drawLabel'),
    datePending: t('datePending')
  };
}
