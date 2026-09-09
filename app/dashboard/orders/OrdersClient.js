'use client';

import { useEffect, useMemo, useState } from 'react';

const options = {
  orderStatus: ['created','bought','cancelled','refunded'],
  paymentStatus: ['not_started','pending','paid','failed','refunded'],
  invoiceStatus: ['not_started','pending','invoiced','failed','storno'],
  fulfilmentStatus: ['not_ready','picking','ready_to_deliver','handed_over'],
  deliveryStatus: ['not_started','label_created','in_transit','delivered','failed','returned']
};

const money = value => new Intl.NumberFormat('hu-HU').format(value || 0) + ' Ft';

export default function OrdersClient() {
  const [orders,setOrders]=useState([]);
  const [selectedRef,setSelectedRef]=useState('');
  const [draft,setDraft]=useState(null);
  const [message,setMessage]=useState('');
  const [error,setError]=useState('');
  const selected=useMemo(()=>orders.find(o=>o.reference===selectedRef),[orders,selectedRef]);

  async function load(){
    const res=await fetch('/api/admin/orders',{cache:'no-store'}); const data=await res.json();
    if(!res.ok){setError(data.error||'Rendelések nem tölthetők be.');return;}
    setOrders(data.orders||[]); if(!selectedRef&&data.orders?.length)setSelectedRef(data.orders[0].reference);
  }
  useEffect(()=>{load();},[]);
  useEffect(()=>{if(selected)setDraft(JSON.parse(JSON.stringify(selected)));},[selected]);

  function setField(field,value){setDraft(d=>({...d,[field]:value}));}
  async function save(){
    setMessage('');setError('');
    const res=await fetch('/api/admin/orders',{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(draft)}); const data=await res.json();
    if(!res.ok){setError(data.error||'Mentési hiba.');return;}
    setMessage('Rendelés frissítve.'); await load(); setSelectedRef(data.order.reference);
  }

  return <>
    <div className="admin-page-head"><div><span className="admin-kicker">ORDER MANAGEMENT</span><h1>Rendelések</h1><p>Vásárlás, fizetés, számla, összekészítés, átadás és kézbesítés teljes életciklusa.</p></div></div>
    {message&&<div className="admin-message">{message}</div>}{error&&<div className="admin-error">{error}</div>}
    <div className="product-editor">
      <aside className="product-list">{orders.map(order=><button key={order.reference} className={selectedRef===order.reference?'active':''} onClick={()=>setSelectedRef(order.reference)}><b>{order.reference}</b><br/><small>{order.customerName} · {money(order.total)}</small><br/><small>{order.paymentStatus||'not_started'} · {order.deliveryStatus||'not_started'}</small></button>)}</aside>
      {draft&&<section className="admin-panel" style={{marginTop:0}}>
        <h2>{draft.reference}</h2><p>{new Date(draft.createdAt).toLocaleString('hu-HU')} · {draft.customerName} · {draft.email} · {draft.phone||'—'}</p>
        <div className="order-detail-grid">
          <div><h3>Vevő és cím</h3><div className="admin-form-grid"><label>Szállítási cím<textarea value={draft.address||''} disabled /></label><label>Számlázási név<input value={draft.billingName||''} onChange={e=>setField('billingName',e.target.value)} /></label><label className="wide">Számlázási cím<textarea value={draft.billingAddress||''} onChange={e=>setField('billingAddress',e.target.value)} /></label><label>Adószám<input value={draft.taxNumber||''} onChange={e=>setField('taxNumber',e.target.value)} /></label></div></div>
          <div><h3>Összegzés</h3><table className="admin-table"><tbody>{(draft.items||[]).map((item,i)=><tr key={i}><td>{item.name}</td><td>{item.quantity} × {money(item.unitPrice)}</td></tr>)}<tr><td>Szállítás</td><td>{money(draft.shippingFee)}</td></tr><tr><td>Kedvezmény</td><td>-{money(draft.discountTotal)}</td></tr><tr><th>Összesen</th><th>{money(draft.total)}</th></tr></tbody></table></div>
        </div>
        <h3>Státuszok</h3><div className="admin-form-grid">
          <label>Vásárlás<select value={draft.orderStatus||'created'} onChange={e=>setField('orderStatus',e.target.value)}>{options.orderStatus.map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Fizetés<select value={draft.paymentStatus||'not_started'} onChange={e=>setField('paymentStatus',e.target.value)}>{options.paymentStatus.map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Számla<select value={draft.invoiceStatus||'not_started'} onChange={e=>setField('invoiceStatus',e.target.value)}>{options.invoiceStatus.map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Összekészítés<select value={draft.fulfilmentStatus||'not_ready'} onChange={e=>setField('fulfilmentStatus',e.target.value)}>{options.fulfilmentStatus.map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Kézbesítés<select value={draft.deliveryStatus||'not_started'} onChange={e=>setField('deliveryStatus',e.target.value)}>{options.deliveryStatus.map(v=><option key={v}>{v}</option>)}</select></label>
          <label>Státusz megjegyzés<input value={draft.statusNote||''} onChange={e=>setField('statusNote',e.target.value)} /></label>
        </div>
        <h3>Fizetés és számlázás</h3><div className="admin-form-grid"><label>Barion tranzakció ID<input value={draft.paymentTransactionId||''} onChange={e=>setField('paymentTransactionId',e.target.value)} /></label><label>Számlaszám<input value={draft.invoiceNumber||''} onChange={e=>setField('invoiceNumber',e.target.value)} /></label><label className="wide">Számla URL<input value={draft.invoiceUrl||''} onChange={e=>setField('invoiceUrl',e.target.value)} /></label></div>
        <h3>Szállítás / Packeta</h3><div className="admin-form-grid"><label>Packeta pont ID<input value={draft.packetaPointId||''} onChange={e=>setField('packetaPointId',e.target.value)} /></label><label>Parcel ID<input value={draft.parcelId||''} onChange={e=>setField('parcelId',e.target.value)} /></label><label>Tracking szám<input value={draft.trackingNumber||''} onChange={e=>setField('trackingNumber',e.target.value)} /></label><label>Tracking URL<input value={draft.trackingUrl||''} onChange={e=>setField('trackingUrl',e.target.value)} /></label></div>
        <h3>Admin megjegyzés</h3><textarea style={{width:'100%',minHeight:90}} value={draft.adminNote||''} onChange={e=>setField('adminNote',e.target.value)} />
        <div className="admin-toolbar"><button className="admin-button red" onClick={save}>Rendelés mentése</button></div>
        <h3>Státusztörténet</h3><div className="timeline">{(draft.statusHistory||[]).slice().reverse().map((row,i)=><div key={i}><b>{row.field}: {row.from||'—'} → {row.to}</b><br/><small>{new Date(row.at).toLocaleString('hu-HU')} · {row.changedBy||'system'} {row.note?`· ${row.note}`:''}</small></div>)}</div>
      </section>}
    </div>
  </>;
}
