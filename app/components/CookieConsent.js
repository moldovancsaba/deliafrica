'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const KEY='deli-cookie-consent';

export default function CookieConsent({ copy }){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{setVisible(!window.localStorage.getItem(KEY));},[]);
  function choose(value){window.localStorage.setItem(KEY,value);window.dispatchEvent(new CustomEvent('deli-consent-change',{detail:value}));setVisible(false);}
  if(!visible||!copy)return null;
  return <aside className="cookie-consent" role="dialog" aria-label={copy.title}>
    <div><h2>{copy.title}</h2><p>{copy.body} <Link href="/legal/cookies">{copy.policyLink}</Link></p></div>
    <div className="cookie-actions"><button className="reject" onClick={()=>choose('necessary')}>{copy.reject}</button><button className="accept" onClick={()=>choose('all')}>{copy.accept}</button></div>
  </aside>;
}
