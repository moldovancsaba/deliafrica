import mongoose from 'mongoose';import {createHash} from 'node:crypto';import {registryModels,PlatformError} from './registry.mjs';
const connections=globalThis.__customerDirectRegistryConnections||new Map();globalThis.__customerDirectRegistryConnections=connections;
export async function connectRegistry(env=process.env){
 const uri=env.CUSTOMER_DIRECT_PLATFORM_MONGODB_URI,name=env.CUSTOMER_DIRECT_PLATFORM_DB;
 if(!uri||!name||!/^[A-Za-z0-9_-]{1,64}$/.test(name))throw new PlatformError('PLATFORM_DATABASE_NOT_CONFIGURED',503);
 const key=createHash('sha256').update(uri+'\0'+name).digest('hex');let promise=connections.get(key);
 if(!promise){promise=mongoose.createConnection(uri,{dbName:name,bufferCommands:false,autoIndex:false,maxPoolSize:5,serverSelectionTimeoutMS:5000,connectTimeoutMS:5000,socketTimeoutMS:10000}).asPromise();connections.set(key,promise);promise.catch(()=>{if(connections.get(key)===promise)connections.delete(key);});}
 try{const connection=await promise;return {connection,models:registryModels(connection)};}catch{throw new PlatformError('PLATFORM_DATABASE_UNAVAILABLE',503);}
}
export async function closeRegistryConnections(){const promises=[...connections.values()];connections.clear();await Promise.allSettled(promises.map(p=>p.then(c=>c.close())));}
