// @ts-expect-error Node’s built-in TypeScript loader requires the explicit extension.
import {boundedBrowserCheck} from '../bounded-browser-check.ts';
import type {TrackerBundle} from './model.ts';

export type TrackerState={status:'loading'|'guest'|'locked'|'error'}|{status:'ready';bundle:TrackerBundle};

type Params={
 subscribe:(onToken:(token:string|null)=>void,onUnknown:()=>void)=>()=>void;
 request:(token:string,signal:AbortSignal)=>Promise<Response>;
 report:(state:TrackerState)=>void;
 authTimeoutMs?:number;
 dataTimeoutMs?:number;
};

export function startTrackerSession({subscribe,request,report,authTimeoutMs=12000,dataTimeoutMs=20000}:Params) {
 let active=true;
 let latestToken:string|null|undefined;
 let unsubscribe:(()=>void)|undefined;
 const check=boundedBrowserCheck<TrackerState>(dataTimeoutMs);
 report({status:'loading'});
 const authDeadline=setTimeout(()=>{
  if(active&&latestToken===undefined)report({status:'error'});
 },authTimeoutMs);
 const onToken=(token:string|null)=>{
  if(!active||token===latestToken)return;
  latestToken=token;
  clearTimeout(authDeadline);
  if(!token){check.cancel();report({status:'guest'});return;}
  report({status:'loading'});
  check.start(async signal=>{
   const response=await request(token,signal);
   if(response.status===401)return {status:'guest'};
   if(response.status===403)return {status:'locked'};
   if(!response.ok)return {status:'error'};
   const {bundle}=await response.json() as {bundle?:TrackerBundle};
   return bundle?.single?.providers&&bundle.double?.providers&&bundle.triple?.providers
    ? {status:'ready',bundle} : {status:'error'};
  },result=>{
   if(active)report(result.ok?result.value:{status:'error'});
  });
 };
 const onUnknown=()=>{
  if(active&&latestToken===undefined){clearTimeout(authDeadline);report({status:'error'});}
 };
 try {unsubscribe=subscribe(onToken,onUnknown);}
 catch {
  clearTimeout(authDeadline);
  check.cancel();
  report({status:'error'});
 }
 return ()=>{
  active=false;
  clearTimeout(authDeadline);
  check.cancel();
  unsubscribe?.();
 };
}


type AuthSource={
 subscribe:(notify:(event:string,token:string|null)=>void)=>()=>void;
 confirmInitial:()=>Promise<{known:boolean;token:string|null}>;
};

export function subscribeVerifiedTrackerAuth(source:AuthSource,onToken:(token:string|null)=>void,onUnknown:()=>void){
 let active=true,seen=false,sequence=0;
 let pending:ReturnType<typeof setTimeout>|undefined;
 const unsubscribe=source.subscribe((event,token)=>{
  if(!active)return;
  if(event==='INITIAL_SESSION'&&seen)return;
  if(!['INITIAL_SESSION','SIGNED_IN','SIGNED_OUT','TOKEN_REFRESHED','USER_UPDATED'].includes(event))return;
  seen=true;
  const id=++sequence;
  clearTimeout(pending);
  if(event==='INITIAL_SESSION'&&!token){
   // INITIAL_SESSION(null) can also mean the SDK's session read errored.
   pending=setTimeout(()=>{
    void Promise.resolve().then(()=>source.confirmInitial()).then(result=>{
     if(!active||sequence!==id)return;
     if(result.known)onToken(result.token);
     else onUnknown();
    },()=>{
     if(active&&sequence===id)onUnknown();
    });
   },0);
   return;
  }
  onToken(token);
 });
 return ()=>{active=false;++sequence;clearTimeout(pending);unsubscribe();};
}
