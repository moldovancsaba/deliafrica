import Link from 'next/link';
import { notFound } from 'next/navigation';
import BrandLogo from '@/app/components/BrandLogo';
import ProductVisual from '@/app/components/ProductVisual';
import { categories, products, formatPrice } from '@/lib/products';
import { APP_VERSION } from '@/lib/version';

const siteUrl = 'https://deli.doneisbetter.com';
const copy = {
  braai: { title: 'Braai szószok dél-afrikai grillezéshez', lead: 'Peri-peri szószok és karakteres ízek húsokhoz, zöldségekhez, pácokhoz és mártogatósokhoz.', context: 'A braai több egyszerű grillezésnél: közös étkezés, tűz és együtt töltött idő. Ebben a válogatásban olyan szószokat találsz, amelyek gyorsan adnak savasságot, chilit és fűszeres mélységet a kész fogásokhoz.', tip: 'Kezdd kevés szósszal, majd kóstolás után rétegezd tovább az ízt.' },
  spices: { title: 'Fűszerek és rubok a hétköznapi főzéstől a braaiig', lead: 'Száraz keverékek curryhez, grillezéshez, sült zöldségekhez és gyors pácokhoz.', context: 'Az őrölt currykeverékek és rubok egyszerű módon adnak összetett, meleg vagy csípős karaktert. Használhatod őket közvetlenül az alapanyagon, olajjal elkeverve vagy a főzés elején hagymával röviden megpirítva.', tip: 'Első használatkor adagolj visszafogottan; a fűszer intenzitása főzés közben erősödhet.' },
  pate: { title: 'Dél-afrikai vadhúsos pástétomok', lead: 'Karakteres, kenhető különlegességek pirítóshoz, hidegtálhoz és kíváncsi kóstolóknak.', context: 'A vadhúsos pástétomokat érdemes egyszerű kísérőkkel tálalni, hogy a húsos és fűszeres karakter érvényesüljön. Ropogós kenyér, savanyúság vagy enyhén édes chutney jó kiindulópont.', tip: 'Tálalás előtt röviden hagyd temperálódni, és mindig ellenőrizd a csomagolás tárolási útmutatóját.' },
  tea: { title: 'Rooibos tea és dél-afrikai rusks', lead: 'Koffeinmentes rooibos és mártogatásra kész, ropogós rusk a lassabb reggelekhez.', context: 'A rooibos a dél-afrikai Cederberg térségéhez kötődik, lágy, mézes-fás karaktere pedig önmagában, tejjel vagy jegesen is működik. A rusk keményre szárított sütemény, amelyet hagyományosan meleg italba mártva fogyasztanak.', tip: 'A rooibost 5–7 percig áztasd; a ruskot csak röviden mártsd az italba.' },
  snacks: { title: 'Dél-afrikai snackek és italok', lead: 'Ismerős formák különleges dél-afrikai karakterrel, reggelitől az esti nassolásig.', context: 'A kakaós-malátás italpor, a mogyoróvaj és a sós biltong ízesítő különböző alkalmakra való, de közös bennük a könnyű használhatóság. A termékoldalakon konkrét párosításokat és első kóstolási ötleteket találsz.', tip: 'Válassz az alkalom szerint: italhoz Milo, krémes reggelihez mogyoróvaj, sós befejezéshez biltong por.' },
  pantry: { title: 'Kamra-alapok dél-afrikai ihletéssel', lead: 'Sokoldalú alapanyagok salátához, kenyérhez, grillezéshez és gyors hétköznapi fogásokhoz.', context: 'Egy jó kamra-alap nem uralja az ételt, hanem összeköti az ízeket. A válogatás termékei többféle fogásban használhatók, a legegyszerűbb tálalástól a braai köretekig.', tip: 'Tárold a csomagolás szerint, hőtől és közvetlen napfénytől védve.' }
};

export function generateStaticParams() { return categories.filter(({ id }) => id !== 'all').map(({ id }) => ({ slug: id })); }

export async function generateMetadata({ params }) {
  const slug = (await params).slug;
  const data = copy[slug];
  if (!data) return {};
  return { title: `${data.title} | deli.africa`, description: data.lead, alternates: { canonical: `/categories/${slug}` } };
}

export default async function CategoryPage({ params }) {
  const slug = (await params).slug;
  const category = categories.find((item) => item.id === slug);
  const data = copy[slug];
  if (!category || !data) notFound();
  const items = products.filter((product) => product.category === slug);
  const schemas = [
    { '@context': 'https://schema.org', '@type': 'CollectionPage', name: data.title, description: data.lead, url: `${siteUrl}/categories/${slug}` },
    { '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: items.map((item, index) => ({ '@type': 'ListItem', position: index + 1, url: `${siteUrl}/products/${item.slug}`, name: item.name })) },
    { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Kezdőlap', item: siteUrl }, { '@type': 'ListItem', position: 2, name: category.label, item: `${siteUrl}/categories/${slug}` }] }
  ];

  return <main className={`category-page category-${category.tone}`}>
    {schemas.map((schema, index) => <script key={index} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />)}
    <header className="site-header product-header"><Link href="/" className="brand-link"><BrandLogo /></Link><nav><Link href="/#shop">Shop</Link><Link href="/#story">Történet</Link></nav><Link className="button button-dark" href="/#shop">Összes termék</Link></header>
    <div className="product-breadcrumb"><Link href="/">Kezdőlap</Link><span>/</span><span>{category.label}</span></div>
    <section className="category-hero"><div><span className="eyebrow">VÁLOGATÁS · {items.length} TERMÉK</span><h1>{data.title}</h1><p>{data.lead}</p></div><ProductVisual product={items[0]} large /></section>
    <section className="category-story"><div><span className="eyebrow dark">MIÉRT ÉRDEMES MEGKÓSTOLNI?</span><h2>Ízek, amelyekhez rögtön van ötleted.</h2></div><div><p>{data.context}</p><strong>{data.tip}</strong></div></section>
    <section className="category-products"><span className="eyebrow dark">A KATEGÓRIA TERMÉKEI</span><h2>Válassz kedved szerint.</h2><div>{items.map((item) => <Link href={`/products/${item.slug}`} key={item.id}><ProductVisual product={item}/><small>{item.subtitle}</small><h3>{item.name}</h3><p>{item.details.summary}</p><b>{formatPrice(item.price)}</b><span>Részletek →</span></Link>)}</div></section>
    <footer><BrandLogo inverse /><p>Budapest · Hungary<br />deli.africa v{APP_VERSION}</p><div><Link href="/#shop">Shop</Link></div></footer>
  </main>;
}
