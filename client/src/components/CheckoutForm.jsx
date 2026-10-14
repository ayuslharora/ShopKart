import { SHIPPING_FIELDS } from '../utils/validateShipping'

// City / State / Pincode share a row on wide screens; everything else is full width.
const spans = {
  fullName: 'col-span-6',
  phone: 'col-span-6',
  addressLine1: 'col-span-6',
  city: 'col-span-2 max-[560px]:col-span-6',
  state: 'col-span-2 max-[560px]:col-span-6',
  pincode: 'col-span-2 max-[560px]:col-span-6',
}

// Controlled shipping form. The Checkout page owns the state and does the submit,
// so the "Place Order" button can sit in the order summary (via form="checkout-form").
export default function CheckoutForm({ form, errors, onChange, onSubmit, disabled }) {
  return (
    <form id="checkout-form" noValidate onSubmit={onSubmit} className="grid grid-cols-6 gap-x-4 gap-y-4.5">
      {SHIPPING_FIELDS.map(({ name, label, autoComplete, placeholder, inputMode }) => (
        <label key={name} className={`flex flex-col gap-1.5 ${spans[name]}`}>
          <span className="text-[13.5px] font-bold">{label}</span>
          <input
            type="text"
            name={name}
            value={form[name]}
            onChange={onChange}
            disabled={disabled}
            autoComplete={autoComplete}
            placeholder={placeholder}
            inputMode={inputMode}
            maxLength={name === 'pincode' ? 6 : 200}
            aria-invalid={Boolean(errors[name])}
            aria-describedby={errors[name] ? `${name}-error` : undefined}
            className={`rounded-lg border-[1.5px] bg-cream px-3.5 py-3 text-[15px] text-ink outline-none placeholder:text-ink-soft placeholder:opacity-55 focus-visible:border-ink disabled:opacity-60 ${
              errors[name] ? 'border-brick' : 'border-line-strong'
            }`}
          />
          {errors[name] && (
            <span id={`${name}-error`} className="text-[12.5px] font-medium text-brick">
              {errors[name]}
            </span>
          )}
        </label>
      ))}
    </form>
  )
}
