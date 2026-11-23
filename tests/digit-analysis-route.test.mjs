import {test} from 'node:test';
import assert from 'node:assert/strict';
import {GET} from '../src/app/api/digit-analysis-pro/route.ts';

const supabase='https://auth.example.invalid';
const token='aaaa.bbbb.cccc';
const premium={is_logged_in:true,is_pro:true,plan:'premium',membership_status:'premium',access_source:'user_entitlement',device_premium_active:true,device_trial_active:false,current_period_end:null,can_access_ai_core:true,can_access_hit_history:true};
const trial={...premium,plan:'trial',membership_status:'trial_active',device_premium_active:false,device_trial_active:true,current_period_end:'2099-01-01T00:00:00Z'};
const free={...premium,is_pro:false,plan:'free',membership_status:'free_user',device_premium_active:false,can_access_ai_core:false,can_access_hit_history:false};
const modes=['single','double','triple'];
const trackerUrls=modes.map(mode=>'https://data.4dai88.com/latest/'+mode+'-digit-tracker/'+mode+'_digit_tracker.json');

async function run(t,{bearer=token,rpc=[premium],expired=false,feedFault=false}={}){
 const oldUrl=process.env.NEXT_PUBLIC_SUPABASE_URL, oldKey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 process.env.NEXT_PUBLIC_SUPABASE_URL=supabase;
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY='publishable-fixture';
 t.after(()=>{
  for(const [name,value] of [['NEXT_PUBLIC_SUPABASE_URL',oldUrl],['NEXT_PUBLIC_SUPABASE_ANON_KEY',oldKey]]){
   if(value===undefined)delete process.env[name];else process.env[name]=value;
  }
 });
 const calls=[],unexpected=[];
 t.mock.method(globalThis,'fetch',async(input,init)=>{
  const url=String(input), headers=new Headers(init?.headers); calls.push({url,headers,init});
  if(url===supabase+'/auth/v1/user')return expired?Response.json({message:'JWT expired',code:'bad_jwt'},{status:401}):Response.json({id:'00000000-0000-4000-8000-000000000001'});
  if(url===supabase+'/rest/v1/rpc/get_user_access_state')return Response.json(rpc);
  const index=trackerUrls.indexOf(url);
  if(index<0){unexpected.push(url);return Response.json({}, {status:500});}
  if(feedFault&&index===1)return new Response('bad tracker', {headers:{'content-type':'application/json'}});
  return Response.json({providers:{magnum:[{digits:[{digit:1}]},{doubles:[{double:'11',filters:{all23:{current_gap:3,heat:{last_5:0,last_10:2,last_30:7}},top3:{current_gap:5,heat:{last_20:1,last_50:3,last_100:9}}}}]},{all23:[{digit:1,p95:3}]}][index]},removeMe:true});
 });
 const response=await GET(new Request('https://candidate.example.invalid/api/digit-analysis-pro',{headers:bearer===null?{}:{Authorization:'Bearer '+bearer}}));
 assert.deepEqual(unexpected,[]);
 assert.equal(response.headers.get('cache-control'),'private, no-store, max-age=0');
 assert.equal(response.headers.get('cloudflare-cdn-cache-control'),'no-store');
 assert.equal(response.headers.get('vary'),'Authorization');
 return {status:response.status,body:await response.json(),calls};
}

test('guest never calls external endpoints',async t=>{
 const r=await run(t,{bearer:null});
 assert.deepEqual(r,{status:401,body:{error:'unauthenticated'},calls:[]});
});
test('invalid token format never calls external endpoints',async t=>{
 const r=await run(t,{bearer:'bad-token'});
 assert.deepEqual(r,{status:401,body:{error:'unauthenticated'},calls:[]});
});
test('expired token stops after Auth without RPC or tracker',async t=>{
 const r=await run(t,{expired:true});
 assert.deepEqual([r.status,r.body,r.calls.length],[401,{error:'unauthenticated'},1]);
});
test('Free stops after signed entitlement without calling tracker',async t=>{
 const r=await run(t,{rpc:[free]});
 assert.deepEqual([r.status,r.body,r.calls.length],[403,{error:'forbidden'},2]);
});
test('malformed or ambiguous signed entitlement returns unavailable',async t=>{
 const r=await run(t,{rpc:[premium,premium]});
 assert.deepEqual([r.status,r.body,r.calls.length],[503,{error:'unavailable'},2]);
});
for(const [kind,row] of [['Pro',premium],['Trial',trial]])test(kind+' reads only three fixed feeds without forwarding JWT',async t=>{
 const r=await run(t,{rpc:[row]});
 assert.equal(r.status,200);
 assert.deepEqual(Object.keys(r.body.bundle),modes);
 assert.deepEqual(r.calls.slice(2).map(c=>c.url),trackerUrls);
 assert.equal(r.calls[0].headers.get('authorization'),'Bearer '+token);
 assert.equal(r.calls[1].headers.get('authorization'),'Bearer '+token);
 assert.deepEqual(JSON.parse(r.calls[1].init.body),{p_platform:'web'});
 for(const call of r.calls.slice(2)){
  assert.equal(call.headers.get('authorization'),null);
  assert.equal(call.headers.get('apikey'),null);
  assert.equal(call.init.cache,'no-store');
  assert.equal(call.init.redirect,'error');
 }
 assert.ok(!JSON.stringify(r.body).includes('removeMe'));
});
test('one malformed feed returns no partial tracker data',async t=>{
 const r=await run(t,{feedFault:true});
 assert.deepEqual([r.status,r.body,r.calls.length],[503,{error:'unavailable'},5]);
});
