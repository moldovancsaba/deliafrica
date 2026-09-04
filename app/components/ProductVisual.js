export default function ProductVisual({ product, large = false }) {
  return <div className={`product-visual ${product.tone} ${large ? 'large' : ''}`} role="img" aria-label={`${product.name} stilizált termékillusztráció`}>
    <span className={`pack ${product.visual}`}><i>{product.name.split(' ')[0]}</i><b>deli.</b><small>south africa</small></span>
  </div>;
}
