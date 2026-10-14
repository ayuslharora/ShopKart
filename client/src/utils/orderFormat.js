// Last 8 characters of the MongoDB id, e.g. "#F781E23E" — enough to tell orders apart.
export const shortOrderId = (id = '') => `#${id.slice(-8).toUpperCase()}`

export const formatOrderDate = (date) =>
  new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
