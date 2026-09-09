import mongoose from 'mongoose';import {createHash} from 'node:crypto';import {isIP} from 'node:net';import {resolve4,resolve6} from 'node:dns/promises';
import {decryptCredential} from './secrets.mjs';import {PlatformError} from './registry.mjs';
export function mongoTarget(uri,databaseName,{allowLoopback=false}={}){
 if(typeof databaseName!=='string'||!/^[A-Za-z0-9_-]{1,64}$/.test(databaseName))throw new PlatformError('INVALID_DATABASE_NAME');
 let url;try{url=new URL(uri);}catch{throw new PlatformError('INVALID_DATABASE_URI');}
 if(!['mongodb:','mongodb+srv:'].includes(url.protocol)||url.hash)throw new PlatformError('INVALID_DATABASE_URI');
 const host=url.hostname.toLowerCase();if(!host||host.includes(','))throw new PlatformError('UNSUPPORTED_DATABASE_HOST');
 if(!allowLoopback&&(host==='localhost'||isIP(host)||host.endsWith('.local')))throw new PlatformError('DATABASE_HOST_NOT_ALLOWED');
 const allowedOptions=new Set(['retryWrites','w','authSource','replicaSet','tls','appName','directConnection']);for(const key of url.searchParams.keys())if(!allowedOptions.has(key))throw new PlatformError('UNSUPPORTED_DATABASE_OPTION');
 if(!allowLoopback&&(url.protocol!=='mongodb+srv:'||url.searchParams.get('tls')==='false'))throw new PlatformError('DATABASE_TLS_REQUIRED');
 return {host,fingerprint:createHash('sha256').update(host+':'+(url.port||'27017')+'/'+databaseName).digest('hex')};
}
export async function assertPublicHost(host){
 const addresses=(await Promise.allSettled([resolve4(host),resolve6(host)])).flatMap(r=>r.status==='fulfilled'?r.value:[]);
 // MongoDB Atlas SRV hostnames need not have A/AAAA records; require the Atlas suffix for the first supported onboarding lane.
 if(!host.endsWith('.mongodb.net'))throw new PlatformError('DATABASE_PROVIDER_NOT_SUPPORTED');
 for(const ip of addresses)if(/^(127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.|0\.|::1$|f[cd]|fe80)/i.test(ip))throw new PlatformError('DATABASE_HOST_NOT_ALLOWED');
}
export class ShopConnectionPool {
 constructor({keyring,allowLoopback=false,maxConnections=10,idleMs=300000}={}){this.keyring=keyring;this.allowLoopback=allowLoopback;this.maxConnections=maxConnections;this.idleMs=idleMs;this.entries=new Map();}
 async acquire(record){
  if(!record||record.state!=='active')throw new PlatformError('SHOP_DATABASE_UNAVAILABLE',503);
  const key=record.shopId+':'+record.credentialVersion;let entry=this.entries.get(key);const now=Date.now();
  for(const [k,e] of this.entries)if(e.users===0&&now-e.lastUsed>this.idleMs){this.entries.delete(k);await e.promise.then(c=>c.close()).catch(()=>{});}
  if(!entry){if(this.entries.size>=this.maxConnections)throw new PlatformError('DATABASE_POOL_BUSY',503);const uri=decryptCredential({shopId:record.shopId,provider:'mongodb',field:'uri'},record.uri,this.keyring);const target=mongoTarget(uri,record.databaseName,{allowLoopback:this.allowLoopback});
   entry={users:0,lastUsed:now};entry.promise=(async()=>{if(!this.allowLoopback)await assertPublicHost(target.host);return mongoose.createConnection(uri,{dbName:record.databaseName,bufferCommands:false,autoIndex:false,maxPoolSize:5,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000,socketTimeoutMS:10000}).asPromise();})();this.entries.set(key,entry);entry.promise.catch(()=>{if(this.entries.get(key)===entry)this.entries.delete(key);});
  }
  entry.users++;try{const connection=await entry.promise;let released=false;return {connection,release:()=>{if(!released){entry.users--;entry.lastUsed=Date.now();released=true;}}};}catch{entry.users--;throw new PlatformError('SHOP_DATABASE_UNAVAILABLE',503);}
 }
 async close(){const entries=[...this.entries.values()];this.entries.clear();await Promise.allSettled(entries.map(e=>e.promise.then(c=>c.close())));}
}
