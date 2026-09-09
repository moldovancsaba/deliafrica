import test from 'node:test';import assert from 'node:assert/strict';import mongoose from 'mongoose';import {randomBytes} from 'node:crypto';
import {requireTestDatabase} from '../../scripts/test-environment.mjs';import {registryModels,createShop,requireShopAccess,requirePlatformSuperadmin} from '../../lib/platform/registry.mjs';import {encryptCredential} from '../../lib/platform/secrets.mjs';import {ShopConnectionPool} from '../../lib/platform/connections.mjs';
const {name,uri}=requireTestDatabase();const ring={activeKeyId:'test',keys:{test:randomBytes(32).toString('base64')}};
test('real Mongo replica-set tenant registry, encryption and authorization boundaries',async t=>{
 const c=await mongoose.createConnection(uri,{dbName:name,serverSelectionTimeoutMS:5000}).asPromise();const m=registryModels(c);const pool=new ShopConnectionPool({keyring:ring,allowLoopback:true});
 try{
  await c.dropDatabase();await Promise.all(Object.values(m).map(model=>model.init()));
  const org=await m.Organization.create({name:'Synthetic owner'});const input={organizationId:org.id,name:'Synthetic shop',slug:'test-shop',createdBy:'operator',idempotencyKey:'create-one'};
  const [a,b]=await Promise.all([createShop(m,input),createShop(m,input)]);assert.equal(a._id,b._id);assert.equal(await m.Shop.countDocuments(),1);assert.equal(await m.Audit.countDocuments(),1);
  await assert.rejects(createShop(m,{...input,name:'Changed'}),e=>e.code==='IDEMPOTENCY_CONFLICT');
  await assert.rejects(createShop(m,{...input,idempotencyKey:'another'}),e=>e.code==='SHOP_CONFLICT');
  const identity=await m.Identity.create({issuer:'https://sso.example.invalid',subject:'verified-test'});const session={issuer:identity.issuer,user:{id:identity.subject},permission:{role:'admin',status:'approved'}};
  await assert.rejects(requirePlatformSuperadmin(m,session),e=>e.code==='SUPERADMIN_REQUIRED');
  await m.Membership.create({identityId:identity.id,shopId:a._id,grantedBy:'operator'});assert.equal((await requireShopAccess(m,session,a._id)).source,'membership');
  await assert.rejects(requireShopAccess(m,session,'foreign-shop'),e=>e.code==='SHOP_ACCESS_DENIED');
  await m.Membership.updateOne({identityId:identity.id},{$set:{status:'revoked'}});await assert.rejects(requireShopAccess(m,session,a._id));
  await m.Role.create({identityId:identity.id,role:'superadmin'});await assert.rejects(requireShopAccess(m,session,a._id));
  await m.AccessGrant.create({actorId:identity.id,shopId:a._id,reason:'Synthetic test',expiresAt:new Date(Date.now()+60000)});assert.equal((await requireShopAccess(m,session,a._id)).source,'grant');await assert.rejects(requireShopAccess(m,session,a._id,{now:new Date(Date.now()+120000)}));
  const records=['a','b'].map(shopId=>({shopId,state:'active',credentialVersion:1,databaseName:name+'_'+shopId,uri:encryptCredential({shopId,provider:'mongodb',field:'uri'},uri,ring)}));
  const leases=await Promise.all(records.map(r=>pool.acquire(r)));
  try{for(let i=0;i<leases.length;i++){const model=leases[i].connection.model('FixtureProduct',new mongoose.Schema({_id:String,value:String}));await model.create({_id:'same-id',value:records[i].shopId});assert.equal((await model.findById('same-id')).value,records[i].shopId);}assert.notEqual(leases[0].connection.name,leases[1].connection.name);}
  finally{for(const l of leases){await l.connection.dropDatabase();l.release();}}
  await assert.rejects(pool.acquire({...records[0],shopId:'foreign'}));
  await assert.rejects(pool.acquire({...records[0],state:'candidate'}));
 }finally{await pool.close();await c.dropDatabase();await c.close();}
});
