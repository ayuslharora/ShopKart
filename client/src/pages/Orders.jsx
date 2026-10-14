import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import OrderCard from '../components/OrderCard'
import { axiosInstance } from '../axiosCalls/axios'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true

    axiosInstance
      .get('/orders')
      .then(({ data }) => {
        if (!mounted) return
        setOrders(data.orders)
        setStatus('ready')
      })
      .catch(() => mounted && setStatus('error'))

    return () => {
      mounted = false
    }
  }, [reloadKey])

  const retry = () => {
    setStatus('loading')
    setReloadKey((k) => k + 1)
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search />

      <main className="wrap flex-1 pt-10 pb-18">
        <div className="mx-auto max-w-[820px]">
          <h1 className="text-[30px]">My Orders</h1>
          {status === 'ready' && orders.length > 0 && (
            <p className="mt-1.5 text-[14.5px] text-ink-soft">
              {orders.length} {orders.length === 1 ? 'order' : 'orders'}
            </p>
          )}

          {status === 'loading' && (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line-strong border-t-ink" />
              <p className="text-[14.5px] text-ink-soft">Loading your orders...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <p className="text-[17px] font-bold">Unable to load your orders.</p>
              <button type="button" onClick={retry} className="btn btn-outline mt-4">
                Try Again
              </button>
            </div>
          )}

          {status === 'ready' && orders.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-20 text-center">
              <span className="text-[40px]" aria-hidden="true">📦</span>
              <p className="text-[19px] font-bold">You have not placed any orders yet.</p>
              <Link to="/products" className="btn btn-primary mt-4">
                Start Shopping
              </Link>
            </div>
          )}

          {status === 'ready' && orders.length > 0 && (
            <div className="mt-7 flex flex-col gap-5">
              {orders.map((order) => (
                <OrderCard key={order._id} order={order} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
