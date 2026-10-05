import {NextResponse} from 'next/server';
import {customerDirectConfig,customerDirectManagementUrl} from './customer-direct-store.js';
export {customerDirectManagementUrl};

export function managedAdminResponse(){
 const config=customerDirectConfig();
 if(!config.enabled)return null;
 const managementUrl=customerDirectManagementUrl();
 return NextResponse.json({error:'CUSTOMER_DIRECT_MANAGED',message:'This deli admin surface is managed in Customer Direct.',managementUrl},{status:410,headers:{Location:managementUrl,'cache-control':'no-store'}});
}
