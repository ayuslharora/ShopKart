const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js'

let loading = null

// Loads Razorpay's Checkout script once. Resolves true when window.Razorpay is
// available, false if the script couldn't load (offline, blocked by an ad blocker…).
export const loadRazorpay = () => {
  if (window.Razorpay) return Promise.resolve(true)
  if (loading) return loading

  loading = new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = CHECKOUT_SRC
    script.onload = () => resolve(true)
    script.onerror = () => {
      script.remove()
      loading = null // allow a retry on the next attempt
      resolve(false)
    }
    document.body.appendChild(script)
  })

  return loading
}
