export const HERO_MODES = ['fixed', 'interactive'];
export const DEFAULT_HERO_MODE = 'fixed';

export const fixedHeroByCategory = {
  braai: '/heroes/fixed/braai-peri-hot.jpg',
  spices: '/heroes/fixed/spices-rajah.jpg',
  pate: '/heroes/fixed/pate-zebra.jpg',
  tea: '/heroes/fixed/tea-rooibos.jpg',
  snacks: '/heroes/fixed/snacks-peanut.jpg',
  pantry: '/heroes/fixed/pantry-evoo.jpg'
};

export const fixedHeroByProduct = {
  'peri-hot': '/heroes/fixed/braai-peri-hot.jpg',
  'rajah-curry': '/heroes/fixed/spices-rajah.jpg',
  'zebra-pate': '/heroes/fixed/pate-zebra.jpg',
  rooibos: '/heroes/fixed/tea-rooibos.jpg',
  milo: '/heroes/fixed/snacks-milo.jpg',
  peanut: '/heroes/fixed/snacks-peanut.jpg',
  evoo: '/heroes/fixed/pantry-evoo.jpg'
};

export const homepageFixedHero = fixedHeroByCategory.braai;

export const homepageFixedHeroes = [
  fixedHeroByCategory.braai,
  fixedHeroByCategory.spices,
  fixedHeroByCategory.pate,
  fixedHeroByCategory.tea,
  fixedHeroByCategory.snacks,
  fixedHeroByCategory.pantry
];

export function getFixedHeroForProduct(product) {
  return fixedHeroByProduct[product.id] || fixedHeroByCategory[product.category] || homepageFixedHero;
}
