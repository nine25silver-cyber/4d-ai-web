/** Coalesce simultaneous checks for only the same Auth revision, never cache a grant. */
export function scopedEntitlementRead<T>(revision:()=>number,read:(signal:AbortSignal)=>Promise<T>,failure:()=>T,timeoutMs:number) {
 let current:{revision:number;promise:Promise<T>;cancel:()=>void}|undefined;
 return ()=>{
  const key=revision();
  if(current?.revision===key)return current.promise;
  current?.cancel();
  let resolve!:(value:T)=>void;
  let completed=false;
  const controller=new AbortController();
  const promise=new Promise<T>(done=>{resolve=done;});
  const settle=(value:T,cancel=false)=>{
   if(completed)return;
   completed=true;
   clearTimeout(start);
   clearTimeout(deadline);
   if(current?.promise===promise)current=undefined;
   if(cancel)controller.abort();
   resolve(value);
  };
  const cancel=()=>settle(failure(),true);
  const start=setTimeout(()=>{
   if(completed||revision()!==key){cancel();return;}
   void Promise.resolve().then(()=>read(controller.signal)).then(value=>{
    if(revision()===key)settle(value);
    else cancel();
   },cancel);
  },0);
  const deadline=setTimeout(cancel,timeoutMs);
  current={revision:key,promise,cancel};
  return promise;
 };
}
