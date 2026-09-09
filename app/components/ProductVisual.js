import Image from 'next/image';

export default function ProductVisual({ product, large = false, className = '', hero = false }) {
  const physicalStyle = product.packageDimensionsMm ? { '--package-width': product.packageDimensionsMm.width, '--package-height': product.packageDimensionsMm.height } : undefined;
  const image = hero ? product.heroImage || product.image : product.image;
  const alt = [product.name, product.subtitle].filter(Boolean).join(' · ');
  return <div style={physicalStyle} className={`product-visual product-${product.id} ${product.tone} ${large ? 'large' : ''} ${className}`}>
    {image ? <Image className={`product-photo ${hero ? 'product-photo-cutout' : 'product-photo-shop'}`} src={image} alt={alt} fill sizes={large ? '(max-width: 650px) 100vw, 50vw' : '(max-width: 650px) 100vw, 25vw'} /> : <span className={`pack ${product.visual}`}><i>{product.name.split(' ')[0]}</i><b>{product.brand || product.name}</b><small>{product.originCountry || product.categoryName}</small></span>}
  </div>;
}
