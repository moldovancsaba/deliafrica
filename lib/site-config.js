import { DEFAULT_HERO_MODE } from '@/lib/hero-config';

export const DEFAULT_UI_COPY = {
  nav: { shop: 'Shop', story: 'Történet', why: 'Miért mi?', dashboard: 'Dashboard', login: 'Belépés', logout: 'Kijelentkezés', cart: 'Kosár' },
  hero: {
    eyebrow: 'DÉL-AFRIKAI KEDVENCEK. NEKED VÁLOGATVA.',
    title: 'TASTE\nSOUTH\nAFRICA.',
    body: 'Dél-Afrika karakteres ízei hozzád közelebb. Válogatott braai szószok, chutney-k, rooibos teák, fűszerek és kultikus snackek.',
    button: 'Fedezd fel'
  },
  story: {
    label: 'A DELI.AFRICA TÖRTÉNETE',
    title: 'Dél-afrikai ízek, érthetően és könnyen kipróbálhatóan.',
    body: 'A deli.africa azért született, hogy a dél-afrikai kamra karakteres kedvencei ne csak különlegességek legyenek, hanem a hétköznapi étkezések részei is. A válogatásban a füstös braai, a citrusos peri-peri, a rooibos és az otthonos snackek világa találkozik.\n\nNem feltételezzük, hogy már ismered őket: minden terméknél megmutatjuk az ízprofilt, a legjobb párosításokat és egy egyszerű első kóstolási ötletet. Így magabiztosan választhatsz magadnak vagy ajándékba.',
    link: 'Megnézem a válogatást →'
  },
  why: {
    label: 'MIÉRT DELI.AFRICA?',
    title: 'Kevesebb találgatás.\nTöbb jó falat.',
    body: 'Olyan válogatást építünk, amelyben gyorsan megtalálod az alkalomhoz és az ízlésedhez illő terméket.',
    cards: [
      { number: '01', title: 'Átlátható választás', body: 'Szűk, gondosan bemutatott kínálat: nem kell több száz hasonló terméket végignézned.' },
      { number: '02', title: 'Íz alapján dönthetsz', body: 'Minden oldalon konkrét ízjegyeket, felhasználási módokat és párosításokat találsz.' },
      { number: '03', title: 'Konyhakész ötletek', body: 'Megmutatjuk, mit tegyél a grillre, a reggeli mellé, a teáscsészébe vagy az ajándékcsomagba.' },
      { number: '04', title: 'Őszinte termékinformáció', body: 'Ahol egy adat vagy ár még nem végleges, azt egyértelműen jelezzük; a csomagolás marad az irányadó.' }
    ]
  },
  shop: { eyebrow: 'SHOP THE COLLECTION', title: 'Mit kóstolnál meg?', allProducts: 'Minden termék', categoryIntro: 'Kategória bemutatása →', addToCart: 'Kosárba', unavailable: '–' },
  editorial: [
    { label: 'BRAAI NIGHT?', title: 'Fire up the flavour.' },
    { label: 'PERI-PERI', title: 'Makes it better.' },
    { label: 'SWEET + SPICY', title: 'Perfect contrast.' },
    { label: 'ROOIBOS', title: 'Tea. Slow down.' }
  ],
  modal: { addToCart: 'Kosárba', knowMore: 'Többet akarok tudni', close: 'Bezárás' },
  cart: { title: 'Kosár', empty: 'A kosarad még üres.', continueShopping: 'Válogatok tovább', total: 'Összesen', checkout: 'Tovább a rendeléshez', loginCheckout: 'Belépés és rendelés', disabled: 'Rendelés átmenetileg szünetel' },
  checkout: { title: 'Rendelés', name: 'Név', email: 'E-mail', phone: 'Telefon', address: 'Szállítási cím', submit: 'Rendelés leadása', success: 'Rendelés mentve.' },
  footer: { contactTitle: 'Kapcsolat', legalTitle: 'Jogi információk', socialTitle: 'Kövess minket', shop: 'Shop', rights: 'Minden jog fenntartva.' },
  productPage: { back: 'Vissza a shophoz', whatIsIt: 'Mi ez?', flavour: 'Ízprofil', whoFor: 'Kinek ajánljuk?', packaging: 'Csomagolás', servingIdeas: 'Tálalási ötletek', pairings: 'Párosítások', storage: 'Tárolás és termékinformáció', faq: 'Gyakori kérdések', related: 'Kapcsolódó termékek', buy: 'Kosárba' },
  systemMessages: { unavailable: 'A termék jelenleg nem rendelhető.', cartEmpty: 'A kosár üres.', loginRequired: 'A rendeléshez bejelentkezés szükséges.' }
};

