import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import { axiosInstance } from '../axiosCalls/axios'

const categories = ['All', 'Groceries', 'Fashion', 'Home & living', 'Electronics', 'Beauty', 'Sports', 'Toys']

export default function Products() {
  const [products, setProducts] = useState([])
  const [status, setStatus] = useState('loading') // 'loading' | 'error' | 'ready'
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [wishlistIds, setWishlistIds] = useState(() => new Set())

  useEffect(() => {
    let mounted = true

    // Load which products are already saved so each card starts in the right state.
    const fetchWishlist = async () => {
      try {
        const { data } = await axiosInstance.get('/wishlist')
        if (mounted) setWishlistIds(new Set(data.wishlist.map((p) => p._id)))
      } catch {
        // Cards still work without this: a stale "add" gets a 409 and is corrected below.
      }
    }

    fetchWishlist()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true

    const params = {}
    if (search.trim()) params.search = search.trim()
    if (category !== 'All') params.category = category

    const timeout = setTimeout(async () => {
      setStatus('loading')
      try {
        const { data } = await axiosInstance.get('/products', { params })
        if (!mounted) return
        setProducts(data)
        setStatus('ready')
      } catch (error) {
        if (!mounted) return
        setStatus('error')
      }
    }, 300)

    return () => {
      mounted = false
      clearTimeout(timeout)
    }
  }, [search, category])

  const setWishlisted = (id, saved) => {
    setWishlistIds((prev) => {
      const next = new Set(prev)
      if (saved) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const handleToggleWishlist = async (id, wishlisted) => {
    try {
      if (wishlisted) {
        await axiosInstance.delete(`/wishlist/${id}`)
        setWishlisted(id, false)
      } else {
        await axiosInstance.post(`/wishlist/${id}`)
        setWishlisted(id, true)
      }
    } catch (error) {
      const status = error.response?.status
      // 409 = already saved, 404 on remove = already gone: the server is right, sync to it.
      if (!wishlisted && status === 409) return setWishlisted(id, true)
      if (wishlisted && status === 404) return setWishlisted(id, false)
      throw error
    }
  }

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar
        variant="light"
        search
        wishlistCount={wishlistIds.size}
        searchValue={search}
        onSearchChange={setSearch}
      />

      <div className="wrap grid grid-cols-[200px_1fr] items-start gap-10 pt-10 pb-18 max-[1000px]:grid-cols-1">
        <aside className="sticky top-25 flex flex-col gap-2 max-[1000px]:static max-[1000px]:flex-row max-[1000px]:flex-wrap">
          <span className="mt-0 mb-2.5 text-[12.5px] font-extrabold text-ink-soft max-[1000px]:mt-3 max-[1000px]:w-full">
            Categories
          </span>
          <ul className="m-0 flex list-none flex-col p-0">
            {categories.map((c) => (
              <li key={c}>
                <button
                  type="button"
                  onClick={() => setCategory(c)}
                  className={`w-full rounded-md px-2.5 py-2 text-left text-[14.5px] font-semibold ${
                    category === c ? 'bg-paper-2 text-ink' : 'text-ink-soft'
                  }`}
                >
                  {c}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main>
          <div className="mb-7 flex items-end justify-between gap-4 max-[560px]:flex-col max-[560px]:items-start">
            <div>
              <h1 className="text-[30px]">Browse the stall</h1>
              <p className="mt-1.5 text-[14.5px] text-ink-soft">
                {status === 'ready' ? `${products.length} listings from sellers near you` : ' '}
              </p>
            </div>
          </div>

          {status === 'loading' && <Loading />}

          {status === 'error' && (
            <p className="text-[14.5px] font-medium text-brick">Something went wrong while loading products.</p>
          )}

          {status === 'ready' && products.length === 0 && (
            <p className="text-[14.5px] text-ink-soft">No products found.</p>
          )}

          {status === 'ready' && products.length > 0 && (
            <div className="grid grid-cols-4 gap-5 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
              {products.map((p) => (
                <ProductCard
                  key={p._id}
                  {...p}
                  wishlisted={wishlistIds.has(p._id)}
                  onToggleWishlist={handleToggleWishlist}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
