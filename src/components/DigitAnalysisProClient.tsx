'use client';
import {useEffect,useRef,useState,type ReactNode} from 'react';
import Link from 'next/link';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import {useTracker} from '@/lib/digit-analysis/use-tracker';
import {trackerCopy} from '@/lib/digit-analysis/localization';
import type {Locale} from '@/i18n/routing';
import {drawIdentity,FILTERS,heatWindows,labelFor,number,object,rowsFor,type Mode,type PrizeFilter,type TrackerBundle} from '@/lib/digit-analysis/model';
import {regions} from '@/lib/providers';
import {providerLogoPath} from '@/lib/provider-logo';
import {metricSections,stateLabel} from '@/lib/digit-analysis/presentation';
import './digit-analysis-pro.css';
const PROVIDER_ORDER=['magnum','da_ma_cai','sports_toto','sarawak','sabah88','sandakan','singapore','grand_dragon','nine_lotto'];
const providerOptions=PROVIDER_ORDER.flatMap(code=>regions.flatMap(group=>group.providers).filter(provider=>provider.code===code));
const MODES:Mode[]=['single','double','triple'];
const fmt=(v:unknown,locale:Locale)=>{const n=number(v);return n===null?'--':n.toLocaleString(locale,{maximumFractionDigits:0});};
export function DigitAnalysisProClient({locale}:{locale:Locale}){
 const copy=trackerCopy[locale],homeHref=`/${locale}/tools`,pageHref=`${homeHref}/digit-analysis-pro`;
 const [attempt,setAttempt]=useState(0),[signInError,setSignInError]=useState(false);
 const state=useTracker(attempt);
 const signIn=async()=>{
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setSignInError(true);return;}
  setSignInError(false);
  try{
   const redirectTo=`${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(pageHref)}`;
   const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo}});
   if(error)setSignInError(true);
  }catch{setSignInError(true);}
 };
 const header=<div className="dp-heading"><Link href={homeHref}>{copy.back}</Link><h1>{copy.title}</h1></div>;
 if(state.status!=='ready')return <main className="digit-pro">{header}
  <section className="dp-security" aria-live="polite">
   <p>{state.status==='loading'?copy.loading:state.status==='guest'?copy.guest:state.status==='locked'?copy.locked:copy.error}</p>
   {state.status==='guest'&&<button type="button" className="dp-access-action" onClick={signIn}>{copy.signIn}</button>}
   {state.status==='locked'&&<Link className="dp-access-action" href={`/${locale}/account`}>{copy.account}</Link>}
   {state.status==='error'&&<button type="button" className="dp-access-action" onClick={()=>setAttempt(n=>n+1)}>{copy.retry}</button>}
   {signInError&&<p role="alert">{copy.error}</p>}
  </section>
 </main>;
 return <TrackerAnalysis locale={locale} bundle={state.bundle} header={header}/>;
}
function TrackerAnalysis({locale,bundle,header}:{locale:Locale;bundle:TrackerBundle;header:ReactNode}){
 const copy=trackerCopy[locale],names=copy.modes,filterNames=copy.filters;
 const [mode,setMode]=useState<Mode>('single'),[provider,setProvider]=useState('magnum'),[doubleFilter,setDoubleFilter]=useState<PrizeFilter>('all23'),[tripleFilter,setTripleFilter]=useState<PrizeFilter>('all23'),[selected,setSelected]=useState<string|null>(null),[showGuide,setShowGuide]=useState(false);
 const filter=mode==='triple'?tripleFilter:mode==='double'?doubleFilter:'all23';
 const rows=rowsFor(bundle,mode,provider,filter),identity=drawIdentity(bundle,mode,provider);
 const chooseMode=(next:Mode)=>{setMode(next);setSelected(null);};
 return <main className="digit-pro">
  {header}
  <section className="dp-provider" aria-label={copy.chooseProvider}><h2>{copy.chooseProvider}</h2>
   <div className="dp-provider-rail" aria-label={copy.providerOptions}>{providerOptions.map(p=><button type="button" className={provider===p.code?'active':''} key={p.code} aria-label={p.name} aria-pressed={provider===p.code} onClick={()=>{setProvider(p.code);setSelected(null);}}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={providerLogoPath(p.code)??''} alt="" width="44" height="44" /></button>)}</div>
  </section>
  <div className="dp-tabs" role="group" aria-label={copy.modeLabel}>{MODES.map(m=><button type="button" key={m} aria-pressed={mode===m} onClick={()=>chooseMode(m)} className={mode===m?'active':''}>{names[m]}</button>)}</div>
  {mode!=='single'&&<div className="dp-filters" role="group" aria-label={copy.filterLabel}>{FILTERS.map(f=><button type="button" key={f} aria-pressed={filter===f} onClick={()=>{if(mode==='double')setDoubleFilter(f);else setTripleFilter(f);setSelected(null);}} className={filter===f?'active':''}>{filterNames[f]}</button>)}</div>}
  {mode==='single'&&rows.length>0&&<DrawHeader mode={mode} identity={identity} locale={locale}/>}
  {(mode!=='single'||rows.length>0)&&<button type="button" className="dp-guide" onClick={()=>setShowGuide(true)}><span aria-hidden="true">ⓘ</span> {copy.guide}</button>}
  {mode!=='single'&&rows.length>0&&<DrawHeader mode={mode} identity={identity} locale={locale}/>}
  {showGuide&&<DetailSheet title={copy.guideTitles[mode]} onClose={()=>setShowGuide(false)} close={copy.close}><div className="dp-guide-content"><dl>{copy.guides[mode].map(([term,explanation])=><div key={term}><dt>{term}</dt><dd>{explanation}</dd></div>)}</dl><p>{copy.disclaimer}</p></div></DetailSheet>}
  <section className="dp-grid" aria-label={copy.results}>{rows.map((row,index)=>{const label=labelFor(row,mode),open=selected===label;return <article key={`${label}-${index}`} className={`dp-card ${open?'expanded':''}`}>
   <button className="dp-card-head" aria-expanded={open} aria-controls={`detail-${index}`} onClick={()=>setSelected(open?null:label)}><span className="dp-number">{label}</span><span className="dp-card-overview">{mode==='single'?<><span className={`dp-state ${String(row.current_state)}`}>{stateLabel(row.current_state,locale)}</span><span>{copy.metrics.occurrences} <strong>{fmt(row.current_occurrences,locale)}</strong></span><span>{copy.metrics.streak} <strong>{fmt(row.current_streak,locale)}{row.current_streak==null?'':copy.rounds}</strong></span><span className="dp-single-heat">{heatWindows(mode,filter).map(w=><span key={w}>{copy.recent(w)} <strong>{fmt(object(object(row.heat)[`last_${w}`]).occurrences,locale)}</strong></span>)}</span></>:<><span>{copy.metrics.gap} <strong>{fmt(row.current_gap,locale)}{row.current_gap==null?'':copy.rounds}</strong></span><span>{copy.metrics.longest} <strong>{fmt(mode==='double'?row.historical_max_gap:row.historical_max,locale)}{(mode==='double'?row.historical_max_gap:row.historical_max)==null?'':copy.rounds}</strong></span></>}</span><span className="dp-toggle" aria-hidden="true">{open?'−':'+'}</span></button>
   {open&&<DetailSheet title={names[mode]} badge={label} subtitle={mode==='double'?filterNames[filter]:undefined} onClose={()=>setSelected(null)} close={copy.close}>
    <div id={`detail-${index}`} className="dp-detail">{metricSections(row,mode,filter,locale).map(section=><section key={section.title} className="dp-detail-section"><h3>{section.title}</h3><dl>{section.rows.map(([name,value])=><div key={name} className="dp-metric"><dt>{name}</dt><dd>{value}</dd></div>)}</dl></section>)}</div>
   </DetailSheet>}
  </article>})}</section>
  {rows.length===0&&<p className="dp-empty">{copy.empty}</p>}
  <p className="dp-disclaimer">{copy.disclaimer}</p>
 </main>;
}
function DrawHeader({mode,identity,locale}:{mode:Mode;identity:{date:string;drawNo:string};locale:Locale}) {
 const copy=trackerCopy[locale];
 const summary=[identity.date,identity.drawNo].filter(Boolean).join('  ')||(mode==='triple'?copy.noDate:'');
 return <section className="dp-draw" aria-label={copy.drawLabel}><h2>{copy.modes[mode]}</h2>{summary&&<p>{summary}</p>}</section>;
}
function DetailSheet({title,badge,subtitle,onClose,close,children}:{title:string;badge?:string;subtitle?:string;onClose:()=>void;close:string;children:ReactNode}){
 const ref=useRef<HTMLDialogElement>(null);
 useEffect(()=>{const dialog=ref.current;dialog?.showModal();return ()=>dialog?.close();},[]);
 return <dialog ref={ref} className="dp-sheet" aria-label={title} onClose={onClose} onClick={event=>{if(event.target===ref.current)onClose();}}><div className="dp-sheet-inner"><div className="dp-sheet-title"><div className="dp-sheet-title-text"><h2>{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button type="button" onClick={onClose}>{close}</button></div>{badge&&<div className="dp-sheet-badge"><span className="dp-number">{badge}</span></div>}{children}</div></dialog>;
}
