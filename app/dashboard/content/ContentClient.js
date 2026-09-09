'use client';

import { useEffect, useMemo, useState } from 'react';

function flatten(value, path = [], out = []) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => flatten(item, [...path, index], out));
  } else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => flatten(item, [...path, key], out));
  } else {
    out.push({ path, value: value ?? '' });
  }
  return out;
}

function pathLabel(path){return path.map(part=>typeof part==='number'?`#${part+1}`:String(part).replace(/([A-Z])/g,' $1')).join(' / ');}
function groupName(path){return String(path[0]||'general');}

export default function ContentClient(){
  const [copy,setCopy]=useState(null); const [message,setMessage]=useState(''); const [error,setError]=useState('');
  useEffect(()=>{fetch('/api/site-settings',{cache:'no-store'}).then(r=>r.json()).then(d=>setCopy(d.uiCopy||{})).catch(()=>setError('A tartalom nem tölthető be.'));},[]);
  const fields=useMemo(()=>copy?flatten(copy):[],[copy]);
  const grouped=useMemo(()=>fields.reduce((acc,row)=>{const key=groupName(row.path);(acc[key] ||= []).push(row);return acc;},{}),[fields]);
  function setValue(path,value){setCopy(current=>{const next=JSON.parse(JSON.stringify(current));let ref=next;for(let i=0;i<path.length-1;i++)ref=ref[path[i]];ref[path.at(-1)]=value;return next;});}
  async function save(){setMessage('');setError('');const r=await fetch('/api/site-settings',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify({uiCopy:copy})});const d=await r.json();if(!r.ok){setError(d.error||'Mentési hiba.');return;}setMessage('Tartalom mentve.');setCopy(d.uiCopy||copy);}
  if(!copy)return <div className="admin-panel">Betöltés…</div>;
  return <><div className="admin-page-head"><div><span className="admin-kicker">CONTENT MANAGEMENT</span><h1>Tartalom</h1><p>A storefront minden központi UI-szövege változóként, csoportosítva szerkeszthető.</p></div><button className="admin-button red" onClick={save}>Minden módosítás mentése</button></div>{message&&<div className="admin-message">{message}</div>}{error&&<div className="admin-error">{error}</div>}{Object.entries(grouped).map(([group,rows])=><section className="copy-group" key={group}><h3>{group}</h3>{rows.map(row=>{const key=row.path.join('.');const multiline=String(row.value).length>80||String(row.value).includes('\n');return <label className="copy-row" key={key}><span>{pathLabel(row.path.slice(1))||group}</span>{multiline?<textarea value={row.value} onChange={e=>setValue(row.path,e.target.value)}/>:<input value={row.value} onChange={e=>setValue(row.path,e.target.value)}/>}</label>})}</section>)}</>;
}
