import test from 'node:test';
import assert from 'node:assert/strict';
import {customerDirectConfig,mapCustomerDirectProduct} from '../lib/customer-direct-store.js';

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
