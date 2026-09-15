import './Logo.css'

export default function Logo({ variant = 'dark', className = '' }) {
  return (
    <a href="/" className={`logo logo-${variant} ${className}`}>
      <svg className="logo-mark" width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
        <rect width="32" height="32" rx="7" className="logo-mark-bg" />
        <g transform="translate(16,16) rotate(-18) translate(-8.5,-8)">
          <path
            d="M0,8 L6,1 H15 A2,2 0 0 1 17,3 V13 A2,2 0 0 1 15,15 H6 Z"
            className="logo-mark-tag"
          />
          <circle cx="5" cy="8" r="1.6" className="logo-mark-hole" />
        </g>
      </svg>
      <span className="logo-word">ShopKart</span>
    </a>
  )
}