export const DEFAULT_LEGAL_SETTINGS = {
  company: {
    companyName: 'deli.africa',
    contactName: 'Deli Africa',
    address: 'Deli street 123, Town, Africa AF123',
    phone: '+3670-765-4321',
    email: 'shop@deli.africa',
    instagram: '@deli.africa',
    instagramUrl: 'https://instagram.com/deli.africa',
    x: '@deli.africa',
    xUrl: 'https://x.com/deli.africa',
    facebook: '@deli.africa',
    facebookUrl: 'https://facebook.com/deli.africa'
  },
  cookieBanner: {
    title: 'Sütik és adatvédelem',
    body: 'A webshop működéséhez szükséges technikai tárolást használunk. Az opcionális analitikai mérést csak a hozzájárulásod után kapcsoljuk be.',
    accept: 'Elfogadom',
    reject: 'Csak szükséges',
    policyLink: 'Süti tájékoztató'
  },
  documents: {
    gtc: {
      title: 'Általános Szerződési Feltételek (GTC / ÁSZF)',
      summary: 'A deli.africa webshop használatának, rendelésének, fizetésének, teljesítésének és elállásának alapvető feltételei.',
      body: `1. Szolgáltató\nA webshop üzemeltetője: deli.africa. Kapcsolattartó: Deli Africa. Cím: Deli street 123, Town, Africa AF123. Telefon: +3670-765-4321. E-mail: shop@deli.africa.\n\n2. A szolgáltatás tárgya\nA deli.africa dél-afrikai élelmiszerek és kapcsolódó termékek online bemutatását és értékesítését végzi. A termékoldalon szereplő aktuális ár, elérhetőség, kiszerelés és termékinformáció képezi az ajánlat részét.\n\n3. Rendelés és szerződéskötés\nA vásárló a kosár és a checkout folyamat véglegesítésével rendelést küld. A rendelés beérkezéséről elektronikus visszaigazolás készül. A szerződés a rendelés kereskedő általi visszaigazolásával jön létre.\n\n4. Árak és fizetés\nA webshopban feltüntetett árak forintban értendők, eltérő jelölés hiányában a vonatkozó adókat tartalmazzák. A tervezett online fizetési szolgáltató Barion. Sikertelen vagy megszakított fizetés esetén a rendelés nem tekinthető kifizetettnek.\n\n5. Szállítás és átvétel\nA tervezett csomagkézbesítési szolgáltató Packeta. Az elérhető átvételi mód, díj és becsült teljesítési idő a checkout során jelenik meg. A vásárló köteles pontos kézbesítési és kapcsolattartási adatokat megadni.\n\n6. Számlázás\nA tervezett elektronikus számlázási szolgáltató Billingo. A számla a vásárló által megadott számlázási adatok alapján készül.\n\n7. Elállás, visszatérítés, élelmiszer-kivételek\nA fogyasztót megillető elállási jogot a mindenkor alkalmazandó fogyasztóvédelmi szabályok szerint biztosítjuk. Romlandó, gyorsan minőségét vesztő, illetve felbontott, egészségvédelmi vagy higiéniai okból vissza nem küldhető termékek esetén jogszabály szerinti kivétel alkalmazható. Visszaküldés előtt kérjük, írj a shop@deli.africa címre.\n\n8. Panaszkezelés\nPanasz e-mailben a shop@deli.africa címen, telefonon a +3670-765-4321 számon vagy postai úton a megadott címen nyújtható be. A panaszokat a vonatkozó jogszabályi határidők szerint kezeljük.\n\n9. Felelősség és termékinformáció\nAllergének, összetevők, tárolási előírások és fogyaszthatósági információk tekintetében mindig a tényleges termékcsomagolás az irányadó. Kérjük, allergia vagy érzékenység esetén vásárlás és fogyasztás előtt ellenőrizd a címkét.\n\n10. Adatkezelés\nA személyes adatok kezelésének részleteit az Adatkezelési / GDPR tájékoztató tartalmazza.\n\n11. Módosítás\nA jelen feltételek módosíthatók. A rendelésre a rendelés leadásakor közzétett változat alkalmazandó.`
    },
    terms: {
      title: 'Vásárlási feltételek (T&C)',
      summary: 'Rövid, közérthető összefoglaló a webshopos vásárlás legfontosabb feltételeiről.',
      body: `A deli.africa webshopban leadott rendelés előtt ellenőrizd a kosár tartalmát, a mennyiségeket, az árat, a szállítási és számlázási adatokat. A fizetési, számlázási és szállítási státuszokat a rendszer külön kezeli.\n\nA rendelés csak sikeres fizetés esetén minősül kifizetettnek. A csomag akkor adható át szállításra, amikor a rendelés összekészítési státusza „ready to deliver”.\n\nÉlelmiszer esetén a termék címkéjén szereplő összetevő-, allergén-, tárolási és lejárati információ elsőbbséget élvez a weboldal szövegével szemben.\n\nPanasz, módosítás vagy rendelési kérdés esetén: shop@deli.africa · +3670-765-4321.`
    },
    cookies: {
      title: 'Süti és helyi tárolási tájékoztató',
      summary: 'Milyen technikai és opcionális mérési adatokat használ a deli.africa webshop.',
      body: `A deli.africa a webshop alapvető működéséhez szükséges technikai tárolást használhat, például a kosár, bejelentkezási munkamenet és sütiválasztás megőrzésére.\n\nAz opcionális analitikai mérés kizárólag a felhasználó hozzájárulása után aktiválódik. A hozzájárulás elutasítása nem akadályozza a webshop alapvető használatát.\n\nA választás a böngésző helyi tárhelyén kerül megőrzésre. A böngésző adatainak törlésével a döntés törölhető, és a hozzájárulási kérdés ismét megjelenhet.\n\nAdatvédelmi kérdés: shop@deli.africa.`
    },
    consumer: {
      title: 'Fogyasztóvédelmi nyilatkozat',
      summary: 'Panaszkezelés, fogyasztói jogok és jogérvényesítési lehetőségek alapelvei.',
      body: `A deli.africa célja, hogy a fogyasztói panaszokat gyorsan, dokumentáltan és a vonatkozó fogyasztóvédelmi előírásoknak megfelelően kezelje.\n\nPanasz benyújtása: shop@deli.africa, +3670-765-4321, illetve Deli street 123, Town, Africa AF123. Kérjük, add meg a rendelési azonosítót, a probléma leírását és az általad kért megoldást.\n\nAmennyiben a panasz közvetlenül nem rendezhető, a fogyasztó jogosult az alkalmazandó jog szerint illetékes fogyasztóvédelmi hatósághoz, békéltető vagy alternatív vitarendezési fórumhoz fordulni. A konkrét fórum meghatározása a fogyasztó lakóhelyétől, a szolgáltató jogi státuszától és az alkalmazandó joghatóságtól függhet.\n\nA termékbiztonsági, allergén- és címkézési információk tekintetében a tényleges termékcsomagolás és a kötelező gyártói jelölés az irányadó.`
    },
    privacy: {
      title: 'Adatkezelési és GDPR tájékoztató',
      summary: 'A deli.africa által kezelt személyes adatok, célok, jogalapok, megőrzés és érintetti jogok összefoglalója.',
      body: `1. Adatkezelő\ndeli.africa · Deli Africa · Deli street 123, Town, Africa AF123 · shop@deli.africa · +3670-765-4321.\n\n2. Kezelt adatok\nA webshop a rendelés teljesítéséhez szükséges adatokat kezelheti: név, e-mail, telefonszám, szállítási és számlázási adatok, rendelési tételek, fizetési státusz, számlázási státusz, kézbesítési és tracking adatok, valamint ügyfélszolgálati kommunikáció.\n\n3. Adatkezelési célok\nRendelés feldolgozása, fizetés lebonyolítása, számlázás, csomagkézbesítés, ügyfélszolgálat, jogi és számviteli kötelezettségek teljesítése, biztonsági és működési naplózás.\n\n4. Adatfeldolgozók / szolgáltatók\nA webshop a konfigurációtól függően Packeta, Barion, Billingo, Vercel és MongoDB-alapú infrastruktúrát használhat. Csak az adott szolgáltatás teljesítéséhez szükséges adatok kerülhetnek továbbításra.\n\n5. Jogalap\nA szerződés teljesítéséhez szükséges adatkezelés, jogi kötelezettség teljesítése, jogos érdek, illetve ahol szükséges, az érintett hozzájárulása.\n\n6. Megőrzés\nAz adatokat csak a szükséges ideig, illetve a kötelező számviteli, adózási, fogyasztóvédelmi vagy egyéb jogi megőrzési idő alatt tároljuk.\n\n7. Érintetti jogok\nAz érintett kérhet hozzáférést, helyesbítést, törlést, korlátozást, adathordozhatóságot, tiltakozhat a jogos érdeken alapuló kezelés ellen, és hozzájárulás esetén azt visszavonhatja. Kérés: shop@deli.africa.\n\n8. Panasz\nAdatvédelmi panasz esetén az érintett jogosult az alkalmazandó jog szerint illetékes adatvédelmi felügyeleti hatósághoz fordulni.\n\n9. Biztonság\nAz adminisztráció hozzáférés-védelemmel működik; a külső szolgáltatói kulcsok titkosítva kerülnek tárolásra, és nem jelennek meg visszaolvasható formában az admin felületen.`
    }
  }
};

