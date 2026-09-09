import { test,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {createHmac} from 'node:crypto';
async function admin(context){
 const payload=Buffer.from(JSON.stringify({user:{id:'synthetic-admin',name:'Test Admin',email:'admin@example.invalid'},permission:{role:'admin',status:'approved'},expiresAt:Date.now()+3600000})).toString('base64url');
 await context.addCookies([{name:'deli-session',value:payload+'.'+createHmac('sha256','local-gds-test-only').update(payload).digest('base64url'),domain:'127.0.0.1',path:'/'}]);
}
async function a11y(page){await page.waitForTimeout(350);const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(results.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);}
test('Coral storefront, responsive layout, cart and keyboard dismissal',async({page})=>{
 const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');await page.getByRole('button',{name:'Csak szükséges',exact:true}).last().click();await expect(page.getByRole('dialog')).toHaveCount(0);await expect(page.locator('html')).toHaveAttribute('data-gds-theme-preset','coral');
 await expect.poll(()=>page.locator('#top').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(2);await expect(page.locator('[data-gds-media-shimmer]')).toHaveCount(0);await page.screenshot({path:'test-results/storefront-desktop.png'});await a11y(page);await page.getByRole('button',{name:/Kosár \(/}).click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);
 for(const width of [390,768,1280]){await page.setViewportSize({width,height:900});await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);}
 await page.screenshot({path:'test-results/verified-page.png'});expect(errors).toEqual([]);
});
test('admin routes render without runtime errors and expose labelled settings',async({page,context})=>{
 await admin(context);await context.addInitScript(()=>localStorage.setItem('deli-cookie-consent','necessary'));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['','/products','/orders','/users','/integrations','/content','/legal','/storefront','/system']){await page.goto('/dashboard'+route);await expect(page.locator('h1')).toHaveCount(1);await a11y(page);}
 await page.goto('/dashboard/integrations');await expect(page.getByLabel('GA4 Measurement ID')).toBeVisible();await expect(page.getByLabel('Google Analytics engedélyezve')).toBeVisible();expect(errors).toEqual([]);
});
test('product, category, legal and profile surfaces',async({page,context})=>{
 await admin(context);await context.addInitScript(()=>localStorage.setItem('deli-cookie-consent','necessary'));
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');const productLink=await page.locator('a[href^="/categories/"]').first().getAttribute('href');await page.goto(productLink);await a11y(page);const product=await page.locator('a[href^="/products/"]').first().getAttribute('href');await page.goto(product);await a11y(page);
 for(const path of ['/legal/privacy','/profile','/auth/error']){await page.goto(path);await a11y(page);}expect(errors).toEqual([]);
});
test('cart quantity and checkout failure preserve the basket',async({page,context})=>{
 await context.addInitScript(()=>localStorage.setItem('deli-cookie-consent','necessary'));
 await page.route('**/api/auth/session',r=>r.fulfill({json:{authenticated:true,configured:true,user:{name:'Test Buyer',email:'buyer@example.invalid'}}}));
 await page.route('**/api/orders',r=>r.fulfill({status:503,json:{error:'Átmeneti szolgáltatási hiba'}}));
 await page.goto('/');await page.getByRole('button',{name:/Kosárba:/}).first().click();const cart=page.getByRole('dialog');await expect(cart).toBeVisible();await a11y(page);
 await cart.getByRole('button',{name:/Tovább|Megrendel|Pénztár|Rendelés/}).click();const checkout=page.getByRole('dialog');await expect(checkout.getByRole('textbox',{name:/név/i})).toBeVisible();await checkout.getByRole('textbox',{name:/cím/i}).fill('Test address');await checkout.locator('button[type="submit"]').click();await expect(checkout.getByRole('alert')).toContainText('Átmeneti');expect(await page.evaluate(()=>Object.keys(JSON.parse(localStorage.getItem('deli-cart'))).length)).toBeGreaterThan(0);
});
