import { Link } from 'react-router-dom'
import OrderStatusTracker from './OrderStatusTracker'
import { formatPrice } from '../utils/formatPrice'
import { formatOrderDate, shortOrderId } from '../utils/orderFormat'

const MAX_LINES = 3

export default function OrderCard({ order }) {
  const extra = order.items.length - MAX_LINES

  return (
    <article className="rounded-xl border-[1.5px] border-line-strong bg-cream p-5.5">
      <header className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line pb-3.5">
        <h2 className="text-[17px]">Order {shortOrderId(order._id)}</h2>
        <span className="text-[13px] text-ink-soft">{formatOrderDate(order.createdAt)}</span>
      </header>

      <div className="flex gap-5 py-4 max-[560px]:flex-col">
        <div className="flex -space-x-3">
          {order.items.slice(0, MAX_LINES).map((item) => (
            <div
              key={item.product}
              className="h-14 w-14 shrink-0 rounded-lg border-2 border-cream bg-paper-2 bg-cover bg-center"
              style={item.image ? { backgroundImage: `url(${item.image})` } : undefined}
            />
          ))}
        </div>

        <ul className="flex flex-1 flex-col gap-1 text-[14.5px]">
          {order.items.slice(0, MAX_LINES).map((item) => (
            <li key={item.product}>
              {item.name} <span className="text-ink-soft">× {item.quantity}</span>
            </li>
          ))}
          {extra > 0 && <li className="text-[13px] text-ink-soft">+ {extra} more</li>}
        </ul>

        <div className="text-right max-[560px]:text-left">
          <span className="text-[12.5px] font-bold text-ink-soft">Total</span>
          <p className="text-[18px] font-extrabold">{formatPrice(order.totalAmount)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-line pt-4">
        <div className="min-w-[240px] flex-1 max-w-[360px]">
          <OrderStatusTracker status={order.status} compact />
        </div>
        <Link to={`/orders/${order._id}`} className="btn btn-outline">
          View Details
        </Link>
      </div>
    </article>
  )
}
