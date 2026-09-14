import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {promises as fs} from 'node:fs';
import path from 'node:path';
import {execSync} from 'node:child_process';

test.describe.configure({mode:'serial'});

const reportFile=path.join(process.cwd(),'test-results','deli-preserved-a11y-report.json');
const commit=execSync('git rev-parse HEAD',{encoding:'utf8'}).trim();
const issueRef='#39';
const evidence=[];

function addEvidence({viewport,flow,method,result='passed',details={}}){evidence.push({commit,theme:'preserved-deli-ui',locale:'hu',viewport,flow,method,result,issueRef,details});}
async function writeReport(){
 await fs.mkdir(path.dirname(reportFile),{recursive:true});
 await fs.writeFile(reportFile,JSON.stringify({schemaVersion:1,issue:39,status:evidence.every(item=>item.result==='passed')?'passed':'failed',generatedAt:new Date().toISOString(),commit,evidence},null,2)+'\n');
}
async function axe(page,meta){
 const violations=(await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
 expect(violations).toEqual([]);
 addEvidence({...meta,method:'axe wcag2a/wcag2aa/wcag21aa',details:{violations:0}});
}
async function expectNoHorizontalOverflow(page,meta){
 const metrics=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,innerWidth:window.innerWidth}));
 expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.innerWidth+1);
 addEvidence({...meta,method:'reflow overflow check',details:metrics});
}
async function routeStorefront(page){
 const product={id:'a11y-peri-peri',slug:'a11y-peri-peri',sku:'A11Y-PERI',name:'Peri-Peri Sauce',subtitle:'Braai sauce',category:'braai',categoryName:'Braai',badge:'Teszt',tone:'red',visual:'bottle',price:1990,purchasable:true,story:'Teszt termék a kosár és checkout akadálymentességi ellenőrzéséhez.',brand:'deli.africa',originCountry:'South Africa'};
 await page.route('**/api/auth/session',route=>route.fulfill({json:{authenticated:false,configured:false}}));
 await page.route('**/api/profile',route=>route.fulfill({status:404,json:{}}));
 await page.route('**/api/catalog',route=>route.fulfill({json:{products:[product]}}));
 await page.route('**/api/orders',async route=>{
  if(route.request().method()==='POST')return route.fulfill({status:400,json:{ok:false,error:'Szintetikus checkout hiba'}});
  return route.fallback();
 });
}

test.afterAll(writeReport);

test('preserved deli storefront covers consent basket checkout and validation',async({page})=>{
 await routeStorefront(page);
 await page.setViewportSize({width:1280,height:900});
 await page.goto('/');
 await expect(page.locator('html')).toHaveAttribute('lang','hu');
 await expect(page.getByRole('dialog',{name:'Sütik és adatvédelem'})).toBeVisible();
 await axe(page,{viewport:'1280x900',flow:'cookie consent'});
 await page.getByRole('button',{name:'Csak szükséges',exact:true}).click();
 await expect(page.getByRole('dialog',{name:'Sütik és adatvédelem'})).toHaveCount(0);
 addEvidence({viewport:'1280x900',flow:'consent reject',method:'button and dialog dismissal'});

 await page.getByRole('button',{name:'+'}).first().click();
 await expect(page.getByRole('heading',{name:'Kosár',exact:true})).toBeVisible();
 await axe(page,{viewport:'1280x900',flow:'basket drawer'});
 await page.getByRole('button',{name:'Tovább a rendeléshez',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Rendelés',exact:true})).toBeVisible();
 await axe(page,{viewport:'1280x900',flow:'checkout modal'});
 await page.getByLabel('Név').fill('Teszt Vásárló');
 await page.getByLabel('E-mail').fill('teszt@example.invalid');
 await page.getByLabel('Szállítási cím').fill('Teszt utca 1, Budapest');
 await page.getByRole('button',{name:'Rendelés leadása',exact:true}).click();
 await expect(page.getByRole('alert').filter({hasText:'Szintetikus checkout hiba'})).toContainText('Szintetikus checkout hiba');
 addEvidence({viewport:'1280x900',flow:'checkout validation',method:'role alert after failed synthetic order'});
});

test('preserved deli storefront keeps mobile and zoom reflow usable',async({page})=>{
 await routeStorefront(page);
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('button',{name:'Csak szükséges',exact:true}).click();
 await expectNoHorizontalOverflow(page,{viewport:'390x844',flow:'mobile reflow'});
 await page.addStyleTag({content:'html{font-size:200% !important;}'});
 await expectNoHorizontalOverflow(page,{viewport:'390x844 plus 200% root text',flow:'200% zoom reflow'});
 await axe(page,{viewport:'390x844 plus 200% root text',flow:'mobile zoom'});
});
