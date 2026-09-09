import { GdsBox, MediaWithFallback } from '@/app/components/gds';
export default function BrandLogo({
  alt = 'deli.africa'
}) {
  return <GdsBox maxWidth="xs"><MediaWithFallback src="/brand/logo-brand.png" alt={alt} ratio={1} fallbackLabel="deli.africa" showShimmer={false} /></GdsBox>;
}
