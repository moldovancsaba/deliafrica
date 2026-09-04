export const categories = [
  { id: 'all', label: 'Minden' },
  { id: 'braai', label: 'Braai & szószok' },
  { id: 'spices', label: 'Fűszerek' },
  { id: 'chutney', label: 'Chutney & relish' },
  { id: 'tea', label: 'Tea & rusks' },
  { id: 'snacks', label: 'Snack & édesség' },
  { id: 'pantry', label: 'Kamra alapok' }
];

export const products = [
  {
    id: 'peri-peri-hot',
    name: "Nando's Peri-Peri Hot",
    subtitle: 'Csípős szósz · 250 g',
    price: 3490,
    category: 'braai',
    badge: 'BRAAI PICK',
    visual: 'bottle',
    tone: 'red',
    story: 'Tüzes, citrusos peri-peri karakter grillezett húsokhoz, zöldségekhez és marinádokhoz.'
  },
  {
    id: 'mrs-balls-original',
    name: "Mrs Ball's Original Chutney",
    subtitle: 'Gyümölcsös chutney',
    price: 4290,
    category: 'chutney',
    badge: 'CAPE CLASSIC',
    visual: 'jar',
    tone: 'fig',
    story: 'Édeskés-savanykás dél-afrikai klasszikus, curryhez, sajtokhoz és szendvicsekhez.'
  },
  {
    id: 'rooibos-original',
    name: 'Carmién Rooibos Original',
    subtitle: 'Koffeinmentes tea',
    price: 2890,
    category: 'tea',
    badge: 'CEDERBERG',
    visual: 'box',
    tone: 'rooibos',
    story: 'Természetesen koffeinmentes rooibos, lágy, mézes-fás karakterrel.'
  },
  {
    id: 'braai-rub',
    name: 'Cape Braai Rub',
    subtitle: 'Fűszerkeverék · 120 g',
    price: 2590,
    category: 'spices',
    badge: 'BRAAI APPROVED',
    visual: 'tin',
    tone: 'olive',
    story: 'Füstös, korianderes és paprikás fűszerkeverék húsokhoz, gombához és grillzöldségekhez.'
  },
  {
    id: 'chakalaka-relish',
    name: 'Chakalaka Relish',
    subtitle: 'Fűszeres zöldség relish',
    price: 3290,
    category: 'chutney',
    badge: 'SPICY',
    visual: 'jar',
    tone: 'orange',
    story: 'Paprikás-paradicsomos, fűszeres relish braai mellé, rizshez vagy friss kenyérhez.'
  },
  {
    id: 'rooibos-rusks',
    name: 'Rooibos Buttermilk Rusks',
    subtitle: 'Ropogós sütemény · 300 g',
    price: 3790,
    category: 'tea',
    badge: 'TEA TIME',
    visual: 'bag',
    tone: 'sand',
    story: 'Dél-afrikai rusk rooibos mellé: ropogós, vajas, mártogatásra készült.'
  },
  {
    id: 'peppermint-crisp',
    name: 'Peppermint Crisp Treat',
    subtitle: 'Mentás csokoládés snack',
    price: 1790,
    category: 'snacks',
    badge: 'SWEET PICK',
    visual: 'bar',
    tone: 'guava',
    story: 'Mentás-csokoládés dél-afrikai kedvenc, gyors desszerthez vagy ajándékcsomagba.'
  },
  {
    id: 'maize-meal',
    name: 'South African Maize Meal',
    subtitle: 'Kukoricadara · 1 kg',
    price: 2190,
    category: 'pantry',
    badge: 'PANTRY',
    visual: 'bag',
    tone: 'mango',
    story: 'Pap és más klasszikus köretek alapja, semleges ízzel és sokoldalú felhasználással.'
  }
];

export function formatPrice(value) {
  return new Intl.NumberFormat('hu-HU').format(value) + ' Ft';
}
