'use client';

import {useTranslations} from 'next-intl';

export function MemberVerificationNotice({loading,retry}:{loading:boolean;retry:()=>void}) {
 const t=useTranslations('MembershipEntitlement');
 return <div role="status" className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-bold text-amber-900">
  {t(loading?'loading':'checkUnavailable')}
  {!loading&&<button type="button" onClick={retry} className="ml-2 rounded border border-amber-300 bg-white px-2 py-1">{t('retryCheck')}</button>}
 </div>;
}
