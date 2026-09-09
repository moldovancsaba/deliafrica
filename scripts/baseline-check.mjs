import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
export function scan(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?scan(path.join(dir,e.name)):[path.join(dir,e.name)]).sort();}
export function inventory(base=root){
 const files=['app','models','lib'].flatMap(d=>scan(path.join(base,d)));
 const names=new Set(); for(const f of files){const src=fs.readFileSync(f,'utf8');for(const m of src.matchAll(/process\.env\.([A-Za-z_][A-Za-z_0-9]*)/g))names.add(m[1]);}
 return {routes:files.filter(f=>/\/(page|route)\.js$/.test(f)).map(f=>path.relative(base,f)),models:files.filter(f=>f.includes('/models/')).map(f=>path.relative(base,f)),environmentNames:[...names].sort(),globalModelConsumers:files.filter(f=>/from ['"]@\/models\//.test(fs.readFileSync(f,'utf8'))).map(f=>path.relative(base,f))};
}
export function validateFixture(f){
 assert.equal(f.synthetic,true);assert.equal(f.environment,'nonproduction');
 assert.equal(f.orders[0].currency,'HUF');assert.equal(f.orders[0].total,f.orders[0].items.reduce((n,i)=>n+i.quantity*i.unitPrice,0));
 assert(f.customers.every(c=>c.email.endsWith('@example.invalid')));
 assert.equal(f.behavior.databaseUnavailable.successReported,true);
 assert.equal(f.behavior.databaseUnavailable.safeForProduction,false);
 return true;
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const args=process.argv.slice(2);const fixture=args.includes('--fixture')?args[args.indexOf('--fixture')+1]:path.join(root,'tests/fixtures/legacy-deli.json');
 validateFixture(JSON.parse(fs.readFileSync(fixture,'utf8')));
 const baseline=JSON.parse(fs.readFileSync(path.join(root,'docs/customer-direct/baseline/inventory.json'),'utf8'));const current=inventory();
 for(const key of ['routes','models'])for(const original of baseline[key])assert(current[key].includes(original),`Legacy ${key} missing: ${original}; an explicit migration mapping is required.`);
 const report={status:'passed',checkedAt:new Date().toISOString(),baselineCommit:baseline.commit,routes:current.routes.length,models:current.models.length,fixture:'synthetic',databaseAccess:false};
 if(args.includes('--report'))fs.writeFileSync(args[args.indexOf('--report')+1],JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
}
