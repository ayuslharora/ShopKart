import { Link } from 'react-router-dom'

export default function WishlistCard({ product, removing, error, onRemove }) {
  const { _id, name, category, price, imageUrl, stock } = product

  return (
    <div className="flex flex-col overflow-hidden border-[1.5px] border-line bg-cream">
      <Link to={`/products/${_id}`} className="block">
        <div
          className="aspect-4/3 bg-paper-2 bg-cover bg-center"
          style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
        />
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-bold text-ink-soft">{category}</span>
        <h4 className="my-1 text-[17px] leading-tight">{name}</h4>
        <span className="text-[16.5px] font-extrabold">₹{price}</span>
        <p className={`mt-1 text-[12.5px] font-semibold ${stock > 0 ? 'text-leaf' : 'text-brick'}`}>
          {stock > 0 ? `${stock} units left` : 'Out of stock'}
        </p>

        <div className="mt-auto flex flex-col gap-2 pt-4">
          <Link
            to={`/products/${_id}`}
            className="rounded-lg bg-ink px-3 py-2 text-center text-[13.5px] font-bold text-paper hover:bg-ink-soft"
          >
            View Details
          </Link>
          <button
            type="button"
            onClick={() => onRemove(_id)}
            disabled={removing}
            className="rounded-lg border-[1.5px] border-brick bg-transparent px-3 py-2 text-[13.5px] font-bold text-brick hover:bg-brick/8 disabled:opacity-60"
          >
            {removing ? 'Removing...' : 'Remove from Wishlist ♥'}
          </button>
          {error && <p className="text-[12.5px] font-medium text-brick">{error}</p>}
        </div>
      </div>
    </div>
  )
}
