import Logo from './Logo'
import './Navbar.css'

const links = [
  { label: 'Shop', href: '#' },
  { label: 'Categories', href: '#' },
  { label: 'Deals', href: '#' },
]

export default function Navbar({ variant = 'light', search = false, cartCount = 0 }) {
  return (
    <header className={`nav nav-${variant}`}>
      <div className="wrap nav-row">
        <Logo variant={variant === 'dark' ? 'dark' : 'light'} />

        {search && (
          <div className="nav-search">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input type="text" placeholder="Search for anything" aria-label="Search products" />
          </div>
        )}

        <nav className="nav-links">
          {!search &&
            links.map((l) => (
              <a key={l.label} href={l.href}>
                {l.label}
              </a>
            ))}
        </nav>

        <div className="nav-actions">
          {search ? (
            <>
              <button type="button" className="nav-icon-btn" aria-label="Cart">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M2 3h2l1.6 9.6a2 2 0 0 0 2 1.7h6.8a2 2 0 0 0 2-1.6L18 6H5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle cx="8" cy="17" r="1.3" fill="currentColor" />
                  <circle cx="15" cy="17" r="1.3" fill="currentColor" />
                </svg>
                {cartCount > 0 && <span className="nav-cart-badge">{cartCount}</span>}
              </button>
              <div className="nav-avatar" aria-hidden="true">A</div>
            </>
          ) : (
            <>
              <a href="/login" className="nav-login">
                Log in
              </a>
              <a href="/signup" className="btn btn-primary">
                Sign up
              </a>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
