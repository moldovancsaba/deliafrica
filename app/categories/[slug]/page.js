import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import ProductVisual from '@/app/components/ProductVisual';
import AddToCartButton from '@/app/components/AddToCartButton';
import { categories, formatPrice } from '@/lib/products';
import { getProductsWithSettings } from '@/lib/product-catalog';
import { fixedHeroByCategory } from '@/lib/hero-config';
import { getSiteSettings } from '@/lib/site-settings';
import { applyTemplate } from '@/lib/storefront-copy';

const siteUrl='https://deli.doneisbetter.com';
export const dynamic='force-dynamic';
const heroScenes={braai:'/hero-scenes/braai.webp',spices:'/hero-scenes/spices.webp',pate:'/hero-scenes/pate.webp',tea:'/hero-scenes/tea.webp',snacks:'/hero-scenes/snacks.webp',pantry:'/hero-scenes/pantry.webp'};

export async function generateMetadata({params}){
  const [{slug},settings]=await Promise.all([params,getSiteSettings()]);
  const data=settings.uiCopy.categories?.[slug];
  if(!data)return{};
  return{title:data.title,description:data.lead,alternates:{canonical:`/categories/${slug}`}};
}

export default async function CategoryPage({params}){
  const [{slug},catalog,settings]=await Promise.all([params,getProductsWithSettings(),getSiteSettings()]);
  const category=categories.find(item=>item.id===slug);
  const data=settings.uiCopy.categories?.[slug];
  const copy=settings.uiCopy.categoryPage;
  const productCopy=settings.uiCopy.productPage;
  if(!category||!data)notFound();
  const items=catalog.filter(product=>product.category===slug);
  const schemas=[
    {'@context':'https://schema.org','@type':'CollectionPage',name:data.title,description:data.lead,url:`${siteUrl}/categories/${slug}`},
    {'@context':'https://schema.org','@type':'ItemList',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,url:`${siteUrl}/products/${item.slug}`,name:item.name}))},
    {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:copy.home,item:siteUrl},{'@type':'ListItem',position:2,name:data.label,item:`${siteUrl}/categories/${slug}`}]}];
  return <main className={`category-page category-${category.tone}`}>
    {schemas.map((schema,index)=><script key={index} type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(schema).replace(/</g,'\\u003c')}}/>)}
    <header className="site-header product-header"><Link href="/" className="brand-link" aria-label={settings.uiCopy.accessibility?.home}><BrandLogo /></Link><nav><Link href="/#shop">{copy.navShop}</Link><Link href="/#story">{copy.navStory}</Link></nav><Link className="button button-dark" href="/#shop">{copy.allProducts}</Link></header>
    <div className="product-breadcrumb"><Link href="/">{copy.home}</Link><span>/</span><span>{data.label}</span></div>
    <section className={`category-hero hero-mode-${settings.heroMode}`}>{settings.heroMode==='fixed'&&<Image className="fixed-hero-image" src={fixedHeroByCategory[slug]} alt={applyTemplate(copy.heroAltTemplate,{category:data.label})} fill priority sizes="100vw"/>}<div className="category-hero-copy"><span className="eyebrow">{applyTemplate(settings.uiCopy.shop.categoryCountTemplate,{count:items.length})}</span><h1>{data.title}</h1><p>{data.lead}</p></div>{settings.heroMode==='interactive'&&<div className="category-hero-art" style={{backgroundImage:`url(${heroScenes[slug]})`}}>{items[0]&&<ProductVisual product={items[0]} hero large/>}</div>}</section>
    <section className="category-story"><div><span className="eyebrow dark">{copy.whyEyebrow}</span><h2>{copy.whyTitle}</h2></div><div><p>{data.context}</p><strong>{data.tip}</strong></div></section>
    <section className="category-products"><span className="eyebrow dark">{copy.productsEyebrow}</span><h2>{copy.productsTitle}</h2><div>{items.map(item=><article className="category-product-card" key={item.id}><Link className="category-product-link" href={`/products/${item.slug}`}><ProductVisual product={item}/><small>{item.subtitle}</small><h3>{item.name}</h3><p>{item.story}</p></Link><div className="category-product-actions"><b>{formatPrice(item.price)}</b>{item.price==null||item.purchasable===false?<button className="button button-muted" disabled>{copy.unavailable}</button>:<AddToCartButton productId={item.id} label={productCopy.addToCart} addedLabel={productCopy.addedToCart}/>}</div><Link className="category-detail-link" href={`/products/${item.slug}`}>{copy.detailsLink}</Link></article>)}</div></section>
  </main>;
}
