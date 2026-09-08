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
  footer: { location: 'Budapest · Hungary', shop: 'Shop' },
  productPage: { back: 'Vissza a shophoz', whatIsIt: 'Mi ez?', flavour: 'Ízprofil', whoFor: 'Kinek ajánljuk?', packaging: 'Csomagolás', servingIdeas: 'Tálalási ötletek', pairings: 'Párosítások', storage: 'Tárolás és termékinformáció', faq: 'Gyakori kérdések', related: 'Kapcsolódó termékek', buy: 'Kosárba' },
  systemMessages: { unavailable: 'A termék jelenleg nem rendelhető.', cartEmpty: 'A kosár üres.', loginRequired: 'A rendeléshez bejelentkezés szükséges.' }
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
  supportEmail: '',
  termsUrl: '',
  privacyUrl: ''
};

export const DEFAULT_SITE_SETTINGS = {
  heroMode: DEFAULT_HERO_MODE,
  categorySelectorMode: 'fixed',
  storefrontContent: DEFAULT_STOREFRONT_CONTENT,
  uiCopy: DEFAULT_UI_COPY,
  sales: DEFAULT_SALES_SETTINGS
};
