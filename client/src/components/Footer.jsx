import './Footer.css'

const columns = [
  {
    title: 'Shop',
    items: ['New arrivals', 'Best sellers', 'Deals', 'Gift cards'],
  },
  {
    title: 'Help',
    items: ['Track order', 'Returns', 'Shipping', 'Contact us'],
  },
  {
    title: 'ShopKart',
    items: ['About', 'Sellers', 'Careers', 'Press'],
  },
]

export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-row">
        <div className="footer-brand">
          <h3>ShopKart</h3>
          <p>Everything you need, nothing you don't.</p>
        </div>

        {columns.map((col) => (
          <div className="footer-col" key={col.title}>
            <span className="footer-heading">{col.title}</span>
            <ul>
              {col.items.map((item) => (
                <li key={item}>
                  <a href="#">{item}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} ShopKart</span>
        <span className="footer-stub">practice project — not a real store</span>
      </div>
    </footer>
  )
}
