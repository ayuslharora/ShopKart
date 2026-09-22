import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Loading from '../components/Loading'
import { useAuth } from '../context/AuthContext'
import { axiosInstance } from '../axiosCalls/axios'

const statusStyles = {
  pending: 'text-marigold',
  shipped: 'text-ink',
  delivered: 'text-leaf',
  cancelled: 'text-brick',
}

function ProductStrip({ items, empty, renderMeta }) {
  if (items.length === 0) {
    return <p className="text-[14px] text-ink-soft">{empty}</p>
  }

  return (
    <div className="grid grid-cols-4 gap-4 max-[860px]:grid-cols-2 max-[520px]:grid-cols-1">
      {items.map(({ product, meta, key }) => (
        <Link
          key={key}
          to={`/product/${product._id}`}
          className="block overflow-hidden border-[1.5px] border-line bg-cream transition-colors hover:border-line-strong"
        >
          <div
            className="aspect-4/3 bg-cover bg-center bg-paper-2"
            style={product.imageUrl ? { backgroundImage: `url(${product.imageUrl})` } : undefined}
          />
          <div className="p-3">
            <h4 className="truncate text-[14.5px] leading-tight">{product.name}</h4>
            <div className="mt-1.5 flex items-baseline justify-between gap-2">
              <span className="text-[14px] font-extrabold">₹{product.price}</span>
              {renderMeta && <span className="text-[12px] text-ink-soft">{renderMeta(meta)}</span>}
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default function Profile() {
  const { user, setUser } = useAuth()
  const navigate = useNavigate()
  const [loggingOut, setLoggingOut] = useState(false)
  const [overview, setOverview] = useState(null)
  const [loadingOverview, setLoadingOverview] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchOverview = async () => {
      try {
        const { data } = await axiosInstance.get('/users/profile-overview')
        if (mounted) setOverview(data)
      } catch (error) {
        if (mounted) setOverview(null)
      } finally {
        if (mounted) setLoadingOverview(false)
      }
    }

    fetchOverview()

    return () => {
      mounted = false
    }
  }, [])

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await axiosInstance.post('/users/logout')
    } finally {
      setUser(null)
      setLoggingOut(false)
      navigate('/login', { replace: true })
    }
  }

  const initial = user?.name?.[0]?.toUpperCase() || '?'
  const joined = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search cartCount={3} />

      <main className="wrap flex-1 py-14">
        <div className="mx-auto max-w-[900px]">
          <div className="flex items-center gap-5">
            <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-marigold text-2xl font-extrabold text-ink">
              {initial}
            </div>
            <div>
              <h1 className="text-[26px]">{user?.name}</h1>
              <p className="mt-1 text-[14.5px] text-ink-soft">@{user?.username}</p>
            </div>
          </div>

          <div className="mt-9 grid grid-cols-3 gap-4.5 max-[720px]:grid-cols-1">
            <div className="rounded-xl border-[1.5px] border-line-strong bg-cream p-5">
              <span className="text-[13px] font-bold text-ink-soft">Email</span>
              <p className="mt-1 truncate text-[14.5px] text-ink">{user?.email}</p>
            </div>
            <div className="rounded-xl border-[1.5px] border-line-strong bg-cream p-5">
              <span className="text-[13px] font-bold text-ink-soft">Member since</span>
              <p className="mt-1 text-[14.5px] text-ink">{joined || '—'}</p>
            </div>
            <div className="rounded-xl border-[1.5px] border-line-strong bg-marigold p-5">
              <span className="text-[13px] font-bold text-ink/70">Total orders</span>
              <p className="mt-1 text-[22px] font-extrabold text-ink">
                {loadingOverview ? '—' : overview?.orderCount ?? 0}
              </p>
            </div>
          </div>

          {loadingOverview ? (
            <div className="mt-14">
              <Loading />
            </div>
          ) : (
            <>
              <section className="mt-14">
                <div className="mb-4 flex items-baseline justify-between">
                  <h2 className="text-[20px]">Your orders</h2>
                  <span className="text-[13px] text-ink-soft">{overview?.orderCount ?? 0} total</span>
                </div>

                {overview?.recentOrders?.length ? (
                  <div className="flex flex-col gap-3">
                    {overview.recentOrders.map((order) => (
                      <Link
                        key={order._id}
                        to={`/product/${order.product?._id}`}
                        className="flex items-center justify-between gap-4 rounded-xl border-[1.5px] border-line-strong bg-cream p-4 transition-colors hover:border-line-strong"
                      >
                        <div className="flex items-center gap-3.5">
                          <div
                            className="h-14 w-14 shrink-0 rounded-lg bg-cover bg-center bg-paper-2"
                            style={order.product?.imageUrl ? { backgroundImage: `url(${order.product.imageUrl})` } : undefined}
                          />
                          <div>
                            <p className="text-[14.5px] font-semibold">{order.product?.name || 'Product removed'}</p>
                            <p className="mt-0.5 text-[12.5px] text-ink-soft">
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              {' · '}Qty {order.quantity}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[14.5px] font-extrabold">₹{order.priceAtPurchase}</p>
                          <p className={`mt-0.5 text-[12.5px] font-semibold capitalize ${statusStyles[order.status] || ''}`}>
                            {order.status}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-[14px] text-ink-soft">You haven't placed any orders yet.</p>
                )}
              </section>

              <section className="mt-14">
                <h2 className="mb-4 text-[20px]">Recently viewed</h2>
                <ProductStrip
                  items={(overview?.recentlyViewed || []).map((entry) => ({
                    key: `${entry.product._id}-${entry.viewedAt}`,
                    product: entry.product,
                  }))}
                  empty="Products you view will show up here."
                />
              </section>

              <section className="mt-14">
                <h2 className="mb-4 text-[20px]">Saved for later</h2>
                <ProductStrip
                  items={(overview?.wishlist || []).map((product) => ({ key: product._id, product }))}
                  empty="Save items from a product page to find them here."
                />
              </section>
            </>
          )}

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="btn btn-primary btn-block mt-14 disabled:opacity-60"
          >
            {loggingOut ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
