export const PROVIDERS = [
  'magnum',
  'sports_toto',
  'da_ma_cai',
  'sabah88',
  'sarawak',
  'sandakan',
  'grand_dragon',
  'nine_lotto',
  'singapore',
] as const;

export type Provider = (typeof PROVIDERS)[number];

export const PROVIDER_LABELS: Record<Provider, string> = {
  magnum: 'Magnum',
  sports_toto: 'Sports Toto',
  da_ma_cai: 'Da Ma Cai',
  sabah88: 'Sabah 88',
  sarawak: 'Sarawak',
  sandakan: 'Sandakan',
  grand_dragon: 'Grand Dragon',
  nine_lotto: 'Nine Lotto',
  singapore: 'Singapore',
};

export const PROVIDER_META: Record<Provider, { label: string; logo?: string }> = {
  magnum: { label: 'Magnum', logo: '/logos/magnum.png' },
  sports_toto: { label: 'Sports Toto', logo: '/logos/sports-toto.png' },
  da_ma_cai: { label: 'Da Ma Cai', logo: '/logos/da-ma-cai.png' },
  sabah88: { label: 'Sabah 88', logo: '/logos/sabah88.png' },
  sarawak: { label: 'Sarawak', logo: '/logos/sarawak.png' },
  sandakan: { label: 'Sandakan', logo: '/logos/sandakan.png' },
  singapore: { label: 'Singapore', logo: '/logos/singapore.png' },
  grand_dragon: { label: 'Grand Dragon', logo: '/logos/grand-dragon.png' },
  nine_lotto: { label: 'Nine Lotto', logo: '/logos/nine-lotto.png' },
};

export type ProviderResult = {
  draw_date?: string;
  draw_number?: string;
  first_prize?: string;
  second_prize?: string;
  third_prize?: string;
  special_numbers?: string[];
  special_cells?: string[];
  special_slot_labels?: string[];
  consolation_numbers?: string[];
  consolation_slot_labels?: string[];
  top3_slot_labels?: { first?: string; second?: string; third?: string };
  slot_layout?: Record<string, unknown>;
  phase?: string;
  status?: string;
  last_refreshed?: string;
};

type SlotLayout = {
  special_slots?: unknown;
  consolation_slots?: unknown;
  top3_slots?: { first?: string; second?: string; third?: string };
  first_prize_slot?: string;
  second_prize_slot?: string;
  third_prize_slot?: string;
};

function flattenToStrings(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenToStrings(item));
  }
  const str = asString(value);
  return str ? [str] : [];
}

function parseOrderedSlots(latest: any): string[] {
  const candidates = [
    latest?.special_slot_layout,
    latest?.special_slots,
    latest?.ordered_special_slots,
    latest?.special_numbers_ordered,
    latest?.draw_slot_layouts_recent?.special,
  ];

  for (const candidate of candidates) {
    const slots = flattenToStrings(candidate);
    if (slots.length) return slots;
  }

  return [];
}

function parseSlotLayout(latest: any): SlotLayout | undefined {
  const slotLayout = latest?.slot_layout ?? latest?.slotLayout;
  if (!slotLayout || typeof slotLayout !== 'object') return undefined;

  const specialSlots = slotLayout.special_slots ?? slotLayout.specialSlots ?? slotLayout.special;
  const consolationSlots = slotLayout.consolation_slots ?? slotLayout.consolationSlots ?? slotLayout.consolation;
  const top3SlotsRaw = slotLayout.top3_slots ?? slotLayout.top3Slots;
  const top3Slots = top3SlotsRaw && typeof top3SlotsRaw === 'object'
    ? {
        first: asString(top3SlotsRaw.first),
        second: asString(top3SlotsRaw.second),
        third: asString(top3SlotsRaw.third),
      }
    : undefined;

  const firstPrizeSlot = asString(slotLayout.first_prize_slot ?? slotLayout.firstPrizeSlot);
  const secondPrizeSlot = asString(slotLayout.second_prize_slot ?? slotLayout.secondPrizeSlot);
  const thirdPrizeSlot = asString(slotLayout.third_prize_slot ?? slotLayout.thirdPrizeSlot);

  if (!specialSlots && !consolationSlots && !top3Slots && !firstPrizeSlot && !secondPrizeSlot && !thirdPrizeSlot) return undefined;

  return {
    special_slots: specialSlots,
    consolation_slots: consolationSlots,
    top3_slots: top3Slots,
    first_prize_slot: firstPrizeSlot,
    second_prize_slot: secondPrizeSlot,
    third_prize_slot: thirdPrizeSlot,
  };
}

