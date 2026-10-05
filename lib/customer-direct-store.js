import {randomUUID} from 'node:crypto';
import {categories as fallbackCategories,products as fallbackProducts} from './products.js';

const truthy=value=>['1','true','yes','on'].includes(String(value||'').toLowerCase());
const clean=value=>String(value||'').trim();
const first=(value,fallback='')=>clean(value)||fallback;
function managedMediaPath(value,config){
 const raw=clean(value),mediaId=raw.startsWith('media:')?raw.slice(6).trim():'';
 if(!mediaId||!config?.origin)return '';
 return `/api/customer-direct/media/${encodeURIComponent(mediaId)}`;
}
const asset=(value,fallback='',config)=>{const path=clean(value);if(/^\/(products|editorial|hero-scenes|heroes)\//.test(path))return path;return managedMediaPath(path,config)||fallback;};
const byId=new Map(fallbackProducts.map(product=>[product.id,product]));
const bySlug=new Map(fallbackProducts.map(product=>[product.slug,product]));
const bySku=new Map(fallbackProducts.map(product=>[product.sku,product]).filter(([sku])=>sku));
const byName=new Map(fallbackProducts.map(product=>[product.name.toLowerCase(),product]));
function deepMerge(base,override){
 if(Array.isArray(base))return Array.isArray(override)?override:base;
 if(!base||typeof base!=='object')return override===undefined?base:override;
 const result={...base};
 for(const [key,value]of Object.entries(override||{}))result[key]=key in base?deepMerge(base[key],value):value;
 return result;
}

export function customerDirectConfig(env=process.env){
 const origin=clean(env.CUSTOMER_DIRECT_STOREFRONT_ORIGIN).replace(/\/+$/,'');
 const host=clean(env.CUSTOMER_DIRECT_STOREFRONT_HOST||env.NEXT_PUBLIC_SITE_HOST);
 return {origin,host,enabled:truthy(env.CUSTOMER_DIRECT_MANAGED)||Boolean(origin&&host),required:truthy(env.CUSTOMER_DIRECT_REQUIRED),locale:clean(env.CUSTOMER_DIRECT_LOCALE)||'hu',currency:clean(env.CUSTOMER_DIRECT_CURRENCY)||'HUF'};
}
export function customerDirectManagementUrl(env=process.env){
 const config=customerDirectConfig(env);
 const origin=config.origin||'https://customerdirect.vercel.app';
 const shopPath=clean(env.CUSTOMER_DIRECT_SHOP_PATH)||'deli_africa';
 return `${origin}/?shop=${encodeURIComponent(shopPath)}`;
}
export const isCustomerDirectManaged=(env=process.env)=>customerDirectConfig(env).enabled;

function majorFromMinor(minor,currency){
 if(!Number.isSafeInteger(minor))return null;
 const exponent=new Intl.NumberFormat('en',{style:'currency',currency}).resolvedOptions().maximumFractionDigits;
 return Math.round(minor/10**exponent);
}
function baseFor(product){
 return byId.get(product.legacyProductId)||bySlug.get(product.slug)||bySku.get(product.sku)||byName.get(clean(product.name).toLowerCase())||{};
}
function faq(value){return Array.isArray(value)?value.map(item=>Array.isArray(item)?{question:item[0]||'',answer:item[1]||''}:{question:item?.question||'',answer:item?.answer||''}).filter(item=>item.question&&item.answer):[];}
function dimensions(value,base){return {width:value?.widthMm||base?.packageDimensionsMm?.width||0,height:value?.heightMm||base?.packageDimensionsMm?.height||0,depth:value?.depthMm||base?.packageDimensionsMm?.depth||0,weightG:value?.weightG||base?.packageDimensionsMm?.weightG||0};}
export function mapCustomerDirectProduct(product,config=customerDirectConfig()){
 const base=baseFor(product),currency=product.price?.currency||'HUF',price=majorFromMinor(product.price?.minor,currency);
 const details=base.details||{};
 const id=first(product.legacyProductId,base.id||product.slug||product.sku||product.id);
 const story=first(product.story,first(product.description,base.story||details.summary||''));
 return {
  ...base,
  id,
  customerDirectProductId:product.id,
  slug:first(product.slug,base.slug||id),
  sku:first(product.sku,base.sku||id),
  name:first(product.name,base.name||id),
  subtitle:first(product.subtitle,base.subtitle),
  category:first(product.category,base.category||'pantry'),
  categoryName:first(product.categoryName,base.categoryName),
  badge:first(product.badge,base.badge),
  tone:first(product.tone,base.tone||'red'),
  visual:first(product.visual,base.visual||'box'),
  image:asset(product.image,base.image,config),
  heroImage:asset(product.heroImage,base.heroImage,config),
  editorialImage:asset(product.editorialImage,base.editorialImage,config),
  editorialCaption:first(product.editorialCaption,base.editorialCaption),
  price,
  currency,
  vatRate:Number.isFinite(Number(product.vatRate))?Number(product.vatRate):(base.vatRate??27),
  active:true,
  purchasable:product.purchasable!==false&&price!=null&&Number(product.stock)>0,
  story,
  whatItIs:first(product.whatItIs,base.whatItIs||details.what),
  background:first(product.background,base.background||details.background),
  flavour:first(product.flavour,base.flavour||details.flavour),
  audience:first(product.audience,base.audience||details.suits),
  packaging:first(product.packaging,base.packaging||details.info),
  info:first(product.info,base.info||details.info),
  originCountry:first(product.originCountry,base.originCountry||'South Africa'),
  brand:first(product.brand,base.brand),
  ingredients:first(product.ingredients,base.ingredients),
  allergens:first(product.allergens,base.allergens),
  storage:first(product.storage,base.storage||details.storage),
  nutrition:first(product.nutrition,base.nutrition),
  pairings:Array.isArray(product.pairings)&&product.pairings.length?product.pairings:(base.pairings||details.uses||[]),
  servingIdeas:Array.isArray(product.servingIdeas)&&product.servingIdeas.length?product.servingIdeas:(base.servingIdeas||details.serving||[]),
  faq:faq(product.faq).length?faq(product.faq):(base.faq||[]),
  seo:product.seo&&Object.keys(product.seo).length?product.seo:(base.seo||{}),
  packageDimensionsMm:dimensions(product.dimensions,base)
 };
}

export function mapCustomerDirectCategories(storefront,config=customerDirectConfig()){
 const configured=Array.isArray(storefront?.categories)&&storefront.categories.length?storefront.categories:fallbackCategories.filter(category=>category.id!=='all');
 const categories=configured.map(category=>({
  ...category,
  image:asset(category.image, fallbackCategories.find(item=>item.id===category.id)?.image, config),
  visualLabel:Array.isArray(category.visualLabel)&&category.visualLabel.length?category.visualLabel:(fallbackCategories.find(item=>item.id===category.id)?.visualLabel||[category.label]),
  tone:clean(category.tone)||fallbackCategories.find(item=>item.id===category.id)?.tone||'red'
 })).filter(category=>category.id&&category.label);
 return [{id:'all',label:'Minden termék'},...categories];
}

async function customerDirectRequest(path,{method='GET',body}={}){
 const config=customerDirectConfig();
 if(!config.enabled||!config.origin||!config.host)return null;
 const url=new URL(path,config.origin);
 const response=await fetch(url,{method,headers:{'content-type':'application/json','x-customer-direct-host':config.host,'x-forwarded-host':config.host},body:body?JSON.stringify(body):undefined,cache:'no-store'});
 const data=await response.json().catch(()=>({}));
 if(!response.ok)throw new Error(data.error||'CUSTOMER_DIRECT_UNAVAILABLE');
 return data;
}

export async function getCustomerDirectStorefront(){
 const config=customerDirectConfig();
 if(!config.enabled)return null;
 try{
  const data=await customerDirectRequest(`/api/storefront/catalog?locale=${encodeURIComponent(config.locale)}&currency=${encodeURIComponent(config.currency)}&includeUnavailable=1`);
  return data?.storefront||null;
 }catch(error){
  if(config.required)throw error;
  return null;
 }
}
export async function getCustomerDirectCatalog(){
 const storefront=await getCustomerDirectStorefront();
 if(!storefront?.products?.length)return null;
 const config=customerDirectConfig();
 return {products:storefront.products.map(product=>mapCustomerDirectProduct(product,config)),categories:mapCustomerDirectCategories(storefront,config),storefront};
}
export async function getCustomerDirectSiteSettings(fallback){
 const storefront=await getCustomerDirectStorefront();
 if(!storefront)return null;
 const managed=deepMerge(fallback,storefront.siteSettings||{});
 return {
  ...managed,
  sales:{...managed.sales,checkoutEnabled:managed.sales?.checkoutEnabled!==false,supportEmail:storefront.settings?.supportEmail||managed.sales?.supportEmail,senderName:storefront.settings?.companyName||managed.sales?.senderName},
  customerDirect:{managed:true,host:storefront.host,shop:storefront.shop,theme:storefront.settings?.theme,categories:mapCustomerDirectCategories(storefront)}
 };
}
export async function createCustomerDirectOrder({items,customer}){
 const config=customerDirectConfig();
 if(!config.enabled)return null;
 const managed=await getCustomerDirectCatalog();
 if(!managed)return null;
 const byLegacyId=new Map(managed.products.map(product=>[product.id,product]));
 const lines=items.map(item=>{const product=byLegacyId.get(item.productId);return product&&product.purchasable!==false?{productId:product.customerDirectProductId,quantity:Math.max(1,Math.min(20,Number(item.quantity)||1))}:null;});
 if(lines.some(line=>!line))throw new Error('INVALID_MANAGED_PRODUCT');
 const quote=await customerDirectRequest('/api/storefront/quote',{method:'POST',body:{currency:config.currency,items:lines,idempotencyKey:randomUUID()}});
 const order=await customerDirectRequest('/api/storefront/orders',{method:'POST',body:{quoteId:quote.quote.id,idempotencyKey:randomUUID(),customer}});
 return {ok:true,reference:order.order.reference,total:majorFromMinor(order.order.totalMinor,order.order.currency),persisted:true,managed:true,requestId:order.requestId};
}
