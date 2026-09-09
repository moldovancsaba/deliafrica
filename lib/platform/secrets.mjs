import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
const fail=()=>new Error('Credential envelope invalid or encryption key unavailable.');
function keyFor(id,keys){const encoded=keys?.[id];if(typeof encoded!=='string')throw fail();const key=Buffer.from(encoded,'base64');if(key.length!==32||key.toString('base64')!==encoded)throw fail();return key;}
function aad(context){if(!context||['shopId','provider','field'].some(k=>typeof context[k]!=='string'||!context[k]||context[k].length>160))throw fail();return Buffer.from(JSON.stringify([1,context.shopId,context.provider,context.field]));}
export function encryptCredential(context,value,{activeKeyId,keys}){
 if(typeof value!=='string'||!value||Buffer.byteLength(value)>16384)throw fail();
 const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',keyFor(activeKeyId,keys),iv);cipher.setAAD(aad(context));
 const ciphertext=Buffer.concat([cipher.update(value,'utf8'),cipher.final()]);
 return {v:1,keyId:activeKeyId,iv:iv.toString('base64url'),ciphertext:ciphertext.toString('base64url'),tag:cipher.getAuthTag().toString('base64url')};
}
export function decryptCredential(context,envelope,{keys}){
 try{if(envelope?.v!==1)throw fail();const iv=Buffer.from(envelope.iv,'base64url'),tag=Buffer.from(envelope.tag,'base64url');if(iv.length!==12||tag.length!==16||typeof envelope.ciphertext!=='string'||envelope.ciphertext.length>24000)throw fail();const decipher=createDecipheriv('aes-256-gcm',keyFor(envelope.keyId,keys),iv);decipher.setAAD(aad(context));decipher.setAuthTag(tag);return Buffer.concat([decipher.update(Buffer.from(envelope.ciphertext,'base64url')),decipher.final()]).toString('utf8');}catch{throw fail();}
}
export function rotateCredential(context,envelope,keyring){return encryptCredential(context,decryptCredential(context,envelope,keyring),keyring);}
export function environmentKeyring(env=process.env){try{return {activeKeyId:env.CUSTOMER_DIRECT_ACTIVE_KEY_ID,keys:JSON.parse(env.CUSTOMER_DIRECT_ENCRYPTION_KEYS||'{}')};}catch{throw fail();}}
