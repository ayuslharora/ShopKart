import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OrderStatusTracker from '../components/OrderStatusTracker'
import { axiosInstance } from '../axiosCalls/axios'
import { formatPrice } from '../utils/formatPrice'
import { formatOrderDate, shortOrderId } from '../utils/orderFormat'

const paymentStyles = { PAID: 'text-leaf', PENDING: 'text-marigold-dim', FAILED: 'text-brick' }

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [status, setStatus] = useState('loading') // 'loading' | 'notFound' | 'error' | 'ready'
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true

    axiosInstance
      .get(`/orders/${id}`)
      .then(({ data }) => {
        if (!mounted) return
        setOrder(data.order)
        setStatus('ready')
      })
      .catch((err) => {
        if (!mounted) return
        const code = err.response?.status
        setStatus(code === 404 || code === 400 ? 'notFound' : 'error')
      })

    return () => {
      mounted = false
    }
  }, [id, reloadKey])

  const retry = () => {
    setStatus('loading')
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search />

      <main className="wrap flex-1 pt-10 pb-18">
        <div className="mx-auto max-w-[820px]">
          <Link to="/orders" className="text-[13.5px] font-bold text-ink-soft hover:text-ink">
            ← My Orders
          </Link>

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line-strong border-t-ink" />
              <p className="text-[14.5px] text-ink-soft">Loading your order...</p>
            </div>
          )}

          {status === 'notFound' && (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-[17px] font-bold">Order not found.</p>
              <p className="text-[14.5px] text-ink-soft">It may not exist, or it belongs to another account.</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-[17px] font-bold">Unable to load this order.</p>
              <button type="button" onClick={retry} className="btn btn-outline mt-4">
                Try Again
              </button>
            </div>
          )}

          {status === 'ready' && (
            <>
              <div className="mt-3 flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-[30px]">Order {shortOrderId(order._id)}</h1>
                <span className="text-[14px] text-ink-soft">Placed {formatOrderDate(order.createdAt)}</span>
              </div>

              <section className="mt-7 rounded-xl border-[1.5px] border-line-strong bg-cream p-6">
                <OrderStatusTracker status={order.status} />
                {order.paymentStatus !== 'PAID' && (
                  <p className="mt-3 text-[13.5px] text-ink-soft">
                    Payment for this order was not completed, so it was never placed.
                  </p>
                )}
              </section>

              <section className="mt-6 rounded-xl border-[1.5px] border-line-strong bg-cream p-6">
                <h2 className="text-[18px]">Items</h2>
                <ul className="mt-2">
                  {order.items.map((item) => (
                    <li key={item.product} className="flex items-center gap-4 border-b border-line py-4 last:border-b-0">
                      <Link
                        to={`/products/${item.product}`}
                        className="h-16 w-16 shrink-0 rounded-lg bg-paper-2 bg-cover bg-center"
                        style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
                        aria-label={item.name}
                      />
                      <div className="flex-1">
                        <p className="text-[15px] font-bold">{item.name}</p>
                        <p className="mt-0.5 text-[13px] text-ink-soft">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                      <span className="text-[15px] font-extrabold">{formatPrice(item.price * item.quantity)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex justify-between border-t-[1.5px] border-line-strong pt-4 text-[17px]">
                  <span className="font-bold">Total</span>
                  <span className="font-extrabold">{formatPrice(order.totalAmount)}</span>
                </div>
                <p className="mt-2 text-[12px] text-ink-soft">Prices shown are what you paid at the time of purchase.</p>
              </section>

              <div className="mt-6 grid grid-cols-2 gap-6 max-[640px]:grid-cols-1">
                <section className="rounded-xl border-[1.5px] border-line-strong bg-cream p-6">
                  <h2 className="text-[18px]">Shipping to</h2>
                  <address className="mt-3 text-[14.5px] leading-relaxed not-italic">
                    <span className="font-bold">{order.shippingAddress.fullName}</span>
                    <br />
                    {order.shippingAddress.addressLine1}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    <br />
                    <span className="text-ink-soft">Phone: {order.shippingAddress.phone}</span>
                  </address>
                </section>

                <section className="rounded-xl border-[1.5px] border-line-strong bg-cream p-6">
                  <h2 className="text-[18px]">Payment</h2>
                  <dl className="mt-3 flex flex-col gap-2 text-[14px]">
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-soft">Status</dt>
                      <dd className={`font-bold ${paymentStyles[order.paymentStatus] || ''}`}>{order.paymentStatus}</dd>
                    </div>
                    <div className="flex justify-between gap-3">
                      <dt className="text-ink-soft">Method</dt>
                      <dd className="font-semibold">Razorpay (Test Mode)</dd>
                    </div>
                    {order.razorpayPaymentId && (
                      <div className="flex justify-between gap-3">
                        <dt className="text-ink-soft">Payment ID</dt>
                        <dd className="font-mono text-[12.5px] break-all">{order.razorpayPaymentId}</dd>
                      </div>
                    )}
                  </dl>
                </section>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
