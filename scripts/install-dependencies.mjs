import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';
// pnpm 11 deliberately rejects interpolated credentials in repository-owned .npmrc.
// Restrict the trusted temporary user config to the approved GDS registry.
const dir=mkdtempSync(join(tmpdir(),'customer-direct-npm-'));const config=join(dir,'npmrc');
try{
 if(!process.env.GITHUB_TOKEN)throw new Error('GITHUB_TOKEN is required for the approved GDS registry.');
 writeFileSync(config,'@sovereignsquad:registry=https://npm.pkg.github.com\n//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}\n',{mode:0o600});
 const args=process.argv.slice(2);const result=spawnSync(process.env.CUSTOMER_DIRECT_PNPM_BIN||'pnpm',args.length?args:['install','--frozen-lockfile'],{env:{...process.env,NPM_CONFIG_USERCONFIG:config,npm_config_userconfig:config},stdio:'inherit'});process.exitCode=result.status===0?0:1;
}finally{rmSync(dir,{recursive:true,force:true});}
