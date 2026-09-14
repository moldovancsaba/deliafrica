import test from 'node:test';
import assert from 'node:assert/strict';
import {promises as fs} from 'node:fs';
import path from 'node:path';

const reportFile=path.join(process.cwd(),'test-results','deli-i18n-release-report.json');
const evidence=[];
const issueRef='#39';
const supportedLocales=['hu'];
const rtlFixtures=['ar-XB'];

function record(flow,method,result,details={}){evidence.push({issueRef,flow,method,result,details});}
async function source(file){return fs.readFile(path.join(process.cwd(),file),'utf8');}
async function writeReport(){
 await fs.mkdir(path.dirname(reportFile),{recursive:true});
 await fs.writeFile(reportFile,JSON.stringify({schemaVersion:1,issue:39,status:evidence.every(item=>item.result==='passed')?'passed':'failed',supportedLocales,rtlFixtures,evidence},null,2)+'\n');
}

test('preserved deli storefront exposes required checkout and consent copy',async()=>{
 const storefront=await source('lib/storefront-copy.js');
 const siteSettings=await source('lib/site-config.js');
 const combined=`${storefront}\n${siteSettings}`;
 const requiredCopy=[
  /checkout:\s*\{/,
  /submit:\s*['"]Rendelés leadása['"]/,
  /accessibility:\s*\{/,
  /close:\s*['"]Bezárás['"]/,
  /cartDecrease:\s*['"]Mennyiség csökkentése['"]/,
  /cartIncrease:\s*['"]Mennyiség növelése['"]/
 ];
 const requiredConsent=[
  /cookieBanner:\s*\{/,
  /accept:\s*['"]Elfogadom['"]/,
  /reject:\s*['"]Csak szükséges['"]/
 ];
 for(const token of requiredCopy)assert.match(combined,token);
 for(const token of requiredConsent)assert.match(siteSettings,token);
 record('preserved-ui-copy-contract','node:test','passed',{requiredGroups:['cart','checkout','cookieBanner','accessibility'],locale:'hu'});
 await writeReport();
});

test('RTL fixture remains test-only for preserved deli UI',async()=>{
 const combined=`${await source('lib/storefront-copy.js')}\n${await source('lib/site-config.js')}`;
 assert.equal(combined.includes('ar-XB'),false);
 assert.equal(combined.includes('locale: "ar"'),false);
 record('rtl-fixture-boundary','node:test','passed',{fixtures:rtlFixtures,advertisedLocales:supportedLocales});
 await writeReport();
});
