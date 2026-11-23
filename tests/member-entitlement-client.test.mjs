import {build} from 'esbuild';
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {setTimeout as wait} from 'node:timers/promises';

test('actual shared auth/member source defers notifications and denies ambiguity without losing canonical Pro/Free',async()=>{
 const fixture=await build({
  stdin:{contents:`export * from './src/lib/member-state'; export * from './src/lib/member-entitlement';`,resolveDir:process.cwd()},
  platform:'node',bundle:true,format:'esm',write:false,
  plugins:[{name:'offline-auth-fixture',setup(b){
   b.onResolve({filter:/@\/lib\/supabase-browser/},()=>({path:'offline',namespace:'fixture'}));
   b.onLoad({filter:/.*/,namespace:'fixture'},()=>({contents:'export const getSupabaseBrowserClient=()=>globalThis.__offlineMemberSupabase; export const hasSupabaseConfig=()=>true',loader:'js'}));
  }}]
 });
 const source='data:text/javascript;base64,'+Buffer.from(fixture.outputFiles[0].text).toString('base64');
 const handlers=[],events=[],mem=new Map(),win=new EventTarget();
 win.localStorage={getItem:k=>mem.get(k)??null,setItem:(k,v)=>mem.set(k,v)};globalThis.window=win;
 let current={access_token:'fixture-pro',user:{id:'fixture-pro',email:'pro@invalid.example'}};
 let initFallback;
 const firstSession=new Promise(r=>{initFallback=r;});
 let reads=0,rpcReads=0,legacyReads=0,inSdk=false,rpcFailure=false,legacyResult=null;
 const pro={is_logged_in:true,is_pro:true,plan:'premium',membership_status:'premium',current_period_end:null,can_access_ai_core:true,can_access_hit_history:true,access_source:'user_entitlement',device_trial_active:false,device_premium_active:true};
 const free={...pro,is_pro:false,plan:'free',membership_status:'free_user',can_access_ai_core:false,can_access_hit_history:false,device_premium_active:false};
 globalThis.__offlineMemberSupabase={
  auth:{onAuthStateChange(cb){handlers.push(cb);},getSession(){
   assert.equal(inSdk,false,'read called in SDK callback');
   return ++reads===1?firstSession:Promise.resolve({data:{session:current},error:null});
  }},
  rpc(name,params){rpcReads++;assert.equal(name,'get_user_access_state');assert.deepEqual(params,{p_platform:'web'});
   return {abortSignal(signal){assert.equal(signal.aborted,false);
    return Promise.resolve(rpcFailure?{data:null,error:{message:'fixture failure'}}:{data:[current.user.id==='fixture-pro'?pro:free]});
   }};
  },
  from(){legacyReads++;return {select(){return this;},eq(){return this;},abortSignal(){return this;},maybeSingle(){return Promise.resolve({data:legacyResult});}};}
 };
 const lib=await import(source);
 lib.initMemberState();lib.subscribeMemberState(s=>{assert.equal(inSdk,false);events.push(s.loggedIn?s.email:'guest');});
 const notify=(event,session)=>{inSdk=true;try{handlers[0](event,session);}finally{inSdk=false;}};
 notify('SIGNED_IN',current);notify('INITIAL_SESSION',null);initFallback({data:{session:null},error:null});
 assert.deepEqual(events,[]);await wait(15);assert.deepEqual(events,['pro@invalid.example']);
 const first=lib.getCurrentUserEntitlement(),other=lib.getCurrentUserEntitlement();
 assert.equal(first,other);const paid=await first;
 assert.equal(lib.isPaidProEntitlement(paid),true);assert.equal(lib.canAccessAiCore(paid),true);assert.equal(rpcReads,1);
 current={access_token:'fixture-free',user:{id:'fixture-free',email:'free@invalid.example'}};notify('SIGNED_IN',current);
 const unpaid=await lib.getCurrentUserEntitlement();
 assert.equal(unpaid.status,'free_user');assert.equal(lib.canAccessAiCore(unpaid),false);assert.equal(rpcReads,2);assert.equal(legacyReads,0);
 rpcFailure=true;
 const unknown=await lib.getCurrentUserEntitlement();assert.equal(unknown.source,'error');assert.equal(unknown.loggedIn,true);assert.equal(lib.canAccessAiCore(unknown),false);
 legacyResult={user_id:current.user.id,plan:'pro',is_pro:true,status:'active',current_period_end:null,updated_at:null};
 const existingLegacy=await lib.getCurrentUserEntitlement();assert.equal(lib.isPaidProEntitlement(existingLegacy),true);
 current=null;notify('SIGNED_OUT',null);
 const guest=await lib.getCurrentUserEntitlement();assert.equal(guest.source,'not_logged_in');assert.equal(guest.loggedIn,false);
});
