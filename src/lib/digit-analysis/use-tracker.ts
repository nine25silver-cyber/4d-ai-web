'use client';

import {useEffect,useState} from 'react';
import {getSupabaseBrowserClient} from '@/lib/supabase-browser';
import {startTrackerSession,subscribeVerifiedTrackerAuth,type TrackerState} from './tracker-session';

export function useTracker(attempt:number):TrackerState {
 const [state,setState]=useState<TrackerState>({status:'loading'});
 useEffect(()=>startTrackerSession({
  subscribe(onToken,onUnknown){
   const supabase=getSupabaseBrowserClient();
   if(!supabase)throw Error('Auth unavailable');
   return subscribeVerifiedTrackerAuth({
    subscribe(notify){
     const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>notify(event,session?.access_token??null));
     return ()=>subscription.unsubscribe();
    },
    async confirmInitial(){
     const {data,error}=await supabase.auth.getSession();
     return {known:!error,token:data.session?.access_token??null};
    }
   },onToken,onUnknown);
  },
  request:(token,signal)=>fetch('/api/digit-analysis-pro',{
   headers:{Authorization:`Bearer ${token}`},cache:'no-store',credentials:'same-origin',signal
  }),
  report:setState
 }),[attempt]);
 return state;
}
