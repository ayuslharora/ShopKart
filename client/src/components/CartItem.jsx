import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCart } from '../context/useCart'
import { formatPrice } from '../utils/formatPrice'

export default function CartItem({ item }) {
  const { product, quantity } = item
  const { updateQuantity, removeFromCart, isPending } = useCart()
  const [error, setError] = useState('')

  const busy = isPending(product._id)
  // Stock can drop after something was added, so the cart may hold more than is available.
  const overStock = quantity > product.stock

  const run = async (action) => {
    setError('')
    try {
      await action()
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    }
  }

  // If the item is over stock, "−" jumps straight down to what's available.
  const decrease = () => run(() => updateQuantity(product._id, Math.min(quantity - 1, product.stock)))
  const increase = () => run(() => updateQuantity(product._id, quantity + 1))
  const remove = () => run(() => removeFromCart(product._id))

  const stepButton =
    'inline-flex h-8.5 w-8.5 items-center justify-center text-[17px] font-bold text-ink hover:bg-paper-2 disabled:cursor-not-allowed disabled:opacity-35'

  return (
    <div className={`flex gap-5 border-b border-line py-6 max-[560px]:flex-col ${busy ? 'opacity-70' : ''}`}>
      <Link
        to={`/products/${product._id}`}
        className="h-28 w-28 shrink-0 rounded-lg bg-paper-2 bg-cover bg-center max-[560px]:h-40 max-[560px]:w-full"
        style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}
        aria-label={product.name}
      />

      <div className="flex flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Link to={`/products/${product._id}`} className="text-[17px] font-bold leading-tight hover:underline">
              {product.name}
            </Link>
            <p className="mt-1 text-[14px] text-ink-soft">{formatPrice(product.price)} each</p>
            {product.stock === 0 ? (
              <p className="mt-1 text-[12.5px] font-semibold text-brick">Out of stock — remove it to check out</p>
            ) : overStock ? (
              <p className="mt-1 text-[12.5px] font-semibold text-brick">
                Only {product.stock} left — reduce the quantity to check out
              </p>
            ) : (
              <p className="mt-1 text-[12.5px] font-semibold text-leaf">{product.stock} in stock</p>
            )}
          </div>
          <span className="text-[17px] font-extrabold whitespace-nowrap">{formatPrice(product.price * quantity)}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="inline-flex items-center overflow-hidden rounded-lg border-[1.5px] border-line-strong bg-cream">
            <button
              type="button"
              onClick={decrease}
              disabled={busy || quantity <= 1 || product.stock === 0}
              aria-label={`Decrease quantity of ${product.name}`}
              className={stepButton}
            >
              −
            </button>
            <span className="min-w-9 text-center text-[15px] font-bold" aria-live="polite">
              {quantity}
            </span>
            <button
              type="button"
              onClick={increase}
              disabled={busy || quantity >= product.stock}
              aria-label={`Increase quantity of ${product.name}`}
              className={stepButton}
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={remove}
            disabled={busy}
            className="text-[13.5px] font-bold text-brick hover:underline disabled:opacity-60"
          >
            Remove
          </button>

          {busy && <span className="text-[12.5px] text-ink-soft">Updating...</span>}
        </div>

        {error && <p className="text-[12.5px] font-medium text-brick">{error}</p>}
      </div>
    </div>
  )
}
