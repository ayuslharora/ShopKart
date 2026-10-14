// 5998 -> "₹5,998"
export const formatPrice = (amount) => `₹${amount.toLocaleString('en-IN')}`
