import Image from 'next/image';

export default function BrandLogo({ inverse = false, alt = '' }) {
  return <Image className="brand-logo" src={inverse ? '/brand/logo-dark.png' : '/brand/logo-brand.png'} alt={alt} width={1200} height={1200} priority={!inverse} />;
}
