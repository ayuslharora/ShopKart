import './ProductCard.css'

export default function ProductCard({ name, category, price, oldPrice, tone = 'marigold', discount }) {
  return (
    <article className="product-card">
      <div className={`product-swatch tone-${tone}`}>
        {discount && <span className="product-stamp">-{discount}%</span>}
      </div>
      <div className="product-body">
        <span className="product-category">{category}</span>
        <h4 className="product-name">{name}</h4>
        <div className="product-price-row">
          <span className="product-price">₹{price}</span>
          {oldPrice && <span className="product-price-old">₹{oldPrice}</span>}
        </div>
      </div>
    </article>
  )
}
