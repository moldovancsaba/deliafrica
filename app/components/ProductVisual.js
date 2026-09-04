import Image from 'next/image';

export default function ProductVisual({ product, large = false, className = '' }) {
  return <div className={`product-visual product-${product.id} ${product.tone} ${large ? 'large' : ''} ${className}`}>
    {product.image ? <Image className="product-photo" src={product.image} alt={`${product.name} termékcsomagolás`} fill sizes={large ? '(max-width: 650px) 30vw, 180px' : '(max-width: 650px) 80vw, 25vw'} /> : <span className={`pack ${product.visual}`}><i>{product.name.split(' ')[0]}</i><b>deli.</b><small>south africa</small></span>}
  </div>;
}
