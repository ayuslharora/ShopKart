export const SHIPPING_FIELDS = [
  { name: 'fullName', label: 'Full Name', autoComplete: 'name', placeholder: 'Aarav Sharma' },
  { name: 'phone', label: 'Phone', autoComplete: 'tel', placeholder: '98765 43210', inputMode: 'tel' },
  { name: 'addressLine1', label: 'Address', autoComplete: 'address-line1', placeholder: '22 MG Road' },
  { name: 'city', label: 'City', autoComplete: 'address-level2', placeholder: 'Bengaluru' },
  { name: 'state', label: 'State', autoComplete: 'address-level1', placeholder: 'Karnataka' },
  { name: 'pincode', label: 'Pincode', autoComplete: 'postal-code', placeholder: '560001', inputMode: 'numeric' },
]

// Same rules the server applies, so obvious mistakes are caught before any request.
// Returns { field: message } — an empty object means the form is valid.
export const validateShipping = (form) => {
  const errors = {}

  for (const { name, label } of SHIPPING_FIELDS) {
    if (!form[name]?.trim()) errors[name] = `${label} is required.`
  }

  if (!errors.phone) {
    const digits = form.phone.trim().replace(/[\s-]/g, '').replace(/^(\+91|0)/, '')
    if (!/^[6-9]\d{9}$/.test(digits)) errors.phone = 'Enter a valid 10-digit mobile number.'
  }

  if (!errors.pincode && !/^\d{6}$/.test(form.pincode.trim())) {
    errors.pincode = 'Pincode must contain 6 digits.'
  }

  return errors
}
