import {test} from 'node:test';
import assert from 'node:assert/strict';
import {setTimeout as wait} from 'node:timers/promises';
import {boundedBrowserCheck} from '../src/lib/bounded-browser-check.ts';
import {scopedEntitlementRead} from '../src/lib/scoped-entitlement-read.ts';
import {startTrackerSession,subscribeVerifiedTrackerAuth} from '../src/lib/digit-analysis/tracker-session.ts';

const pending=()=>{let finish;return {promise:new Promise(r=>{finish=r;}),resolve:finish};};
const bundle={single:{providers:{}},double:{providers:{}},triple:{providers:{}}};
function tracker(request=()=>Promise.resolve(Response.json({bundle})),opts={}){
 const history=[];let notify,disconnected=false,calls=[];
 const close=startTrackerSession({subscribe(fn){notify=fn;return()=>{disconnected=true;};},report(value){history.push(value.status);},request(token,signal){calls.push({token,signal});return request(token,signal);},authTimeoutMs:15,dataTimeoutMs:40,...opts});
 return {history,calls,close,notify:(token)=>notify(token),disconnected:()=>disconnected};
}
test('missing INITIAL_SESSION times out, no data call; late authentic event recovers',async()=>{
 const t=tracker();await wait(35);assert.deepEqual(t.history,['loading','error']);assert.equal(t.calls.length,0);
 t.notify('test-session');await wait(20);assert.deepEqual(t.history,['loading','error','loading','ready']);t.close();assert.equal(t.disconnected(),true);
});
test('duplicate same-token events do not restart a request, explicit new lifecycle retries',async()=>{
 const p=pending();const t=tracker(()=>p.promise);t.notify('first');t.notify('first');await wait(10);assert.equal(t.calls.length,1);
 t.notify('first');assert.equal(t.calls.length,1);t.close();assert.equal(t.calls[0].signal.aborted,true);
 const retry=tracker();retry.notify('first');await wait(15);assert.equal(retry.history.at(-1),'ready');retry.close();
});
test('sign-out cancels pending tracker data and ignores late completion',async()=>{
 const p=pending();const t=tracker(()=>p.promise);t.notify('first');await wait(10);t.notify(null);
 p.resolve(Response.json({bundle}));await wait(10);assert.equal(t.calls[0].signal.aborted,true);assert.equal(t.history.at(-1),'guest');assert.ok(!t.history.includes('ready'));t.close();
});
test('tracker data deadline renders error even if response ignores AbortSignal',async()=>{
 const p=pending();const t=tracker(()=>p.promise);t.notify('first');await wait(60);assert.equal(t.history.at(-1),'error');assert.equal(t.calls[0].signal.aborted,true);
 p.resolve(Response.json({bundle}));await wait(10);assert.equal(t.history.at(-1),'error');t.close();
});
test('session 401 and 403 still deny, auth setup failure shows error',async()=>{
 for(const [code,expected] of [[401,'guest'],[403,'locked']]){
  const t=tracker(()=>Promise.resolve(new Response(null,{status:code})));t.notify('first');await wait(12);assert.equal(t.history.at(-1),expected);t.close();
 }
 const t=tracker(undefined,{subscribe(){throw Error('not configured');}});assert.deepEqual(t.history,['loading','error']);t.close();
});
test('bounded member UI handles reject/deadline and rejects stale completion',async()=>{
 const b=boundedBrowserCheck(20),p=pending(),events=[];
 b.start(()=>p.promise,r=>events.push(r));await wait(30);assert.deepEqual(events,[{ok:false}]);
 p.resolve('stale');await wait(5);assert.deepEqual(events,[{ok:false}]);
 b.start(async()=>{throw Error('bad fixture');},r=>events.push(r));await wait(10);assert.deepEqual(events,[{ok:false},{ok:false}]);
 b.start(async()=>true,r=>events.push(r));await wait(10);assert.deepEqual(events.at(-1),{ok:true,value:true});
});
test('shared signed reader coalesces consumers, never caches a positive response',async()=>{
 let calls=0;const next=scopedEntitlementRead(()=>1,async()=>++calls,()=>-1,30);
 const a=next(),b=next();assert.equal(a,b);assert.equal(await b,1);assert.equal(await next(),2);
});
test('shared signed reader invalidates previous identity, ignores late Pro, fails closed on timeout',async()=>{
 let id=1,signals=[];const p=pending(),q=pending();
 const next=scopedEntitlementRead(()=>id,signal=>{signals.push(signal);return signals.length===1?p.promise:q.promise;},()=>false,25);
 const old=next();await wait(8);id++;const newest=next();p.resolve(true);
 assert.equal(await old,false);assert.equal(signals[0].aborted,true);assert.equal(await newest,false);assert.equal(signals[1].aborted,true);
});


test('a new tracker session cannot be overwritten by late old-token data',async()=>{
 const a=pending(),b=pending();const t=tracker(token=>token==='old'?a.promise:b.promise,{dataTimeoutMs:100});
 t.notify('old');await wait(8);t.notify('new');await wait(8);
 assert.equal(t.calls[0].signal.aborted,true);
 b.resolve(Response.json({bundle}));await wait(8);
 a.resolve(Response.json({bundle}));await wait(8);
 assert.deepEqual(t.history,['loading','loading','loading','ready']);
 t.close();
});
test('INITIAL_SESSION null plus technical error is unknown, not signed out',async()=>{
 let emit;const out=[];
 const stop=subscribeVerifiedTrackerAuth({subscribe(fn){emit=fn;return()=>{};},async confirmInitial(){return {known:false,token:null};}},t=>out.push(t),()=>out.push('unknown'));
 emit('INITIAL_SESSION',null);assert.deepEqual(out,[]);await wait(8);
 assert.deepEqual(out,['unknown']);emit('SIGNED_IN','valid');assert.deepEqual(out,['unknown','valid']);stop();
});
test('late guest confirmation cannot clear newer signed-in state',async()=>{
 let emit;const out=[],confirmation=pending();
 const stop=subscribeVerifiedTrackerAuth({subscribe(fn){emit=fn;return()=>{};},confirmInitial(){return confirmation.promise;}},t=>out.push(t),()=>out.push('unknown'));
 emit('INITIAL_SESSION',null);await wait(8);emit('SIGNED_IN','valid');
 confirmation.resolve({known:true,token:null});await wait(8);assert.deepEqual(out,['valid']);stop();
});
test('confirmed guest remains guest; failed session confirmation allows manual retry',async()=>{
 for(const [confirm,expected] of [[async()=>({known:true,token:null}),null],[async()=>{throw Error('fixture');},'unknown']]){
  let emit;const out=[];
  const stop=subscribeVerifiedTrackerAuth({subscribe(fn){emit=fn;return()=>{};},confirmInitial:confirm},t=>out.push(t),()=>out.push('unknown'));
  emit('INITIAL_SESSION',null);await wait(8);assert.deepEqual(out,[expected]);stop();
 }
});
