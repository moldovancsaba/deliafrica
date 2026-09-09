import { MediaWithFallback } from '@/app/components/gds';
export default function ProductVisual({
  product,
  hero = false
}) {
  return <MediaWithFallback src={hero ? product.heroImage || product.image : product.image} alt={[product.name, product.subtitle].filter(Boolean).join(' · ')} ratio={1} fallbackLabel={product.name} showShimmer={false} />;
}
