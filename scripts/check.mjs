import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const commands=[['--test',...fs.readdirSync('tests').filter(n=>n.endsWith('.test.mjs')).map(n=>'tests/'+n)],['scripts/baseline-check.mjs'],['node_modules/next/dist/bin/next','build']];
for(const args of commands){const result=spawnSync(process.execPath,args,{stdio:'inherit'});if(result.status!==0)process.exit(result.status||1);}
