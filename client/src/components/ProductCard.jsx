import { Link } from 'react-router-dom'

const tones = ['marigold', 'leaf', 'brick', 'ink']

const toneStyles = {
  marigold: 'bg-linear-155 from-marigold to-[#e8b34a]',
  leaf: 'bg-linear-155 from-leaf to-[#6f9a72]',
  brick: 'bg-linear-155 from-brick to-[#dd6a4a]',
  ink: 'bg-linear-155 from-ink to-[#3a4074]',
}

const toneFor = (id = '') => tones[[...id].reduce((sum, c) => sum + c.charCodeAt(0), 0) % tones.length]

export default function ProductCard({ _id, name, category, price, oldPrice, discount, imageUrl }) {
  const tone = toneFor(_id || name)

  return (
    <Link
      to={`/products/${_id}`}
      className="block overflow-hidden border-[1.5px] border-line bg-cream transition-colors hover:border-line-strong"
    >
      <div
        className={`relative flex aspect-4/3 items-start justify-end bg-cover bg-center p-3 ${
          imageUrl ? '' : toneStyles[tone]
        }`}
        style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
      >
        {discount && (
          <span
            className="bg-ink px-2.5 py-1.5 text-[12.5px] font-extrabold text-paper [clip-path:polygon(0%_15%,10%_0%,90%_0%,100%_15%,100%_85%,90%_100%,10%_100%,0%_85%)]"
          >
            -{discount}%
          </span>
        )}
      </div>
      <div className="p-4">
        <span className="text-xs font-bold text-ink-soft">{category}</span>
        <h4 className="my-1 mb-2.5 text-[17px] leading-tight">{name}</h4>
        <div className="flex items-baseline gap-2">
          <span className="text-[16.5px] font-extrabold">₹{price}</span>
          {oldPrice && <span className="text-[13.5px] text-ink-soft line-through">₹{oldPrice}</span>}
        </div>
      </div>
    </Link>
  )
}
