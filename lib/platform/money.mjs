const currencies=new Set(Intl.supportedValuesOf('currency'));
export function currencyCode(code){if(typeof code!=='string'||!currencies.has(code))throw new RangeError('Unsupported currency');return code;}
export function currencyExponent(code){return new Intl.NumberFormat('en',{style:'currency',currency:currencyCode(code)}).resolvedOptions().maximumFractionDigits;}
export function amount(minor,currency){currencyCode(currency);if(!Number.isSafeInteger(minor)||minor<0)throw new RangeError('Money must be a nonnegative safe integer');return {minor,currency};}
function safe(n){if(n>BigInt(Number.MAX_SAFE_INTEGER)||n<0n)throw new RangeError('Money overflow');return Number(n);}
function rounded(n,d){return (n+d/2n)/d;}
export function parsePrice(value,currency){const exp=currencyExponent(currency);if(typeof value!=='string'||!/^\d+(\.\d+)?$/.test(value))throw new RangeError('Invalid price');const [whole,fraction='']=value.split('.');if(fraction.length>exp)throw new RangeError('Excess currency precision');return amount(safe(BigInt(whole)*10n**BigInt(exp)+BigInt(fraction.padEnd(exp,'0')||'0')),currency);}
export function allocateDiscount(total,weights){
 if(!Number.isSafeInteger(total)||total<0||!Array.isArray(weights)||!weights.length)throw new RangeError('Invalid allocation');
 const ids=new Set();for(const w of weights){if(typeof w.id!=='string'||!w.id||ids.has(w.id)||!Number.isSafeInteger(w.minor)||w.minor<0)throw new RangeError('Invalid allocation weight');ids.add(w.id);}
 const sum=weights.reduce((n,w)=>n+BigInt(w.minor),0n);if(BigInt(total)>sum)throw new RangeError('Discount exceeds subtotal');if(sum===0n)return weights.map(w=>({id:w.id,minor:0}));
 const rows=weights.map(w=>({id:w.id,minor:safe(BigInt(total)*BigInt(w.minor)/sum),remainder:BigInt(total)*BigInt(w.minor)%sum}));let left=total-rows.reduce((n,w)=>n+w.minor,0);
 const sorted=[...rows].sort((a,b)=>a.remainder===b.remainder?(a.id<b.id?-1:1):(a.remainder>b.remainder?-1:1));for(let i=0;i<left;i++)sorted[i].minor++;
 return rows.map(({id,minor})=>({id,minor}));
}
export function calculateQuote({currency,lines,discountMinor=0,shippingMinor=0,taxIncluded=true}){
 amount(discountMinor,currency);amount(shippingMinor,currency);if(!Array.isArray(lines)||!lines.length||lines.length>100)throw new RangeError('Invalid basket');
 const calculated=lines.map(l=>{amount(l.unitMinor,currency);if(l.currency!==currency||!Number.isSafeInteger(l.quantity)||l.quantity<1||l.quantity>10000||!Number.isInteger(l.taxBps)||l.taxBps<0||l.taxBps>10000)throw new RangeError('Invalid line');return {...l,lineMinor:safe(BigInt(l.unitMinor)*BigInt(l.quantity))};});
 const subtotal=safe(calculated.reduce((n,l)=>n+BigInt(l.lineMinor),0n));const allocations=allocateDiscount(discountMinor,calculated.map(l=>({id:l.id,minor:l.lineMinor})));
 const result=calculated.map((l,i)=>{const taxable=BigInt(l.lineMinor-allocations[i].minor);const tax=safe(rounded(taxable*BigInt(l.taxBps),taxIncluded?10000n+BigInt(l.taxBps):10000n));return {...l,discountMinor:allocations[i].minor,taxMinor:tax};});
 const tax=safe(result.reduce((n,l)=>n+BigInt(l.taxMinor),0n));return {policyVersion:1,currency,lines:result,subtotal,discount:discountMinor,tax,shipping:shippingMinor,taxIncluded,total:safe(BigInt(subtotal)-BigInt(discountMinor)+BigInt(shippingMinor)+(taxIncluded?0n:BigInt(tax)))};
}
