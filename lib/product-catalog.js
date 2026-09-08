import 'server-only';
import { unstable_noStore as noStore } from 'next/cache';
import { getCatalog } from '@/lib/catalog-store';

function normalize(product) {
  const faq = Array.isArray(product.faq)
    ? product.faq.map((item) => Array.isArray(item) ? item : [item.question || '', item.answer || '']).filter(([q,a]) => q && a)
    : [];
  return {
    ...product,
    details: {
      summary: product.story || '',
      what: product.whatItIs || '',
      background: product.background || '',
      flavour: product.flavour || '',
      uses: product.pairings || [],
      serving: product.servingIdeas || [],
      suits: product.audience || '',
      storage: product.storage || '',
      info: product.info || product.packaging || '',
      faq
    },
    editorialCaption: product.editorialCaption || ''
  };
}

export async function getProductsWithSettings() {
  noStore();
  return (await getCatalog()).map(normalize);
}
