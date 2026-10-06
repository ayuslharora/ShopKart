import { Link } from 'react-router-dom'

export default function Logo({ variant = 'dark', className = '' }) {
  const light = variant === 'light'

  return (
    <Link to="/" className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#1b1f3b" />
        <g transform="translate(16,16) rotate(-18) translate(-8.5,-8)">
          <path
            d="M0,8 L6,1 H15 A2,2 0 0 1 17,3 V13 A2,2 0 0 1 15,15 H6 Z"
            fill="#f4a300"
          />
          <circle cx="5" cy="8" r="1.6" fill="#1b1f3b" />
        </g>
      </svg>
      <span className={`font-display text-xl font-bold tracking-[-0.01em] ${light ? 'text-ink' : 'text-paper'}`}>
        ShopKart
      </span>
    </Link>
  )
}
