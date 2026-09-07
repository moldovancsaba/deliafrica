import Image from 'next/image';

export default function BrandLogo({ inverse = false }) {
  return <Image className="brand-logo" src={inverse ? '/brand/logo-dark.png' : '/brand/logo-brand.png'} alt="deli.africa — curated delights from South Africa" width={1200} height={1200} priority={!inverse} />;
}
