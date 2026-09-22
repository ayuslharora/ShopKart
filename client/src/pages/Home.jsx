import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import { axiosInstance } from '../axiosCalls/axios'

const rail = ['All', 'Groceries', 'Fashion', 'Home & living', 'Electronics', 'Beauty', 'Sports', 'Toys']

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchProducts = async () => {
      try {
        const { data } = await axiosInstance.get('/products')
        if (mounted) setProducts(data)
      } catch (error) {
        if (mounted) setProducts([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchProducts()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="light" search cartCount={3} />

      <div className="wrap grid grid-cols-[200px_1fr] items-start gap-10 pt-10 pb-18 max-[1000px]:grid-cols-1">
        <aside className="sticky top-25 flex flex-col gap-2 max-[1000px]:static max-[1000px]:flex-row max-[1000px]:flex-wrap">
          <span className="mt-0 mb-2.5 text-[12.5px] font-extrabold text-ink-soft max-[1000px]:mt-3 max-[1000px]:w-full">
            Categories
          </span>
          <ul className="m-0 flex list-none flex-col p-0">
            {rail.map((c, i) => (
              <li
                key={c}
                className={`rounded-md px-2.5 py-2 text-[14.5px] font-semibold ${
                  i === 0 ? 'bg-paper-2 text-ink' : 'text-ink-soft'
                }`}
              >
                {c}
              </li>
            ))}
          </ul>

          <span className="mt-5 mb-2.5 text-[12.5px] font-extrabold text-ink-soft max-[1000px]:w-full">
            Price
          </span>
          <ul className="m-0 flex list-none flex-col p-0">
            <li className="rounded-md px-2.5 py-2 text-[14.5px] font-semibold text-ink-soft">Under ₹500</li>
            <li className="rounded-md px-2.5 py-2 text-[14.5px] font-semibold text-ink-soft">₹500 – ₹1,500</li>
            <li className="rounded-md px-2.5 py-2 text-[14.5px] font-semibold text-ink-soft">₹1,500 – ₹3,000</li>
            <li className="rounded-md px-2.5 py-2 text-[14.5px] font-semibold text-ink-soft">Above ₹3,000</li>
          </ul>
        </aside>

        <main>
          <div className="mb-7 flex items-end justify-between gap-4 max-[560px]:flex-col max-[560px]:items-start">
            <div>
              <h1 className="text-[30px]">Browse the stall</h1>
              <p className="mt-1.5 text-[14.5px] text-ink-soft">{products.length} listings from sellers near you</p>
            </div>
            <select
              defaultValue="popular"
              aria-label="Sort products"
              className="rounded-lg border-[1.5px] border-line-strong bg-cream px-3.5 py-2.5 text-sm font-semibold text-ink"
            >
              <option value="popular">Most popular</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-4 gap-5 max-[1000px]:grid-cols-2 max-[560px]:grid-cols-1">
              {products.map((p) => (
                <ProductCard key={p._id} {...p} />
              ))}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  )
}
