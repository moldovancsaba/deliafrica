import {connectRegistry,closeRegistryConnections} from '../lib/platform/database.mjs';
const args=process.argv.slice(2);const identityId=args[args.indexOf('--identity-id')+1];
try{
 if(!args.includes('--identity-id')||!identityId||identityId.startsWith('--'))throw new Error('Use --identity-id with an existing verified platform identity; email alone cannot grant access.');
 const {models}=await connectRegistry();const identity=await models.Identity.findOne({_id:identityId,active:true}).lean();if(!identity)throw new Error('Existing platform identity required. Sign in through the verified SSO flow first.');
 if(!args.includes('--apply')){console.log(JSON.stringify({mode:'dry-run',identityId,role:'superadmin',changes:0}));}
 else{const session=await models.Role.db.startSession();try{await session.withTransaction(async()=>{await models.Role.updateOne({identityId,role:'superadmin'},{$set:{active:true}},{upsert:true,session,runValidators:true});await models.Audit.create([{actorId:'operator-bootstrap',action:'platform.superadmin.bootstrap',result:'success',metadata:{identityId}}],{session});});console.log(JSON.stringify({mode:'applied',identityId,role:'superadmin'}));}finally{await session.endSession();}}
}catch(e){console.error(e.message==='Existing platform identity required. Sign in through the verified SSO flow first.'?e.message:'Bootstrap failed: verify arguments and platform database configuration. No email-based role inference is allowed.');process.exitCode=1;}finally{await closeRegistryConnections();}
