import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import WishlistCard from '../components/WishlistCard'
import { axiosInstance } from '../axiosCalls/axios'

export default function Wishlist() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'
  const [removingIds, setRemovingIds] = useState(() => new Set())
  const [removeErrors, setRemoveErrors] = useState({})

  // Bumping this re-runs the fetch effect (used by "Try Again").
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let mounted = true

    axiosInstance
      .get('/wishlist')
      .then(({ data }) => {
        if (!mounted) return
        setItems(data.wishlist)
        setStatus('ready')
      })
      .catch(() => mounted && setStatus('error'))

    return () => {
      mounted = false
    }
  }, [reloadKey])

  const handleRetry = () => {
    setStatus('loading')
    setReloadKey((k) => k + 1)
  }

  const handleRemove = async (id) => {
    setRemovingIds((prev) => new Set(prev).add(id))
    setRemoveErrors((prev) => ({ ...prev, [id]: '' }))
    try {
      await axiosInstance.delete(`/wishlist/${id}`)
      setItems((prev) => prev.filter((p) => p._id !== id))
    } catch (error) {
      if (error.response?.status === 404) {
        // Already removed (e.g. from another tab) — drop it here too.
        setItems((prev) => prev.filter((p) => p._id !== id))
      } else {
        setRemoveErrors((prev) => ({ ...prev, [id]: 'Unable to remove product. Please try again.' }))
      }
    } finally {
      setRemovingIds((prev) => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search cartCount={3} wishlistCount={items.length} />

      <main className="wrap flex-1 pt-10 pb-18">
        <div className="mb-7">
          <h1 className="text-[30px]">My Wishlist</h1>
          {status === 'ready' && items.length > 0 && (
            <p className="mt-1.5 text-[14.5px] text-ink-soft">
              {items.length} {items.length === 1 ? 'product' : 'products'} saved
            </p>
          )}
        </div>

        {status === 'loading' && (
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-line-strong border-t-ink" />
            <p className="text-[14.5px] text-ink-soft">Loading your wishlist...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <p className="text-[17px] font-bold">Something went wrong.</p>
            <p className="text-[14.5px] text-ink-soft">Unable to load your wishlist.</p>
            <button type="button" onClick={handleRetry} className="btn btn-outline mt-4">
              Try Again
            </button>
          </div>
        )}

        {status === 'ready' && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-20 text-center">
            <span className="text-[40px]" aria-hidden="true">❤️</span>
            <p className="text-[19px] font-bold">Your wishlist is empty</p>
            <p className="text-[14.5px] text-ink-soft">Save products you love and find them here later.</p>
            <Link to="/products" className="btn btn-primary mt-4">
              Browse Products
            </Link>
          </div>
        )}

        {status === 'ready' && items.length > 0 && (
          <div className="grid grid-cols-4 gap-5 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
            {items.map((product) => (
              <WishlistCard
                key={product._id}
                product={product}
                removing={removingIds.has(product._id)}
                error={removeErrors[product._id]}
                onRemove={handleRemove}
              />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
