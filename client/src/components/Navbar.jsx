import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Logo from './Logo'
import { axiosInstance } from '../axiosCalls/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/useCart'

const links = [
  { label: 'Shop', href: '/products' },
  { label: 'Categories', href: '/products' },
  { label: 'Deals', href: '/products' },
]

const appLinks = [
  { label: 'Home', href: '/home' },
  { label: 'Products', href: '/products' },
  { label: 'Orders', href: '/orders' },
]

export default function Navbar({
  variant = 'light',
  search = false,
  wishlistCount,
  searchValue,
  onSearchChange,
}) {
  const dark = variant === 'dark'
  const { user, setUser } = useAuth()
  const { totalUnits } = useCart()
  const navigate = useNavigate()
  const [fetchedWishlistCount, setFetchedWishlistCount] = useState(null)
  const [loggingOut, setLoggingOut] = useState(false)
  const loggedIn = search && user

  // Pages that already hold the wishlist (Products, Wishlist) pass wishlistCount so
  // the badge updates live. Everywhere else, ask the backend for the count once.
  useEffect(() => {
    if (!loggedIn || wishlistCount !== undefined) return
    let mounted = true

    axiosInstance
      .get('/wishlist')
      .then(({ data }) => mounted && setFetchedWishlistCount(data.count))
      .catch(() => {})

    return () => {
      mounted = false
    }
  }, [loggedIn, wishlistCount])

  const savedCount = wishlistCount ?? fetchedWishlistCount

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

  return (
    <header
      className={`sticky top-0 z-20 border-b ${
        dark ? 'bg-ink border-paper/15' : 'bg-paper border-line'
      }`}
    >
      <div className="wrap flex h-19 items-center gap-8">
        <Logo variant={dark ? 'dark' : 'light'} className="shrink-0" />

        {search && (
          <div className="flex max-w-[420px] flex-1 items-center gap-2.5 rounded-full border border-line bg-paper-2 px-4.5 py-2.5 text-ink-soft">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="shrink-0">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.6" />
              <path d="M11 11l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search for anything"
              aria-label="Search products"
              value={searchValue ?? undefined}
              onChange={onSearchChange ? (e) => onSearchChange(e.target.value) : undefined}
              className="flex-1 border-0 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-70"
            />
          </div>
        )}

        <nav className="flex gap-7 text-[15px] font-semibold max-[720px]:hidden">
          {loggedIn &&
            appLinks.map((l) => (
              <Link key={l.label} to={l.href} className="hover:text-marigold">
                {l.label}
              </Link>
            ))}
          {!search &&
            links.map((l) => (
              <Link
                key={l.label}
                to={l.href}
                className={`hover:text-marigold ${dark ? 'text-paper/82' : ''}`}
              >
                {l.label}
              </Link>
            ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4.5">
          {loggedIn ? (
            <>
              <Link
                to="/wishlist"
                className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-ink hover:text-brick"
              >
                <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path
                    d="M10 17s-6.5-3.9-6.5-8.6A3.6 3.6 0 0 1 10 6.1a3.6 3.6 0 0 1 6.5 2.3C16.5 13.1 10 17 10 17Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                </svg>
                Wishlist{savedCount ? ` (${savedCount})` : ''}
              </Link>
              <Link
                to="/cart"
                className="inline-flex items-center gap-1.5 text-[14.5px] font-bold text-ink hover:text-marigold-dim"
              >
                <svg width="19" height="19" viewBox="0 0 20 20" fill="none" aria-hidden="true">
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
                Cart ({totalUnits})
              </Link>
              <Link
                to="/profile"
                aria-label="Profile"
                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full bg-marigold text-sm font-extrabold text-ink"
              >
                {user.name?.[0]?.toUpperCase() || '?'}
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="cursor-pointer border-0 bg-transparent p-0 text-[14.5px] font-bold text-ink-soft hover:text-ink disabled:opacity-60"
              >
                {loggingOut ? 'Logging out…' : 'Logout'}
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={`text-[15px] font-bold ${dark ? 'text-paper' : ''}`}>
                Log in
              </Link>
              <Link to="/signup" className="btn btn-primary">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
