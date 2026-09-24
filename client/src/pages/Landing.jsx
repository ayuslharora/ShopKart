import { useEffect, useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import Loading from '../components/Loading'
import { axiosInstance } from '../axiosCalls/axios'

const categories = ['Groceries', 'Fashion', 'Home & living', 'Electronics', 'Beauty', 'Deals']

export default function Landing() {
  const [picks, setPicks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    const fetchPicks = async () => {
      try {
        const { data } = await axiosInstance.get('/products')
        if (mounted) setPicks(data.slice(0, 3))
      } catch (error) {
        if (mounted) setPicks([])
      } finally {
        if (mounted) setLoading(false)
      }
    }

    fetchPicks()

    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="flex min-h-svh flex-col">
      <Navbar variant="dark" />

      <section className="bg-ink py-22 text-paper max-[640px]:py-16">
        <div className="wrap max-w-[760px]">
          <span className="mb-7 inline-block rounded-full border-[1.5px] border-marigold/50 px-3.5 py-1.5 text-[13px] font-bold text-marigold">
            Est. by shoppers, for shoppers
          </span>
          <h1 className="text-[68px] leading-[1.03] tracking-[-0.02em] max-[900px]:text-[44px]">
            Everything you need,
            <br />
            nothing you don't.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-paper/78">
            ShopKart brings local sellers and everyday essentials onto one stall — browse, compare,
            and check out without the noise.
          </p>
          <div className="mt-9 flex gap-4 max-[640px]:flex-col">
            <a href="/signup" className="btn btn-primary">
              Start shopping
            </a>
            <a href="/login" className="btn btn-ghost">
              I have an account
            </a>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-paper-2">
        <div className="wrap flex flex-wrap gap-2.5 py-5">
          {categories.map((c) => (
            <span
              key={c}
              className="rounded-full border-[1.5px] border-line-strong bg-cream px-4 py-2 text-sm font-bold"
            >
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="wrap">
          <div className="mb-8">
            <h2 className="text-[32px]">Today's picks</h2>
            <p className="mt-2 text-[15.5px] text-ink-soft">Fresh listings from sellers near you</p>
          </div>
          {loading ? (
            <Loading />
          ) : (
            <div className="grid grid-cols-3 gap-6 max-[900px]:grid-cols-1">
              {picks.map((p) => (
                <ProductCard key={p._id} {...p} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-marigold">
        <div className="wrap grid grid-cols-[1.4fr_1fr] items-center gap-12 py-18 max-[900px]:grid-cols-1 max-[900px]:gap-0">
          <div>
            <h2 className="max-w-[20ch] text-[30px] leading-tight">
              Built for the corner-shop hustle, not the warehouse.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[15.5px] leading-relaxed text-ink/75">
              Every stall on ShopKart is run by a real seller. No faceless fulfilment centres —
              just people who know their stock.
            </p>
          </div>
          <div className="flex flex-col border-l-[3px] border-ink pl-6 max-[900px]:border-t-[3px] max-[900px]:border-l-0 max-[900px]:pt-5 max-[900px]:pl-0">
            <span className="font-display text-[52px] leading-none font-extrabold">12,400+</span>
            <span className="mt-2 text-[14.5px] font-bold">sellers on ShopKart</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
