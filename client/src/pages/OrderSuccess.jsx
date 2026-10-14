import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { axiosInstance } from '../axiosCalls/axios'
import { formatPrice } from '../utils/formatPrice'

// Reads the order back from the server rather than trusting navigation state, so
// it still works after a refresh and only celebrates orders that were really paid.
export default function OrderSuccess() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'

  useEffect(() => {
    let mounted = true

    axiosInstance
      .get(`/orders/${id}`)
      .then(({ data }) => {
        if (!mounted) return
        setOrder(data.order)
        setStatus('ready')
      })
      .catch(() => mounted && setStatus('error'))

    return () => {
      mounted = false
    }
  }, [id])

  const paid = order?.paymentStatus === 'PAID'

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search />

      <main className="wrap flex flex-1 items-center justify-center py-16">
        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line-strong border-t-ink" />
            <p className="text-[14.5px] text-ink-soft">Loading your order...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[17px] font-bold">We couldn't find this order.</p>
            <Link to="/orders" className="btn btn-outline mt-4">
              View My Orders
            </Link>
          </div>
        )}

        {status === 'ready' && !paid && (
          <div className="flex flex-col items-center gap-2 text-center">
            <p className="text-[17px] font-bold">This order hasn't been paid for.</p>
            <p className="text-[14.5px] text-ink-soft">Your cart has not been cleared — you can check out again.</p>
            <Link to="/cart" className="btn btn-primary mt-4">
              Go to Cart
            </Link>
          </div>
        )}

        {status === 'ready' && paid && (
          <div className="w-full max-w-[480px] rounded-xl border-[1.5px] border-line-strong bg-cream p-8 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-leaf">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="m5 12.5 4.5 4.5L19 7.5" stroke="#fffdf7" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="mt-5 text-[26px]">Order Placed Successfully</h1>
            <p className="mt-2 text-[14.5px] text-ink-soft">Your order has been saved successfully.</p>

            <dl className="mt-7 flex flex-col gap-3 border-t border-line pt-5 text-left text-[14.5px]">
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Order ID</dt>
                <dd className="font-mono text-[13px] break-all">{order._id}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Total</dt>
                <dd className="font-extrabold">{formatPrice(order.totalAmount)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-ink-soft">Status</dt>
                <dd className="font-bold text-leaf">{order.status}</dd>
              </div>
            </dl>

            <div className="mt-8 flex flex-col gap-3">
              <Link to="/orders" className="btn btn-primary btn-block">
                View My Orders
              </Link>
              <Link to="/products" className="btn btn-outline btn-block">
                Continue Shopping
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
