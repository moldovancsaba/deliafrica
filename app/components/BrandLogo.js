import Image from 'next/image';

export default function BrandLogo({ inverse = false }) {
  return <Image className="brand-logo" src={inverse ? '/brand/logo-light.svg' : '/brand/logo-dark.svg'} alt="deli.africa — curated delights from South Africa" width={1000} height={1000} priority={!inverse} />;
}
