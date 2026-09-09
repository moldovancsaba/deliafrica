'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import BrandLogo from '@/app/components/BrandLogo';
import { DEFAULT_STOREFRONT_UI_COPY } from '@/lib/storefront-copy';

const empty={name:'',email:'',phone:'',shippingAddress:{recipientName:'',phone:'',country:'',postalCode:'',city:'',addressLine1:'',addressLine2:'',deliveryNote:''},billingDetails:{billingName:'',companyName:'',taxNumber:'',country:'',postalCode:'',city:'',addressLine1:'',addressLine2:''}};
function money(value,currency='HUF'){return new Intl.NumberFormat('hu-HU',{style:'currency',currency,maximumFractionDigits:0}).format(Number(value)||0);}
function date(value){if(!value)return'—';try{return new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value));}catch{return'—';}}

export default function ProfileClient(){
  const [profile,setProfile]=useState(empty);const [orders,setOrders]=useState([]);const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');const [uiCopy,setUiCopy]=useState(DEFAULT_STOREFRONT_UI_COPY);
  const copy=uiCopy.profile;const statuses=uiCopy.orderStatus;
  async function load(){
    setLoading(true);setError('');
    const [profileRes,settingsRes]=await Promise.all([fetch('/api/profile',{cache:'no-store'}),fetch('/api/site-settings',{cache:'no-store'}).catch(()=>null)]);
    let resolvedCopy=uiCopy;
    if(settingsRes?.ok){const settings=await settingsRes.json().catch(()=>({}));if(settings.uiCopy){resolvedCopy=settings.uiCopy;setUiCopy(settings.uiCopy);}}
    const data=await profileRes.json().catch(()=>({}));
    if(!profileRes.ok)setError(data.error||resolvedCopy.profile.loadError);
    else{
      const defaultCountry=resolvedCopy.profile.defaultCountry||'';
      setProfile({...empty,...(data.profile||{}),shippingAddress:{...empty.shippingAddress,country:defaultCountry,...(data.profile?.shippingAddress||{})},billingDetails:{...empty.billingDetails,country:defaultCountry,...(data.profile?.billingDetails||{})}});setOrders(data.orders||[]);
    }
    setLoading(false);
  }
  useEffect(()=>{load();},[]);
  function setField(section,key,value){if(!section)return setProfile(current=>({...current,[key]:value}));setProfile(current=>({...current,[section]:{...current[section],[key]:value}}));}
  function copyShippingToBilling(){const s=profile.shippingAddress;setProfile(current=>({...current,billingDetails:{...current.billingDetails,billingName:current.billingDetails.billingName||s.recipientName,country:s.country,postalCode:s.postalCode,city:s.city,addressLine1:s.addressLine1,addressLine2:s.addressLine2}}));}
  async function save(event){event.preventDefault();setSaving(true);setMessage('');setError('');const res=await fetch('/api/profile',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(profile)});const data=await res.json().catch(()=>({}));if(!res.ok)setError(data.error||copy.saveError);else setMessage(copy.saveSuccess);setSaving(false);}
  const totalSpent=useMemo(()=>orders.reduce((sum,order)=>sum+(Number(order.total)||0),0),[orders]);
  if(loading)return <main className="profile-shell"><div className="profile-loading">{copy.loading}</div></main>;
  return <main className="profile-shell">
    <header className="profile-header"><Link href="/" className="profile-logo" aria-label={uiCopy.accessibility?.home}><BrandLogo /></Link><div className="profile-header-actions"><Link href="/">{copy.backToShop}</Link><a href="/api/auth/logout">{copy.logout}</a></div></header>
    <section className="profile-hero"><span>{copy.eyebrow}</span><h1>{copy.title}</h1><p>{profile.name||copy.customerFallback} · {profile.email}</p></section>
    {message&&<div className="profile-message">{message}</div>}{error&&<div className="profile-error">{error}</div>}
    <section className="profile-stats"><article><small>{copy.statsOrders}</small><strong>{orders.length}</strong></article><article><small>{copy.statsSpent}</small><strong>{money(totalSpent)}</strong></article><article><small>{copy.statsLastOrder}</small><strong>{orders[0]?date(orders[0].createdAt):'—'}</strong></article></section>
    <form className="profile-form" onSubmit={save}>
      <section className="profile-panel"><div className="profile-panel-head"><div><span>{copy.contactEyebrow}</span><h2>{copy.contactTitle}</h2></div></div><div className="profile-grid"><label>{copy.name}<input value={profile.name||''} disabled/></label><label>{copy.email}<input value={profile.email||''} disabled/></label><label>{copy.phone}<input value={profile.phone||''} onChange={e=>setField(null,'phone',e.target.value)} placeholder={copy.phonePlaceholder}/></label></div></section>
      <section className="profile-panel"><div className="profile-panel-head"><div><span>{copy.shippingEyebrow}</span><h2>{copy.shippingTitle}</h2></div><small>{copy.shippingHelp}</small></div><div className="profile-grid"><label>{copy.recipientName}<input value={profile.shippingAddress.recipientName} onChange={e=>setField('shippingAddress','recipientName',e.target.value)}/></label><label>{copy.phone}<input value={profile.shippingAddress.phone} onChange={e=>setField('shippingAddress','phone',e.target.value)}/></label><label>{copy.country}<input value={profile.shippingAddress.country} onChange={e=>setField('shippingAddress','country',e.target.value)}/></label><label>{copy.postalCode}<input value={profile.shippingAddress.postalCode} onChange={e=>setField('shippingAddress','postalCode',e.target.value)}/></label><label>{copy.city}<input value={profile.shippingAddress.city} onChange={e=>setField('shippingAddress','city',e.target.value)}/></label><label className="wide">{copy.address}<input value={profile.shippingAddress.addressLine1} onChange={e=>setField('shippingAddress','addressLine1',e.target.value)} placeholder={copy.addressPlaceholder}/></label><label className="wide">{copy.address2}<input value={profile.shippingAddress.addressLine2} onChange={e=>setField('shippingAddress','addressLine2',e.target.value)} placeholder={copy.address2Placeholder}/></label><label className="wide">{copy.deliveryNote}<textarea value={profile.shippingAddress.deliveryNote} onChange={e=>setField('shippingAddress','deliveryNote',e.target.value)}/></label></div></section>
      <section className="profile-panel"><div className="profile-panel-head"><div><span>{copy.billingEyebrow}</span><h2>{copy.billingTitle}</h2></div><button type="button" className="profile-link-button" onClick={copyShippingToBilling}>{copy.copyShipping}</button></div><div className="profile-grid"><label>{copy.billingName}<input value={profile.billingDetails.billingName} onChange={e=>setField('billingDetails','billingName',e.target.value)}/></label><label>{copy.companyName}<input value={profile.billingDetails.companyName} onChange={e=>setField('billingDetails','companyName',e.target.value)}/></label><label>{copy.taxNumber}<input value={profile.billingDetails.taxNumber} onChange={e=>setField('billingDetails','taxNumber',e.target.value)}/></label><label>{copy.country}<input value={profile.billingDetails.country} onChange={e=>setField('billingDetails','country',e.target.value)}/></label><label>{copy.postalCode}<input value={profile.billingDetails.postalCode} onChange={e=>setField('billingDetails','postalCode',e.target.value)}/></label><label>{copy.city}<input value={profile.billingDetails.city} onChange={e=>setField('billingDetails','city',e.target.value)}/></label><label className="wide">{copy.billingAddress}<input value={profile.billingDetails.addressLine1} onChange={e=>setField('billingDetails','addressLine1',e.target.value)}/></label><label className="wide">{copy.billingAddress2}<input value={profile.billingDetails.addressLine2} onChange={e=>setField('billingDetails','addressLine2',e.target.value)}/></label></div></section>
      <div className="profile-save"><button disabled={saving}>{saving?copy.saving:copy.save}</button></div>
    </form>
    <section className="profile-panel profile-orders"><div className="profile-panel-head"><div><span>{copy.historyEyebrow}</span><h2>{copy.historyTitle}</h2></div></div>{orders.length===0?<p className="profile-muted">{copy.noOrders}</p>:<div className="profile-order-list">{orders.map(order=><article key={order.reference}><div><b>{order.reference}</b><small>{date(order.createdAt)}</small></div><div><span>{order.items?.map(item=>`${item.name} × ${item.quantity}`).join(', ')}</span><small>{copy.paymentLabel}: {statuses.payment?.[order.paymentStatus]||order.paymentStatus} · {copy.deliveryLabel}: {statuses.delivery?.[order.deliveryStatus]||order.deliveryStatus}</small></div><strong>{money(order.total,order.currency||'HUF')}</strong>{order.trackingUrl&&<a href={order.trackingUrl} target="_blank" rel="noreferrer">{copy.tracking}</a>}</article>)}</div>}</section>
  </main>;
}
