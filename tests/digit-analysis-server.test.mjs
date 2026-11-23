import {test} from 'node:test';
import assert from 'node:assert/strict';
import {webEntitlementDecision,projectTracker} from '../src/lib/digit-analysis/server-policy.ts';
const now=Date.parse('2026-11-23');
const premium={is_logged_in:true,is_pro:true,plan:'premium',membership_status:'premium',access_source:'user_entitlement',device_premium_active:true,device_trial_active:false,current_period_end:null,can_access_ai_core:true,can_access_hit_history:true};
test('premium lifetime and authoritative grace allow',()=>{
 for(const current_period_end of [null,'2026-10-01','2026-12-01'])assert.equal(webEntitlementDecision([{...premium,current_period_end}],now),'allow');
});
test('active trial requires future expiry, precise tuple',()=>{
 const trial={...premium,plan:'trial',membership_status:'trial_active',device_premium_active:false,device_trial_active:true};
 assert.equal(webEntitlementDecision([{...trial,current_period_end:'2026-12-01'}],now),'allow');
 assert.equal(webEntitlementDecision([{...trial,current_period_end:'2026-10-01'}],now),'deny');
 assert.equal(webEntitlementDecision([trial],now),'unknown');
});
test('free denies and ambiguous, invalid, legacy state fails closed',()=>{
 const free={...premium,device_premium_active:false,is_pro:false,plan:'free',membership_status:'free_user'};
 assert.equal(webEntitlementDecision([free],now),'deny');
 for(const data of [[],premium,[premium,premium],[{...premium,is_logged_in:false}],[{...premium,access_source:'legacy_membership'}],[{...premium,current_period_end:'garbage'}]])assert.equal(webEntitlementDecision(data,now),'unknown');
});
test('tracker excludes unused providers/fields and rejects malformed records',()=>{
 const raw={secret:'NO',providers:{magnum:{digits:[{digit:0,private:'NO',heat:{last_3:{occurrences:4,key:'NO'}}}]},other:{digits:[]}}};
 assert.deepEqual(projectTracker(raw,'single'),{providers:{magnum:{digits:[{digit:0,heat:{last_3:{occurrences:4}}}]}}});
 assert.throws(()=>projectTracker({providers:{magnum:{digits:[false]}}},'single'));
});
test('real Double schema uses scalar heat counts; projection preserves normal and Top3 windows',()=>{
 const raw={providers:{da_ma_cai:{doubles:[{double:'00',filters:{
  all23:{current_gap:2,heat:{last_5:0,last_10:3,last_30:7}},
  top3:{current_gap:1,heat:{last_20:3,last_50:9,last_100:18}}
 }}]}}};
 const row=projectTracker(raw,'double').providers.da_ma_cai.doubles[0];
 assert.deepEqual(row.filters.all23.heat,{last_5:{occurrences:0},last_10:{occurrences:3},last_30:{occurrences:7}});
 assert.deepEqual(row.filters.top3.heat,{last_20:{occurrences:3},last_50:{occurrences:9},last_100:{occurrences:18}});
});
