import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CartItem from '../components/CartItem'
import { useCart } from '../context/useCart'
import { formatPrice } from '../utils/formatPrice'

export default function Cart() {
  const { cartItems, loading, error, totalUnits, subtotal, refreshCart } = useCart()
  const navigate = useNavigate()

  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock)

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search />

      <main className="wrap flex-1 pt-10 pb-18">
        <h1 className="mb-7 text-[30px]">My Cart</h1>

        {loading && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line-strong border-t-ink" />
            <p className="text-[14.5px] text-ink-soft">Loading your cart...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="text-[17px] font-bold">Unable to load your cart.</p>
            <button type="button" onClick={refreshCart} className="btn btn-outline mt-4">
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span className="text-[40px]" aria-hidden="true">🛒</span>
            <p className="text-[19px] font-bold">Your cart is empty</p>
            <p className="text-[14.5px] text-ink-soft">Looks like you haven't added anything yet.</p>
            <Link to="/products" className="btn btn-primary mt-4">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-[1fr_340px] items-start gap-10 max-[900px]:grid-cols-1">
            <section className="border-t border-line">
              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </section>

            <aside className="sticky top-25 rounded-xl border-[1.5px] border-line-strong bg-cream p-6 max-[900px]:static">
              <h2 className="text-[20px]">Order Summary</h2>

              <div className="mt-5 flex flex-col gap-3 text-[14.5px]">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Items</span>
                  <span className="font-semibold">{totalUnits}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-[17px]">
                  <span className="font-bold">Subtotal</span>
                  <span className="font-extrabold">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/checkout')}
                disabled={hasStockProblem}
                className="btn btn-primary btn-block mt-6 disabled:cursor-not-allowed disabled:opacity-55"
              >
                Proceed to Checkout
              </button>

              {hasStockProblem && (
                <p className="mt-3 text-[12.5px] font-medium text-brick">
                  Some items exceed available stock. Adjust them to continue.
                </p>
              )}
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
