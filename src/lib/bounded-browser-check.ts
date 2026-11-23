type Outcome<T> = {ok:true;value:T} | {ok:false};

/** A bounded, latest-only UI check. Defer starting it outside auth callbacks. */
export function boundedBrowserCheck<T>(timeoutMs:number) {
  let cancelCurrent:(()=>void)|undefined;
  function cancel() {cancelCurrent?.();}
  function start(read:(signal:AbortSignal)=>Promise<T>, report:(outcome:Outcome<T>)=>void) {
    cancel();
    const controller=new AbortController();
    let done=false;
    const clear=(abort:boolean)=>{
      if(done)return false;
      done=true;
      clearTimeout(queued);
      clearTimeout(deadline);
      cancelCurrent=undefined;
      if(abort)controller.abort();
      return true;
    };
    const finish=(outcome:Outcome<T>)=>{
      if(clear(!outcome.ok))report(outcome);
    };
    const queued=setTimeout(()=>{
      void Promise.resolve().then(()=>done?undefined:read(controller.signal)).then(value=>{
        if(!done)finish({ok:true,value:value as T});
      },()=>finish({ok:false}));
    },0);
    const deadline=setTimeout(()=>finish({ok:false}),timeoutMs);
    cancelCurrent=()=>{clear(true);};
  }
  return {start,cancel,pending:()=>Boolean(cancelCurrent)};
}
