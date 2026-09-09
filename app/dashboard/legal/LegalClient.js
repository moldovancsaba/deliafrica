'use client';

import { useEffect, useState } from 'react';

const documentOrder = ['gtc','terms','cookies','consumer','privacy'];
const documentLabels = {
  gtc: 'GTC / ÁSZF', terms: 'T&C / Vásárlási feltételek', cookies: 'Süti tájékoztató', consumer: 'Fogyasztóvédelmi nyilatkozat', privacy: 'GDPR / Adatkezelés'
};

export default function LegalClient(){
  const [legal,setLegal]=useState(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');

  useEffect(()=>{fetch('/api/site-settings',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Nem tölthető be.');setLegal(d.legal||{});}).catch(e=>setError(e.message));},[]);

  function setField(path,value){setLegal(current=>{const next=JSON.parse(JSON.stringify(current));let ref=next;for(let i=0;i<path.length-1;i++){if(!ref[path[i]])ref[path[i]]={};ref=ref[path[i]];}ref[path.at(-1)]=value;return next;});}
  async function save(){setMessage('');setError('');const r=await fetch('/api/site-settings',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({legal})});const d=await r.json();if(!r.ok){setError(d.error||'Mentési hiba.');return;}setLegal(d.legal||legal);setMessage('Jogi és cégadatok mentve.');}

  if(!legal)return <section className="admin-panel">Betöltés…</section>;
  const company=legal.company||{}; const banner=legal.cookieBanner||{}; const docs=legal.documents||{};
  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">LEGAL · COMPANY · FOOTER</span><h1>Jogi és cégadatok</h1><p>A footer, kapcsolat, közösségi linkek, sütikezelés és minden jogi dokumentum innen szerkeszthető.</p></div><button className="admin-button red" onClick={save}>Minden mentése</button></div>
    {message&&<div className="admin-message">{message}</div>}{error&&<div className="admin-error">{error}</div>}
    <section className="admin-panel"><h2>Cég- és kapcsolati adatok</h2><div className="admin-form-grid">
      <label>Cégnév<input value={company.companyName||''} onChange={e=>setField(['company','companyName'],e.target.value)}/></label>
      <label>Kapcsolattartó<input value={company.contactName||''} onChange={e=>setField(['company','contactName'],e.target.value)}/></label>
      <label className="wide">Cím<input value={company.address||''} onChange={e=>setField(['company','address'],e.target.value)}/></label>
      <label>Telefon<input value={company.phone||''} onChange={e=>setField(['company','phone'],e.target.value)}/></label>
      <label>E-mail<input type="email" value={company.email||''} onChange={e=>setField(['company','email'],e.target.value)}/></label>
      <label>Instagram megjelenő név<input value={company.instagram||''} onChange={e=>setField(['company','instagram'],e.target.value)}/></label>
      <label>Instagram URL<input value={company.instagramUrl||''} onChange={e=>setField(['company','instagramUrl'],e.target.value)}/></label>
      <label>X megjelenő név<input value={company.x||''} onChange={e=>setField(['company','x'],e.target.value)}/></label>
      <label>X URL<input value={company.xUrl||''} onChange={e=>setField(['company','xUrl'],e.target.value)}/></label>
      <label>Facebook megjelenő név<input value={company.facebook||''} onChange={e=>setField(['company','facebook'],e.target.value)}/></label>
      <label>Facebook URL<input value={company.facebookUrl||''} onChange={e=>setField(['company','facebookUrl'],e.target.value)}/></label>
    </div></section>
    <section className="admin-panel"><h2>Süti hozzájárulási sáv</h2><div className="admin-form-grid">
      <label>Cím<input value={banner.title||''} onChange={e=>setField(['cookieBanner','title'],e.target.value)}/></label>
      <label className="wide">Szöveg<textarea value={banner.body||''} onChange={e=>setField(['cookieBanner','body'],e.target.value)}/></label>
      <label>Elfogadás gomb<input value={banner.accept||''} onChange={e=>setField(['cookieBanner','accept'],e.target.value)}/></label>
      <label>Elutasítás gomb<input value={banner.reject||''} onChange={e=>setField(['cookieBanner','reject'],e.target.value)}/></label>
      <label>Tájékoztató link szövege<input value={banner.policyLink||''} onChange={e=>setField(['cookieBanner','policyLink'],e.target.value)}/></label>
    </div></section>
    {documentOrder.map(key=>{const doc=docs[key]||{};return <section className="admin-panel" key={key}><h2>{documentLabels[key]}</h2><div className="admin-form-grid">
      <label className="wide">Oldalcím<input value={doc.title||''} onChange={e=>setField(['documents',key,'title'],e.target.value)}/></label>
      <label className="wide">Rövid összefoglaló<textarea value={doc.summary||''} onChange={e=>setField(['documents',key,'summary'],e.target.value)}/></label>
      <label className="wide">Teljes szöveg<textarea style={{minHeight:360}} value={doc.body||''} onChange={e=>setField(['documents',key,'body'],e.target.value)}/></label>
    </div></section>})}
    <section className="admin-panel danger-zone"><h2>Jogi ellenőrzés</h2><p>Az alapértelmezett szövegek működő webshop-sablonok, de a konkrét jogi entitás, adószám, cégjegyzék, joghatóság és kötelező fogyasztóvédelmi adatok megadása után érdemes jogi szakértővel felülvizsgáltatni őket.</p></section>
  </>;
}
