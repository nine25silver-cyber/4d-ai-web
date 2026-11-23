/** Mirrors Android tracker feed mappings. Values are precomputed upstream, never predictions. */
export type Mode = 'single' | 'double' | 'triple';
export type PrizeFilter = 'all23' | 'top3' | 'special' | 'consolation';
export type Row = Record<string, unknown>;
export type TrackerFeed = {providers: Record<string, Row>; latest_draw_date?: string};
export type TrackerBundle = Record<Mode, TrackerFeed>;
export const FILTERS: PrizeFilter[] = ['all23', 'top3', 'special', 'consolation'];
export function object(value: unknown): Row { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}; }
export function number(value: unknown): number | null {
  if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) return null;
  const result = typeof value === 'number' ? value : typeof value === 'string' ? Number(value) : NaN;
  return Number.isFinite(result) ? result : null;
}
export function integer(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? Math.trunc(value) : null;
  if (typeof value !== 'string' || !/^[+-]?\d+$/.test(value.trim())) return null;
  const n=Number(value.trim());return Number.isFinite(n)?n:null;
}
export function text(value: unknown): string | null { if(value===null||value===undefined)return null;return String(value).trim()||null; }
function normalizeRow(row:Row):Row {
 const out={...row};
 for(const key of ['digit','current_gap','current_occurrences','current_streak','historical_max_gap','total_hits','historical_max'])if(key in out)out[key]=integer(out[key]);
 for(const key of ['average_gap','median_gap','p80','p90','p95','current_over_p95','current_over_max'])if(key in out)out[key]=number(out[key]);
 return out;
}
export function rowsFor(bundle: TrackerBundle, mode: Mode, provider: string, filter: PrizeFilter): Row[] {
  const data = bundle[mode].providers[provider];
  if (!data) return [];
  const rows = mode === 'single' ? data.digits : mode === 'double' ? data.doubles : data[filter];
  if (!Array.isArray(rows)) return [];
  const mapped = rows.map(object).filter(row=>Object.keys(row).length>0).map(normalizeRow);
  if (mode === 'single') return mapped.filter(row=>integer(row.digit)!==null); // The App preserves source order.
  if (mode === 'double') return mapped.filter(row=>text(row.double)!==null && Object.keys(object(row.filters)).length>0).map<Row>(row => ({...normalizeRow(object(object(row.filters)[filter])), double: text(row.double)})).sort((a,b) => (number(b.current_gap) ?? -1) - (number(a.current_gap) ?? -1));
  const ratio = (row: Row) => { const p95=number(row.p95),gap=integer(row.current_gap); return p95 !== null && p95 > 0 && gap !== null ? gap/p95 : -1; };
  return mapped.filter(row=>integer(row.digit)!==null).sort((a,b) => ratio(b)-ratio(a) || (number(b.current_gap) ?? -1)-(number(a.current_gap) ?? -1));
}
export function drawIdentity(bundle: TrackerBundle, mode: Mode, provider: string) {
  const feed=bundle[mode], row=feed.providers[provider] ?? {};
  return {date: text(row.draw_date) ?? (mode === 'triple' ? '' : text(feed.latest_draw_date)) ?? '', drawNo: text(row.draw_no) ?? ''};
}
export function labelFor(row: Row, mode: Mode): string { const value=text(mode==='double'?row.double:row.digit)??'—'; return mode==='triple' && /^\d$/.test(value) ? value.repeat(3):value; }
export function heatWindows(mode: Mode, filter: PrizeFilter): number[] { return mode === 'single' ? [3,5,10] : filter === 'top3' ? [20,50,100] : [5,10,30]; }
