import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import ProductCard from '../components/ProductCard'
import './Home.css'

const rail = [
  'All',
  'Groceries',
  'Fashion',
  'Home & living',
  'Electronics',
  'Beauty',
  'Sports',
  'Toys',
]

const products = [
  { name: 'Woven market tote', category: 'Home & living', price: 799, oldPrice: 999, tone: 'marigold', discount: 20 },
  { name: 'Terracotta spice set', category: 'Groceries', price: 549, tone: 'brick' },
  { name: 'Recycled cotton throw', category: 'Home & living', price: 1299, oldPrice: 1599, tone: 'leaf', discount: 19 },
  { name: 'Everyday canvas sneakers', category: 'Fashion', price: 1899, tone: 'ink' },
  { name: 'Cold-press coffee kit', category: 'Groceries', price: 899, oldPrice: 1099, tone: 'brick', discount: 18 },
  { name: 'Desk lamp, brass finish', category: 'Home & living', price: 1499, tone: 'marigold' },
  { name: 'Linen table runner', category: 'Home & living', price: 649, tone: 'leaf' },
  { name: 'Wireless earbuds', category: 'Electronics', price: 2399, oldPrice: 2999, tone: 'ink', discount: 20 },
]

export default function Home() {
  return (
    <div className="page-home">
      <Navbar variant="light" search cartCount={3} />

      <div className="wrap home-body">
        <aside className="home-rail">
          <span className="home-rail-title">Categories</span>
          <ul>
            {rail.map((c, i) => (
              <li key={c} className={i === 0 ? 'active' : ''}>
                {c}
              </li>
            ))}
          </ul>

          <span className="home-rail-title">Price</span>
          <ul>
            <li>Under ₹500</li>
            <li>₹500 – ₹1,500</li>
            <li>₹1,500 – ₹3,000</li>
            <li>Above ₹3,000</li>
          </ul>
        </aside>

        <main className="home-main">
          <div className="home-main-head">
            <div>
              <h1>Browse the stall</h1>
              <p>{products.length} listings from sellers near you</p>
            </div>
            <select className="home-sort" defaultValue="popular" aria-label="Sort products">
              <option value="popular">Most popular</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
            </select>
          </div>

          <div className="home-grid">
            {products.map((p) => (
              <ProductCard key={p.name} {...p} />
            ))}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  )
}
