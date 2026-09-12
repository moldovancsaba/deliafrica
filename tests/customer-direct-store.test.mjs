import test from 'node:test';
import assert from 'node:assert/strict';
import {customerDirectConfig,mapCustomerDirectProduct,getCustomerDirectSiteSettings} from '../lib/customer-direct-store.js';

test('customer.direct storefront config is opt-in and host scoped',()=>{
 assert.equal(customerDirectConfig({}).enabled,false);
 const config=customerDirectConfig({CUSTOMER_DIRECT_STOREFRONT_ORIGIN:'https://customerdirect.vercel.app/',CUSTOMER_DIRECT_STOREFRONT_HOST:'deli.africa',CUSTOMER_DIRECT_REQUIRED:'true'});
 assert.equal(config.enabled,true);
 assert.equal(config.origin,'https://customerdirect.vercel.app');
 assert.equal(config.host,'deli.africa');
 assert.equal(config.required,true);
});

test('customer.direct product mapping preserves deli visual identity and stable cart ids',()=>{
 const product=mapCustomerDirectProduct({id:'customer-direct-id',legacyProductId:'peri-hot',sku:'NEW-SKU',name:"Nando's Peri-Peri Hot",price:{currency:'HUF',minor:3490},stock:4,purchasable:true});
 assert.equal(product.id,'peri-hot');
 assert.equal(product.customerDirectProductId,'customer-direct-id');
 assert.equal(product.slug,'nandos-peri-peri-hot');
 assert.equal(product.price,3490);
 assert.equal(product.purchasable,true);
 assert.equal(product.image,'/products/shop/peri-hot.jpg');
 assert.equal(product.heroImage,'/products/peri-hot.webp');
 assert.equal(product.category,'braai');
});

test('customer.direct managed settings override deli controls without replacing the UI contract',async()=>{
 const originalFetch=global.fetch,originalEnv={...process.env};
 try{
  process.env.CUSTOMER_DIRECT_STOREFRONT_ORIGIN='https://customerdirect.example';
  process.env.CUSTOMER_DIRECT_STOREFRONT_HOST='deli.doneisbetter.com';
  global.fetch=async(url,options)=>{
   assert.equal(String(url),'https://customerdirect.example/api/storefront/catalog?locale=hu&currency=HUF&includeUnavailable=1');
   assert.equal(options.headers['x-customer-direct-host'],'deli.doneisbetter.com');
   return {ok:true,json:async()=>({storefront:{host:'deli.doneisbetter.com',shop:{slug:'deli-africa'},settings:{companyName:'deli.africa',supportEmail:'support@example.com',theme:'coral'},siteSettings:{heroMode:'interactive',categorySelectorMode:'generated',storefrontContent:{heroTitle:'Managed title'},sales:{checkoutEnabled:false,senderName:'Managed Sender'},analytics:{googleAnalyticsEnabled:true,googleAnalyticsMeasurementId:'G-TEST1234'},uiCopy:{nav:{shop:'Managed shop'}}}}})};
  };
  const settings=await getCustomerDirectSiteSettings({heroMode:'fixed',categorySelectorMode:'fixed',storefrontContent:{heroTitle:'Fallback title',heroBody:'Fallback body'},sales:{checkoutEnabled:true,senderName:'Fallback',supportEmail:'fallback@example.com'},analytics:{googleAnalyticsEnabled:false,googleAnalyticsMeasurementId:''},uiCopy:{nav:{shop:'Shop',cart:'Cart'}}});
  assert.equal(settings.heroMode,'interactive');
  assert.equal(settings.categorySelectorMode,'generated');
  assert.equal(settings.storefrontContent.heroTitle,'Managed title');
  assert.equal(settings.storefrontContent.heroBody,'Fallback body');
  assert.equal(settings.sales.checkoutEnabled,false);
  assert.equal(settings.sales.senderName,'deli.africa');
  assert.equal(settings.sales.supportEmail,'support@example.com');
  assert.equal(settings.analytics.googleAnalyticsMeasurementId,'G-TEST1234');
  assert.equal(settings.uiCopy.nav.shop,'Managed shop');
  assert.equal(settings.uiCopy.nav.cart,'Cart');
  assert.equal(settings.customerDirect.managed,true);
 }finally{
  global.fetch=originalFetch;
  process.env=originalEnv;
 }
});
