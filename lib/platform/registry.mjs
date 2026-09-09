import mongoose from 'mongoose';
import {randomUUID,createHash} from 'node:crypto';
export class PlatformError extends Error {constructor(code,status=400){super(code);this.code=code;this.status=status;}}
const id={type:String,default:randomUUID};
export function registryModels(connection){
 const build=(name,fields,indexes=[])=>{if(connection.models[name])return connection.models[name];const s=new mongoose.Schema(fields,{timestamps:true,strict:'throw'});for(const [keys,options] of indexes)s.index(keys,options);return connection.model(name,s);};
 return {
  Organization:build('PlatformOrganization',{_id:id,name:{type:String,required:true,maxLength:160},status:{type:String,enum:['active','disabled'],default:'active'}}),
  Shop:build('PlatformShop',{_id:id,organizationId:{type:String,required:true},name:{type:String,required:true,maxLength:160},slug:{type:String,required:true},state:{type:String,enum:['draft','configuring','review','live','suspended','archived'],default:'draft'},mode:{type:String,enum:['catalogue','commerce'],default:'catalogue'},configVersion:{type:Number,default:1},databaseRef:{type:String,default:null},primaryDomain:{type:String,default:null},createKey:{type:String,required:true},createHash:{type:String,required:true},createdBy:{type:String,required:true}},[[{slug:1},{unique:true}],[{createKey:1},{unique:true}],[{organizationId:1},{}]]),
  Domain:build('PlatformDomain',{_id:id,host:{type:String,required:true},shopId:{type:String,required:true},verifiedAt:Date,certificateReady:{type:Boolean,default:false},primary:{type:Boolean,default:false},status:{type:String,enum:['requested','ready','removed'],default:'requested'}},[[{host:1},{unique:true}]]),
  Identity:build('PlatformIdentity',{_id:id,issuer:{type:String,required:true},subject:{type:String,required:true},email:String,name:String,active:{type:Boolean,default:true},authVersion:{type:Number,default:1}},[[{issuer:1,subject:1},{unique:true}]]),
  Role:build('PlatformRole',{identityId:{type:String,required:true},role:{type:String,enum:['superadmin'],required:true},active:{type:Boolean,default:true}},[[{identityId:1,role:1},{unique:true}]]),
  Membership:build('PlatformMembership',{identityId:{type:String,required:true},shopId:{type:String,required:true},role:{type:String,enum:['admin'],default:'admin'},status:{type:String,enum:['active','revoked'],default:'active'},version:{type:Number,default:1},grantedBy:{type:String,required:true}},[[{identityId:1,shopId:1},{unique:true}]]),
  AccessGrant:build('PlatformAccessGrant',{_id:id,actorId:{type:String,required:true},shopId:{type:String,required:true},reason:{type:String,required:true,maxLength:500},expiresAt:{type:Date,required:true},revokedAt:Date},[[{actorId:1,shopId:1,expiresAt:1},{}]]),
  Audit:build('PlatformAudit',{_id:id,actorId:{type:String,required:true},shopId:String,action:{type:String,required:true},result:{type:String,required:true},requestId:String,metadata:{type:mongoose.Schema.Types.Mixed,default:{}}},[[{shopId:1,createdAt:-1},{}]]),
  Connection:build('PlatformConnection',{_id:id,shopId:{type:String,required:true},databaseName:{type:String,required:true},fingerprint:{type:String,required:true},credentialVersion:{type:Number,default:1},uri:{type:mongoose.Schema.Types.Mixed,required:true},state:{type:String,enum:['candidate','verified','active','retired'],default:'candidate'},schemaVersion:{type:Number,default:1},verifiedAt:Date},[[{fingerprint:1},{unique:true}],[{shopId:1,credentialVersion:1},{unique:true}]])
 };
}
export function normalizeSlug(value){if(typeof value!=='string')throw new PlatformError('INVALID_SLUG');const slug=value.trim().toLowerCase();if(!/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(slug)||['www','admin','api','shops','auth','support','mail','static','media','platform'].includes(slug))throw new PlatformError('INVALID_SLUG');return slug;}
export async function createShop(models,{organizationId,name,slug,createdBy,idempotencyKey}){
 slug=normalizeSlug(slug);if(typeof name!=='string'||!name.trim()||name.length>160||typeof createdBy!=='string'||!createdBy||typeof idempotencyKey!=='string'||!idempotencyKey||idempotencyKey.length>100)throw new PlatformError('INVALID_SHOP');
 const createKey=createdBy+':'+idempotencyKey,createHash=createHashValue({organizationId,name:name.trim(),slug});
 const existing=await models.Shop.findOne({createKey}).lean();if(existing){if(existing.createHash!==createHash)throw new PlatformError('IDEMPOTENCY_CONFLICT',409);return existing;}
 const session=await models.Shop.db.startSession();let result;
 try{await session.withTransaction(async()=>{const org=await models.Organization.findOne({_id:organizationId,status:'active'}).session(session);if(!org)throw new PlatformError('ORGANIZATION_UNAVAILABLE',404);[result]=await models.Shop.create([{organizationId,name:name.trim(),slug,createdBy,createKey,createHash}],{session});await models.Audit.create([{actorId:createdBy,shopId:result.id,action:'shop.created',result:'success'}],{session});});return result.toObject();}
 catch(error){if(error?.code===11000){const retry=await models.Shop.findOne({createKey}).lean();if(retry?.createHash===createHash)return retry;throw new PlatformError('SHOP_CONFLICT',409);}throw error;}finally{await session.endSession();}
}
function createHashValue(value){return createHash('sha256').update(JSON.stringify(value)).digest('hex');}
export async function identityForSession(models,session){if(!session?.user?.id||!session?.issuer)throw new PlatformError('UNAUTHENTICATED',401);const identity=await models.Identity.findOne({issuer:session.issuer,subject:session.user.id,active:true}).lean();if(!identity)throw new PlatformError('IDENTITY_UNAVAILABLE',403);return identity;}
export async function requirePlatformSuperadmin(models,session){const identity=await identityForSession(models,session);if(!await models.Role.exists({identityId:identity._id,role:'superadmin',active:true}))throw new PlatformError('SUPERADMIN_REQUIRED',403);return identity;}
export async function requireShopAccess(models,session,shopId,{now=new Date()}={}){
 const identity=await identityForSession(models,session);const membership=await models.Membership.findOne({identityId:identity._id,shopId,status:'active',role:'admin'}).lean();
 if(membership)return {identity,shopId,source:'membership'};
 const isSuper=await models.Role.exists({identityId:identity._id,role:'superadmin',active:true});
 if(isSuper){const grant=await models.AccessGrant.findOne({actorId:identity._id,shopId,expiresAt:{$gt:now},revokedAt:null}).lean();if(grant)return {identity,shopId,source:'grant',grantId:grant._id};}
 throw new PlatformError('SHOP_ACCESS_DENIED',403);
}
