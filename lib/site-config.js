import { DEFAULT_HERO_MODE } from '@/lib/hero-config';

export const DEFAULT_STOREFRONT_CONTENT = {
  heroEyebrow: 'DÉL-AFRIKAI KEDVENCEK. NEKED VÁLOGATVA.', heroTitle: 'TASTE\nSOUTH\nAFRICA.',
  heroBody: 'Dél-Afrika karakteres ízei hozzád közelebb. Válogatott braai szószok, chutney-k, rooibos teák, fűszerek és kultikus snackek.', heroButton: 'Fedezd fel',
  storyLabel: 'A DELI.AFRICA TÖRTÉNETE', storyTitle: 'Dél-afrikai ízek, érthetően és könnyen kipróbálhatóan.',
  storyBody: 'A deli.africa azért született, hogy a dél-afrikai kamra karakteres kedvencei ne csak különlegességek legyenek, hanem a hétköznapi étkezések részei is. A válogatásban a füstös braai, a citrusos peri-peri, a rooibos és az otthonos snackek világa találkozik.\n\nNem feltételezzük, hogy már ismered őket: minden terméknél megmutatjuk az ízprofilt, a legjobb párosításokat és egy egyszerű első kóstolási ötletet. Így magabiztosan választhatsz magadnak vagy ajándékba.',
  whyLabel: 'MIÉRT DELI.AFRICA?', whyTitle: 'Kevesebb találgatás.\nTöbb jó falat.',
  whyBody: 'Olyan válogatást építünk, amelyben gyorsan megtalálod az alkalomhoz és az ízlésedhez illő terméket.'
};

export const DEFAULT_SALES_SETTINGS = {
  checkoutEnabled: true, fulfillmentProvider: 'packeta', paymentProvider: 'barion', invoicingProvider: 'billingo',
  senderName: 'deli.africa', supportEmail: '', termsUrl: '', privacyUrl: ''
};

export const DEFAULT_SITE_SETTINGS = { heroMode: DEFAULT_HERO_MODE, categorySelectorMode: 'fixed', storefrontContent: DEFAULT_STOREFRONT_CONTENT, sales: DEFAULT_SALES_SETTINGS };
