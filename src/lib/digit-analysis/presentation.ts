// @ts-expect-error Node’s built-in TypeScript loader requires the explicit extension.
import {heatWindows,number,object,text,type Mode,type PrizeFilter,type Row} from './model.ts';
// @ts-expect-error Node’s built-in TypeScript loader requires the explicit extension.
import {trackerCopy} from './localization.ts';
import type {Locale} from '@/i18n/routing';

export type MetricSection={title:string;rows:Array<[string,string]>};
export function stateLabel(value:unknown,locale:Locale='zh'){
 const states:Record<string,string>=trackerCopy[locale].states;
 const key=String(value).toLowerCase();
 return Object.hasOwn(states,key)?states[key]:states.average;
}
export function metricValue(value:unknown,unit='',locale:Locale='zh'){
 const n=number(value);
 if(n===null)return '--';
 return n.toLocaleString(locale,{maximumFractionDigits:2,useGrouping:false})+unit;
}
export function metricSections(row:Row,mode:Mode,filter:PrizeFilter,locale:Locale='zh'):MetricSection[]{
 const l=trackerCopy[locale],m=l.metrics;
 const heat=(w:number,key:string)=>object(object(row.heat)[`last_${w}`])[key];
 const windows=heatWindows(mode,filter);
 const rounds=(value:unknown)=>metricValue(value,l.rounds,locale);
 const times=(value:unknown)=>metricValue(value,l.times,locale);
 const gap:Array<[string,string]>=[[m.gap,rounds(row.current_gap)],[m.averageGap,rounds(row.average_gap)]];
 const last:MetricSection={title:m.lastAppearance,rows:[[m.lastDate,text(row.last_hit_date)??'--'],[m.lastDraw,text(row.last_hit_draw_no)??'--']]};
 if(mode==='single')return [
  {title:m.current,rows:[[m.occurrences,times(row.current_occurrences)],[m.state,stateLabel(row.current_state,locale)],[m.streak,rounds(row.current_streak)]]},
  {title:m.recentPerformance,rows:windows.map(w=>[l.recent(w),times(heat(w,'occurrences'))])},
  {title:m.averageComparison,rows:[...windows.map((w):[string,string]=>[l.expected(w),times(heat(w,'expected'))]),...windows.map((w):[string,string]=>[l.comparison(w),metricValue(heat(w,'vs_expected_pct'),'%',locale)])]}
 ];
 if(mode==='double')return [
  {title:m.current,rows:[...gap,[m.longest,rounds(row.historical_max_gap)]]},
  {title:m.recentAppearance,rows:windows.map(w=>[l.recent(w),times(heat(w,'occurrences'))])},
  last
 ];
 return [
  {title:m.current,rows:[...gap,[m.median,rounds(row.median_gap)]]},
  {title:m.historicalRange,rows:[[m.p80,rounds(row.p80)],[m.p90,rounds(row.p90)],[m.p95,rounds(row.p95)],[m.longest,rounds(row.historical_max)]]},
  last
 ];
}
