import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import './Landing.css'

const categories = ['Groceries', 'Fashion', 'Home & living', 'Electronics', 'Beauty', 'Deals']

const picks = [
  { name: 'Woven market tote', category: 'Home & living', price: 799, oldPrice: 999, tone: 'marigold', discount: 20 },
  { name: 'Terracotta spice set', category: 'Groceries', price: 549, tone: 'brick' },
  { name: 'Recycled cotton throw', category: 'Home & living', price: 1299, oldPrice: 1599, tone: 'leaf', discount: 19 },
]

export default function Landing() {
  return (
    <div className="page-landing">
      <Navbar variant="dark" />

      <section className="hero">
        <div className="wrap hero-inner">
          <span className="hero-stamp">Est. by shoppers, for shoppers</span>
          <h1 className="hero-title">
            Everything you need,
            <br />
            nothing you don't.
          </h1>
          <p className="hero-sub">
            ShopKart brings local sellers and everyday essentials onto one stall — browse, compare,
            and check out without the noise.
          </p>
          <div className="hero-actions">
            <a href="/signup" className="btn btn-primary">
              Start shopping
            </a>
            <a href="/login" className="btn btn-ghost">
              I have an account
            </a>
          </div>
        </div>
      </section>

      <section className="cat-strip">
        <div className="wrap cat-row">
          {categories.map((c) => (
            <span className="cat-chip" key={c}>
              {c}
            </span>
          ))}
        </div>
      </section>

      <section className="picks">
        <div className="wrap">
          <div className="section-head">
            <h2>Today's picks</h2>
            <p>Fresh listings from sellers near you</p>
          </div>
          <div className="picks-grid">
            {picks.map((p) => (
              <ProductCard key={p.name} {...p} />
            ))}
          </div>
        </div>
      </section>

      <section className="stat-band">
        <div className="wrap stat-inner">
          <div className="stat-copy">
            <h2>Built for the corner-shop hustle, not the warehouse.</h2>
            <p>
              Every stall on ShopKart is run by a real seller. No faceless fulfilment centres —
              just people who know their stock.
            </p>
          </div>
          <div className="stat-block">
            <span className="stat-number">12,400+</span>
            <span className="stat-label">sellers on ShopKart</span>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
