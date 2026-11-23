type Row = Record<string, unknown>;
const isRow=(v:unknown): v is Row=> typeof v==='object'&&v!==null&&!Array.isArray(v);
export function webEntitlementDecision(data:unknown,now=Date.now()):'allow'|'deny'|'unknown'{
 if(!Array.isArray(data)||data.length!==1||!isRow(data[0]))return 'unknown';
 const r=data[0];
 if(r.is_logged_in!==true||r.access_source!=='user_entitlement'||typeof r.device_trial_active!=='boolean'||typeof r.device_premium_active!=='boolean')return 'unknown';
 const expiry=r.current_period_end===null?null:typeof r.current_period_end==='string'?Date.parse(r.current_period_end):NaN;
 if(Number.isNaN(expiry))return 'unknown';
 if(r.is_pro===false&&r.plan==='free'&&r.membership_status==='free_user'&&r.device_trial_active===false&&r.device_premium_active===false&&expiry===null)return 'deny';
 if(r.is_pro!==true||r.can_access_ai_core!==true||r.can_access_hit_history!==true)return 'unknown';
 // The authoritative RPC includes lifetime and active grace/buffer states.
 if(r.plan==='premium'&&r.membership_status==='premium'&&r.device_premium_active===true)return 'allow';
 if(r.plan==='trial'&&r.membership_status==='trial_active'&&r.device_trial_active===true&&r.device_premium_active===false&&expiry!==null)return expiry>now?'allow':'deny';
 return 'unknown';
}
const providers=['magnum','da_ma_cai','sports_toto','sarawak','sabah88','sandakan','singapore','grand_dragon','nine_lotto'];
const filters=['all23','top3','special','consolation'];
export const modes=['single','double','triple'] as const;
type Mode=typeof modes[number];
function pick(row:unknown,fields:string[]):Row{
 if(!isRow(row))throw Error('invalid tracker row');
 return Object.fromEntries(fields.filter(key=>Object.hasOwn(row,key)).map(key=>{
  const value=row[key];
  if(value!==null&&!(typeof value==='number'&&Number.isFinite(value))&&!(typeof value==='string'&&value.length<=64)&&typeof value!=='boolean')throw Error('invalid tracker value');
  return [key,value];
 }));
}
function heat(value:unknown):Row{
 if(value==null)return {};
 if(!isRow(value))throw Error('invalid heat');
 return Object.fromEntries([3,5,10,20,30,50,100].filter(n=>Object.hasOwn(value,'last_'+n)&&value['last_'+n]!=null).map(n=>['last_'+n,pick(value['last_'+n],['occurrences','expected','vs_expected_pct'])]));
}
// The double tracker publishes scalar counts, unlike single's detailed heat objects.
function doubleHeat(value:unknown):Row{
 if(value==null)return {};
 if(!isRow(value))throw Error('invalid double heat');
 return Object.fromEntries([5,10,20,30,50,100].filter(n=>Object.hasOwn(value,'last_'+n)&&value['last_'+n]!=null).map(n=>{
  const raw=value['last_'+n];
  const count=typeof raw==='number'?Math.trunc(raw):typeof raw==='string'&&/^[+-]?\d+$/.test(raw.trim())?Number(raw):NaN;
  if(!Number.isSafeInteger(count)||count<0)throw Error('invalid double heat count');
  return ['last_'+n,{occurrences:count}];
 }));
}
export function projectTracker(value:unknown,mode:Mode){
 if(!isRow(value)||!isRow(value.providers))throw Error('invalid tracker');
 const source=value.providers;
 const projectRows=(value:unknown,project:(r:Row)=>Row)=>{
  if(!Array.isArray(value)||value.length>100||value.some(r=>!isRow(r)))throw Error('invalid tracker rows');
  return value.map(project);
 };
 const projected=Object.fromEntries(providers.filter(code=>Object.hasOwn(source,code)).map(code=>{
  const row=source[code];if(!isRow(row))throw Error('invalid provider');
  const identity=pick(row,['draw_date','draw_no']);
  if(mode==='single')return [code,{...identity,digits:projectRows(row.digits,r=>({...pick(r,['digit','current_occurrences','current_state','current_streak']),heat:heat(r.heat)}))}];
  if(mode==='double')return [code,{...identity,doubles:projectRows(row.doubles,r=>{
   const entries=r.filters;if(!isRow(entries))throw Error('invalid filters');
   return {...pick(r,['double']),filters:Object.fromEntries(filters.filter(f=>Object.hasOwn(entries,f)).map(f=>{
    const record=entries[f];if(!isRow(record))throw Error('invalid filter');
    return [f,{...pick(record,['current_gap','average_gap','historical_max_gap','last_hit_date','last_hit_draw_no']),heat:doubleHeat(record.heat)}];
   }))};
  })}];
  return [code,{...identity,...Object.fromEntries(filters.filter(f=>Object.hasOwn(row,f)).map(f=>[f,projectRows(row[f],r=>pick(r,['digit','current_gap','average_gap','median_gap','p80','p90','p95','historical_max','last_hit_date','last_hit_draw_no']))]))}];
 }));
 if(!Object.keys(projected).length)throw Error('empty tracker');
 return {...pick(value,['latest_draw_date']),providers:projected};
}