export const DEFAULT_STOREFRONT_CONTENT = {
  heroEyebrow: DEFAULT_UI_COPY.hero.eyebrow,
  heroTitle: DEFAULT_UI_COPY.hero.title,
  heroBody: DEFAULT_UI_COPY.hero.body,
  heroButton: DEFAULT_UI_COPY.hero.button,
  storyLabel: DEFAULT_UI_COPY.story.label,
  storyTitle: DEFAULT_UI_COPY.story.title,
  storyBody: DEFAULT_UI_COPY.story.body,
  whyLabel: DEFAULT_UI_COPY.why.label,
  whyTitle: DEFAULT_UI_COPY.why.title,
  whyBody: DEFAULT_UI_COPY.why.body
};

export const DEFAULT_SALES_SETTINGS = {
  checkoutEnabled: true,
  fulfillmentProvider: 'packeta',
  paymentProvider: 'barion',
  invoicingProvider: 'billingo',
  senderName: 'deli.africa',
  supportEmail: 'shop@deli.africa',
  termsUrl: '/legal/gtc',
  privacyUrl: '/legal/privacy'
};

export const DEFAULT_SITE_SETTINGS = {
  heroMode: DEFAULT_HERO_MODE,
  categorySelectorMode: 'fixed',
  storefrontContent: DEFAULT_STOREFRONT_CONTENT,
  uiCopy: DEFAULT_UI_COPY,
  legal: DEFAULT_LEGAL_SETTINGS,
  sales: DEFAULT_SALES_SETTINGS
};
