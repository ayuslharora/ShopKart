const STEPS = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED']

const label = (status) => status[0] + status.slice(1).toLowerCase()

// PLACED → CONFIRMED → SHIPPED → DELIVERED, with every step up to the current one filled in.
export default function OrderStatusTracker({ status, compact = false }) {
  const current = STEPS.indexOf(status)

  if (current === -1) {
    return <p className="text-[13px] font-semibold text-marigold-dim">Payment pending</p>
  }

  return (
    <ol className="flex items-start" aria-label={`Order status: ${label(status)}`}>
      {STEPS.map((step, i) => {
        const done = i <= current
        return (
          <li key={step} className="flex flex-1 flex-col items-center last:flex-none" aria-current={i === current ? 'step' : undefined}>
            <div className="flex w-full items-center">
              <span
                className={`flex shrink-0 items-center justify-center rounded-full border-2 ${
                  compact ? 'h-3.5 w-3.5' : 'h-5 w-5'
                } ${done ? 'border-leaf bg-leaf' : 'border-line-strong bg-cream'}`}
              >
                {done && !compact && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                    <path d="M2 5.2 4.1 7.3 8 3" stroke="#fffdf7" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {i < STEPS.length - 1 && (
                <span className={`h-0.5 flex-1 ${i < current ? 'bg-leaf' : 'bg-line-strong'}`} />
              )}
            </div>
            <span
              className={`mt-1.5 self-start font-bold ${compact ? 'text-[11.5px]' : 'text-[12.5px]'} ${
                i === current ? 'text-ink' : done ? 'text-leaf' : 'text-ink-soft opacity-70'
              }`}
            >
              {label(step)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
