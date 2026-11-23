'use client';

import {useEffect,useState} from 'react';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import type {TrackerBundle} from './model';

type TrackerState={status:'loading'|'guest'|'locked'|'error'}|{status:'ready';bundle:TrackerBundle};
export function useTracker(attempt:number):TrackerState {
 const [state,setState]=useState<TrackerState>({status:'loading'});
 useEffect(()=>{
  const supabase=getSupabaseBrowserClient();
  if(!supabase){setState({status:'error'});return;}
  let active=true, serial=0;
  let request:AbortController|undefined;
  let timer:ReturnType<typeof setTimeout>|undefined;
  const load=(token:string|null)=>{
   const id=++serial;
   request?.abort();clearTimeout(timer);
   if(!token){setState({status:'guest'});return;}
   setState({status:'loading'});
   const controller=new AbortController();
   request=controller;
   // Never await another Supabase request inside its auth-state callback.
   timer=setTimeout(async()=>{
    const timeout=setTimeout(()=>controller.abort(),20000);
    try{
     const result=await fetch('/api/digit-analysis-pro',{headers:{Authorization:`Bearer ${token}`},cache:'no-store',credentials:'same-origin',signal:controller.signal});
     if(!active||id!==serial)return;
     if(result.status===401){setState({status:'guest'});return;}
     if(result.status===403){setState({status:'locked'});return;}
     if(!result.ok){setState({status:'error'});return;}
     const {bundle}=await result.json() as {bundle?:TrackerBundle};
     if(!active||id!==serial)return;
     setState(bundle?.single?.providers&&bundle.double?.providers&&bundle.triple?.providers
      ? {status:'ready',bundle} : {status:'error'});
    }catch{if(active&&id===serial)setState({status:'error'});}
    finally{clearTimeout(timeout);}
   },0);
  };
  setState({status:'loading'});
  const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{
   if(!active)return;
   if(event==='INITIAL_SESSION'||event==='SIGNED_IN'||event==='SIGNED_OUT'||event==='TOKEN_REFRESHED'||event==='USER_UPDATED'){
    load(session?.access_token??null);
   }
  });
  return ()=>{active=false;++serial;clearTimeout(timer);request?.abort();subscription.unsubscribe();};
 },[attempt]);
 return state;
}
