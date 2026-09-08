'use client';

import { useEffect, useState } from 'react';

const fmt=v=>v===undefined||v===null?'—':String(v);
export default function SystemClient(){
  const [health,setHealth]=useState(null); const [error,setError]=useState('');
  function load(){fetch('/api/health',{cache:'no-store'}).then(async r=>{const d=await r.json();if(!r.ok)throw new Error(d.error||'Health API hiba');setHealth(d);setError('');}).catch(e=>setError(e.message));}
  useEffect(()=>{load();const id=setInterval(load,15000);return()=>clearInterval(id);},[]);
  return <><div className="admin-page-head"><div><span className="admin-kicker">SYSTEM HEALTH</span><h1>Rendszer</h1><p>MongoDB, SSO, runtime, API és deployment állapot.</p></div><button className="admin-button red" onClick={load}>Frissítés</button></div>{error&&<div className="admin-error">{error}</div>}<section className="admin-grid"><article className="admin-card"><small>MongoDB</small><strong>{health?.mongo?.connected?'Connected':'Unavailable'}</strong></article><article className="admin-card"><small>SSO</small><strong>{health?.authentication?.configured?'Configured':'Missing'}</strong></article><article className="admin-card"><small>Runtime</small><strong>{fmt(health?.runtime)}</strong></article><article className="admin-card"><small>Latency</small><strong>{health?`${health.latencyMs} ms`:'…'}</strong></article></section><section className="admin-panel"><h2>Deployment</h2><table className="admin-table"><tbody><tr><th>Environment</th><td>{fmt(health?.environment)}</td></tr><tr><th>Region</th><td>{fmt(health?.deployment?.region)}</td></tr><tr><th>Version</th><td>{fmt(health?.deployment?.version)}</td></tr><tr><th>Commit</th><td>{fmt(health?.deployment?.commit)}</td></tr><tr><th>URL</th><td>{fmt(health?.deployment?.url)}</td></tr><tr><th>Socket.io</th><td>{fmt(health?.realtime?.status)}</td></tr><tr><th>Process uptime</th><td>{fmt(health?.process?.uptimeSeconds)} s</td></tr><tr><th>Memory</th><td>{fmt(health?.process?.memoryMb)} MB</td></tr></tbody></table></section></>;
}
