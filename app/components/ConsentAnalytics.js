'use client';

import { useEffect, useState } from 'react';
import { Analytics } from '@vercel/analytics/next';
import { GoogleAnalytics } from '@next/third-parties/google';

const KEY='deli-cookie-consent';

export default function ConsentAnalytics({googleAnalyticsMeasurementId=''}){
  const [allowed,setAllowed]=useState(false);
  useEffect(()=>{
    const sync=()=>setAllowed(window.localStorage.getItem(KEY)==='all');
    sync();
    const listener=(event)=>setAllowed(event.detail==='all');
    window.addEventListener('deli-consent-change',listener);
    return()=>window.removeEventListener('deli-consent-change',listener);
  },[]);
  return allowed?<><Analytics />{googleAnalyticsMeasurementId && <GoogleAnalytics gaId={googleAnalyticsMeasurementId}/>}</>:null;
}
