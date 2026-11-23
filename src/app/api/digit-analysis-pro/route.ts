import {createClient} from '@supabase/supabase-js';
// @ts-expect-error Node’s built-in TypeScript loader requires the explicit extension.
import {webEntitlementDecision,modes,projectTracker} from '../../../lib/digit-analysis/server-policy.ts';

export const dynamic='force-dynamic';
export const revalidate=0;

const CACHE_HEADERS={'Cache-Control':'private, no-store, max-age=0','CDN-Cache-Control':'no-store','Cloudflare-CDN-Cache-Control':'no-store','Vary':'Authorization'};
const MAX_BYTES=1_000_000;
function reply(status:number,body:unknown){return Response.json(body,{status,headers:CACHE_HEADERS});}
// Workers supports manual redirect only for an explicit no-follow policy.
async function workerFetch(input:RequestInfo|URL,opts?:RequestInit){
 const response=await fetch(input,{...opts,cache:'no-store',redirect:'manual',signal:AbortSignal.timeout(8000)});
 if(response.status>=300&&response.status<400)throw Error('unexpected upstream redirect');
 return response;
}
async function readTracker(mode:(typeof modes)[number]){
 const response=await workerFetch('https://data.4dai88.com/latest/'+mode+'-digit-tracker/'+mode+'_digit_tracker.json',{headers:{Accept:'application/json'}});
 if(!response.ok||!response.body||Number(response.headers.get('content-length'))>MAX_BYTES||!response.headers.get('content-type')?.includes('application/json'))throw Error('invalid response');
 const reader=response.body.getReader();
 const decoder=new TextDecoder('utf-8',{fatal:true});
 let size=0,body='';
 for(;;){
  const result=await reader.read();
  if(result.done)break;
  size+=result.value.byteLength;
  if(size>MAX_BYTES){await reader.cancel();throw Error('tracker too large');}
  body+=decoder.decode(result.value,{stream:true});
 }
 return projectTracker(JSON.parse(body+decoder.decode()),mode);
}
export async function GET(request:Request){
 const bearer=/^Bearer ([A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+)$/i.exec(request.headers.get('authorization')??'');
 const token=bearer?.[1];
 if(!token||token.length>8192)return reply(401,{error:'unauthenticated'});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key)return reply(503,{error:'unavailable'});
 try{
  const supabase=createClient(url,key,{
   auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},
   global:{headers:{Authorization:'Bearer '+token},fetch:workerFetch}
  });
  const identity=await supabase.auth.getUser(token);
  if(identity.error){
   if(identity.error.status===401||identity.error.status===403)return reply(401,{error:'unauthenticated'});
   return reply(503,{error:'unavailable'});
  }
  if(!identity.data.user?.id)return reply(401,{error:'unauthenticated'});
  const {data,error}=await supabase.rpc('get_user_access_state',{p_platform:'web'});
  if(error)return reply(503,{error:'unavailable'});
  const decision=webEntitlementDecision(data);
  if(decision==='unknown')return reply(503,{error:'unavailable'});
  if(decision==='deny')return reply(403,{error:'forbidden'});
  const bundle=Object.fromEntries(await Promise.all(modes.map(async mode=>[mode,await readTracker(mode)])));
  return reply(200,{bundle});
 }catch{return reply(503,{error:'unavailable'});}
}
