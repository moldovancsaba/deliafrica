export function requireTestDatabase(env=process.env){
 const name=env.CUSTOMER_DIRECT_TEST_DB;
 if(!name||!/^customer_direct_test_[a-z0-9_]+$/.test(name))throw new Error('A dedicated CUSTOMER_DIRECT_TEST_DB with customer_direct_test_ prefix is required.');
 const uri=env.CUSTOMER_DIRECT_TEST_MONGODB_URI;
 if(!uri||!/^mongodb(\+srv)?:\/\//.test(uri))throw new Error('CUSTOMER_DIRECT_TEST_MONGODB_URI is required; no production fallback is allowed.');
 const production=[env.MONGODB_DB,env.MONGODB_DB_NAME,env.PLATFORM_DATABASE_NAME].filter(Boolean);
 if(production.includes(name))throw new Error('Test database matches a production database.');
 return {name,uri};
}
