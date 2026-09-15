import Logo from './Logo'

const links = [
  { label: 'Shop', href: '#' },
  { label: 'Categories', href: '#' },
  { label: 'Deals', href: '#' },
]

export default function Navbar({ variant = 'light', search = false, cartCount = 0 }) {
  const dark = variant === 'dark'

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
              className="flex-1 border-0 bg-transparent text-[14.5px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-70"
            />
          </div>
        )}

        <nav className="flex gap-7 text-[15px] font-semibold max-[720px]:hidden">
          {!search &&
            links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className={`hover:text-marigold ${dark ? 'text-paper/82' : ''}`}
              >
                {l.label}
              </a>
            ))}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-4.5">
          {search ? (
            <>
              <button type="button" aria-label="Cart" className="relative inline-flex cursor-pointer border-0 bg-none p-1 text-ink">
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
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 min-w-4 rounded-full bg-brick px-1.5 py-0.5 text-center text-[10.5px] leading-none font-extrabold text-cream">
                    {cartCount}
                  </span>
                )}
              </button>
              <div
                aria-hidden="true"
                className="inline-flex h-8.5 w-8.5 items-center justify-center rounded-full bg-marigold text-sm font-extrabold text-ink"
              >
                A
              </div>
            </>
          ) : (
            <>
              <a href="/login" className={`text-[15px] font-bold ${dark ? 'text-paper' : ''}`}>
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
