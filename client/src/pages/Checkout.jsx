import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import CheckoutForm from '../components/CheckoutForm'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/useCart'
import { formatPrice } from '../utils/formatPrice'
import { loadRazorpay } from '../utils/loadRazorpay'
import { validateShipping } from '../utils/validateShipping'

const NOT_CLEARED = 'Your cart has not been cleared. Please try again.'

const stepLabels = {
  idle: 'Place Order',
  creating: 'Creating order...',
  paying: 'Waiting for payment...',
  verifying: 'Verifying payment...',
}

export default function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { cartItems, loading, error, totalUnits, subtotal, refreshCart, clearCart } = useCart()

  const [form, setForm] = useState(() => ({
    fullName: user?.name ?? '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  }))
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError] = useState('')
  // idle → creating (server builds the order) → paying (Razorpay window open) → verifying
  const [step, setStep] = useState('idle')
  // Razorpay reports a failed attempt but keeps its window open for a retry, so
  // remember the failure and only show it once the window is closed.
  const lastFailure = useRef(null)

  const busy = step !== 'idle'
  const hasStockProblem = cartItems.some((item) => item.quantity > item.product.stock)

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const verifyPayment = async (shopKartOrderId, response) => {
    setStep('verifying')
    try {
      // The browser only passes Razorpay's response along — the server checks
      // the signature and is the one that marks the order paid.
      const { data } = await axiosInstance.post('/orders/verify-payment', {
        shopKartOrderId,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
      })
      navigate(`/order-success/${data.order._id}`, { replace: true })
      clearCart() // the server already emptied it; this updates the navbar to Cart (0)
    } catch (err) {
      setStep('idle')
      setFormError(
        `${err.response?.data?.message || 'We could not confirm your payment.'} ${NOT_CLEARED}`
      )
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (busy) return
    setFormError('')

    const errors = validateShipping(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) {
      setFormError('Please fix the highlighted fields.')
      return
    }

    setStep('creating')

    // Load Razorpay before asking the server for an order, so a blocked script
    // doesn't leave a pending order behind.
    if (!(await loadRazorpay())) {
      setStep('idle')
      setFormError('Could not load the payment window. Check your connection and try again.')
      return
    }

    let data
    try {
      // Only the address is sent. Items, prices and the total are worked out on
      // the server from the cart in MongoDB.
      ;({ data } = await axiosInstance.post('/orders/create-payment-order', { shippingAddress: form }))
    } catch (err) {
      setStep('idle')
      const body = err.response?.data
      if (body?.errors) setFieldErrors(body.errors)
      // A cart problem (stock dropped, product removed) means our copy of the cart
      // is out of date — reload it so the summary and stock warnings are current.
      else if (err.response?.status === 400) refreshCart()
      setFormError(body?.message || 'Could not place your order. Please try again.')
      return
    }

    lastFailure.current = null
    setStep('paying')

    const razorpay = new window.Razorpay({
      key: data.key,
      amount: data.amount,
      currency: data.currency,
      order_id: data.razorpayOrderId,
      name: 'ShopKart',
      description: 'ShopKart Order',
      prefill: { name: form.fullName, contact: form.phone },
      theme: { color: '#f4a300' },
      handler: (response) => verifyPayment(data.shopKartOrderId, response),
      modal: {
        ondismiss: () => {
          setStep('idle')
          setFormError(
            lastFailure.current
              ? `Payment failed${lastFailure.current.description ? `: ${lastFailure.current.description}` : '.'} ${NOT_CLEARED}`
              : `Payment cancelled. ${NOT_CLEARED}`
          )
        },
      },
    })

    razorpay.on('payment.failed', (response) => {
      lastFailure.current = response.error ?? {}
    })

    razorpay.open()
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search />

      <main className="wrap flex-1 pt-10 pb-18">
        <Link to="/cart" className="text-[13.5px] font-bold text-ink-soft hover:text-ink">
          ← Back to cart
        </Link>
        <h1 className="mt-3 mb-7 text-[30px]">Checkout</h1>

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
            <p className="text-[14.5px] text-ink-soft">Add something to your cart before checking out.</p>
            <Link to="/products" className="btn btn-primary mt-4">
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div className="grid grid-cols-[1fr_380px] items-start gap-10 max-[900px]:grid-cols-1">
            <section className="rounded-xl border-[1.5px] border-line-strong bg-cream p-6">
              <h2 className="mb-5 text-[20px]">Shipping Details</h2>
              <CheckoutForm
                form={form}
                errors={fieldErrors}
                onChange={handleChange}
                onSubmit={handleSubmit}
                disabled={busy}
              />
            </section>

            <aside className="sticky top-25 rounded-xl border-[1.5px] border-line-strong bg-cream p-6 max-[900px]:static">
              <h2 className="text-[20px]">Order Summary</h2>

              <ul className="mt-5 flex flex-col gap-3 border-b border-line pb-4 text-[14.5px]">
                {cartItems.map(({ product, quantity }) => (
                  <li key={product._id} className="flex justify-between gap-4">
                    <span>
                      {product.name} <span className="text-ink-soft">× {quantity}</span>
                    </span>
                    <span className="font-semibold whitespace-nowrap">{formatPrice(product.price * quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3 text-[14.5px]">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Items</span>
                  <span className="font-semibold">{totalUnits}</span>
                </div>
                <div className="flex justify-between border-t border-line pt-3 text-[17px]">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold">{formatPrice(subtotal)}</span>
                </div>
              </div>

              <button
                type="submit"
                form="checkout-form"
                disabled={busy || hasStockProblem}
                className="btn btn-primary btn-block mt-6 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {stepLabels[step]}
              </button>

              <p className="mt-3 text-center text-[12px] text-ink-soft">
                You'll pay with Razorpay (Test Mode — no real money).
              </p>

              {hasStockProblem && (
                <p className="mt-3 text-[12.5px] font-medium text-brick">
                  Some items exceed available stock.{' '}
                  <Link to="/cart" className="underline">
                    Update your cart
                  </Link>{' '}
                  to continue.
                </p>
              )}

              {formError && (
                <p role="alert" className="mt-3 rounded-lg bg-brick/8 px-3 py-2.5 text-[13px] font-medium text-brick">
                  {formError}
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