function extractSlotLabels(value: unknown): string[] | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.map((_, idx) => String(idx + 1));
  if (typeof value === 'object') return Object.keys(value).map((key) => key.trim().toUpperCase());
  return undefined;
}

function normalizeSpecialCells(latest: any): string[] | undefined {
  const slotLayout = parseSlotLayout(latest);
  const values = slotLayout?.special_slots ? flattenToStrings(slotLayout.special_slots) : parseOrderedSlots(latest);
  if (!values.length) return undefined;

  const promotedSlots = new Set(
    [slotLayout?.top3_slots?.first, slotLayout?.top3_slots?.second, slotLayout?.top3_slots?.third].filter(Boolean) as string[],
  );

  if (promotedSlots.size > 0) {
    return values.map((slotValue) => (promotedSlots.has(slotValue) ? '----' : slotValue));
  }

  const orderedSlots = values;

  const top3 = [
    asString(latest?.first_prize ?? latest?.top1),
    asString(latest?.second_prize ?? latest?.top2),
    asString(latest?.third_prize ?? latest?.top3),
  ].filter(Boolean) as string[];

  const remaining = new Map<string, number>();
  for (const value of top3) {
    remaining.set(value, (remaining.get(value) ?? 0) + 1);
  }

  return orderedSlots.map((slot) => {
    const count = remaining.get(slot) ?? 0;
    if (count > 0) {
      remaining.set(slot, count - 1);
      return '----';
    }
    return slot;
  });
}

function toArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v));
}

function toOptionalArray(value: unknown): string[] | undefined {
  const values = flattenToStrings(value);
  return values.length ? values : undefined;
}

function asString(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  const str = String(value).trim();
  return str.length ? str : undefined;
}

async function extractErrorMessage(res: Response, fallback: string): Promise<string> {
  try {
    const payload = await res.json();
    if (payload?.error && typeof payload.error === 'string') return payload.error;
  } catch {
    // ignore parse error and fallback
  }

  return fallback;
}

export function normalizeProviderResult(payload: any): ProviderResult {
  const latest = payload?.latest_result ?? payload?.result ?? payload;
  const slotLayout = parseSlotLayout(latest);
  const specialCells = normalizeSpecialCells(latest);
  const top3SlotLabels = slotLayout?.top3_slots ?? {
    first: asString(latest?.slot_layout?.first_prize_slot ?? latest?.first_prize_slot),
    second: asString(latest?.slot_layout?.second_prize_slot ?? latest?.second_prize_slot),
    third: asString(latest?.slot_layout?.third_prize_slot ?? latest?.third_prize_slot),
  };
  return {
    draw_date: asString(latest?.draw_date ?? latest?.date),
    draw_number: asString(latest?.draw_number ?? latest?.draw_no),
    first_prize: asString(latest?.first_prize ?? latest?.top1),
    second_prize: asString(latest?.second_prize ?? latest?.top2),
    third_prize: asString(latest?.third_prize ?? latest?.top3),
    special_numbers: toArray(latest?.special_numbers ?? latest?.special),
    special_cells: specialCells,
    special_slot_labels: extractSlotLabels(slotLayout?.special_slots) ?? toOptionalArray(latest?.special_slot_labels ?? latest?.special_labels),
    consolation_numbers: toArray(latest?.consolation_numbers ?? latest?.consolation),
    consolation_slot_labels: extractSlotLabels(slotLayout?.consolation_slots) ?? toOptionalArray(latest?.consolation_slot_labels ?? latest?.consolation_labels),
    top3_slot_labels: top3SlotLabels,
    slot_layout: {
      ...(latest?.slot_layout ?? latest?.slotLayout ?? {}),
      ...(slotLayout ?? {}),
    },
    phase: asString(latest?.phase),
    status: asString(latest?.status),
    last_refreshed: asString(
      latest?.last_refreshed ?? latest?.refreshed_at ?? latest?.updated_at ?? payload?.last_refreshed ?? payload?.updated_at,
    ),
  };
}

export async function fetchHome(): Promise<any> {
  const res = await fetch('/api/latest/home', { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, 'Failed to fetch home feed'));
  }

  return res.json();
}

export async function fetchProvider(provider: Provider): Promise<ProviderResult> {
  const res = await fetch(`/api/latest/providers/${provider}`, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error(await extractErrorMessage(res, `Failed to fetch ${provider} feed`));
  }

  const data = await res.json();
  if (process.env.NODE_ENV !== 'production') {
    const latest = data?.latest_result ?? data?.result ?? data;
    console.log('[slot-debug]', provider, Object.keys(latest ?? {}), latest?.slot_layout);
  }
  return normalizeProviderResult(data);
}
