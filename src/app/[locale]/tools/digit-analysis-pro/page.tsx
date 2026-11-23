import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {DigitAnalysisProClient} from '@/components/DigitAnalysisProClient';
import {routing,type Locale} from '@/i18n/routing';
import {trackerCopy} from '@/lib/digit-analysis/localization';
export const dynamic='force-dynamic';
export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
 const {locale}=await params;
 return {title:trackerCopy[locale as Locale]?.title??trackerCopy.en.title,robots:{index:false,follow:false}};
}
export default async function DigitAnalysisProPage({params}:{params:Promise<{locale:string}>}){
 const {locale}=await params;
 if(!routing.locales.includes(locale as Locale))notFound();
 return <DigitAnalysisProClient locale={locale as Locale}/>;
}
