'use client';

import {useEffect,useState} from 'react';
import {getCurrentUserEntitlement,type CurrentUserEntitlement} from './member-entitlement';
import {initMemberState,readMemberAuthUserId,readMemberState,subscribeMemberState,type MemberState} from './member-state';

export function useMemberEntitlementCheck() {
 const [memberState,setMemberState]=useState<MemberState|null>(null);
 const [entitlement,setEntitlement]=useState<CurrentUserEntitlement|null>(null);
 const [entitlementLoading,setEntitlementLoading]=useState(true);
 const [attempt,setAttempt]=useState(0);
 useEffect(()=>{
  let alive=true,sequence=0;
  let account:string|undefined;
  function check(member:MemberState) {
   setMemberState(member);
   const authUserId=readMemberAuthUserId();
   const nextAccount=authUserId!==undefined
    ? authUserId===null?'guest':`session:${authUserId}`
    : member.loggedIn?`unconfirmed:${member.email}`:'guest';
   if(account!==nextAccount) {
    account=nextAccount;
    // Immediately clear access on sign-out or account switch.
    setEntitlement(null);
    setEntitlementLoading(true);
   }
   const id=++sequence;
   void getCurrentUserEntitlement().then(value=>{
    if(alive&&sequence===id){
     const unverified=value.source==='supabase_unconfigured'||(member.loggedIn && value.source==='not_logged_in');
     setEntitlement(unverified?{...value,source:'error'}:value);
     setEntitlementLoading(false);
    }
   });
  }
  initMemberState();
  check(readMemberState());
  const unsubscribe=subscribeMemberState(check);
  return ()=>{alive=false;unsubscribe();};
 },[attempt]);
 return {memberState,entitlement,entitlementLoading,retryEntitlement:()=>setAttempt(n=>n+1)};
}
