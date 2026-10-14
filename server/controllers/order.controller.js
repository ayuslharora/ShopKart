import crypto from 'crypto'
import mongoose from 'mongoose'
import Order, { ORDER_STATUSES } from '../models/Order.model.js'
import Product from '../models/Product.model.js'
import User from '../models/Users.model.js'
import { getRazorpay } from '../config/razorpay.js'

const SHIPPING_FIELDS = {
    fullName: 'Full name',
    phone: 'Phone number',
    addressLine1: 'Address',
    city: 'City',
    state: 'State',
    pincode: 'Pincode',
}

// Trims every field and checks it. Returns the cleaned address plus a map of
// field -> message for anything invalid (empty when the address is fine).
const validateShippingAddress = (input) => {
    const address = {}
    const errors = {}

    for (const [field, label] of Object.entries(SHIPPING_FIELDS)) {
        const value = typeof input?.[field] === 'string' ? input[field].trim() : ''
        address[field] = value

        if (!value) errors[field] = `${label} is required.`
        else if (value.length > 200) errors[field] = `${label} is too long.`
    }

    if (!errors.phone) {
        // Accept "98765 43210", "+91 98765-43210", "098765..." and store the plain 10 digits.
        const digits = address.phone.replace(/[\s-]/g, '').replace(/^(\+91|0)/, '')
        if (/^[6-9]\d{9}$/.test(digits)) address.phone = digits
        else errors.phone = 'Enter a valid 10-digit mobile number.'
    }

    if (!errors.pincode && !/^\d{6}$/.test(address.pincode)) {
        errors.pincode = 'Pincode must contain 6 digits.'
    }

    return { address, errors }
}

export const createPaymentOrder = async (req, res) => {
    try {
        const razorpay = getRazorpay()

        if (!razorpay) {
            return res.status(503).json({ success: false, message: 'Payments are not configured on the server.' })
        }

        // Only the shipping address is read from the body. Items, prices and the
        // total all come from the database — anything else the client sends
        // (e.g. a fake totalAmount) is ignored.
        const { address, errors } = validateShippingAddress(req.body.shippingAddress)

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({ success: false, message: Object.values(errors)[0], errors })
        }

        const user = await User.findById(req.user._id)
            .select('cart')
            .populate({ path: 'cart.product', select: 'name price imageUrl stock isActive' })

        if (user.cart.length === 0) {
            return res.status(400).json({ success: false, message: 'Your cart is empty.' })
        }

        // A product deleted after it was added populates as null. The cart page
        // can't show those rows (so the user can't remove them), so drop them here
        // and ask the user to review the cart.
        const missing = user.cart.filter((item) => !item.product)
        if (missing.length > 0) {
            await User.updateOne(
                { _id: req.user._id },
                { $pull: { cart: { _id: { $in: missing.map((item) => item._id) } } } }
            )
            return res.status(400).json({
                success: false,
                message: 'Some products in your cart are no longer available and were removed. Please review your cart.',
            })
        }

        // Final check against the latest product data — stock may have changed
        // since these items were added to the cart.
        for (const { product, quantity } of user.cart) {
            if (!product.isActive) {
                return res.status(400).json({ success: false, message: `${product.name} is no longer available.` })
            }
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for ${product.name}. Only ${product.stock} left.`,
                })
            }
        }

        // Snapshot what is being bought, at today's price.
        const items = user.cart.map(({ product, quantity }) => ({
            product: product._id,
            name: product.name,
            price: product.price,
            quantity,
            image: product.imageUrl,
        }))
        const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

        const order = await Order.create({
            user: req.user._id,
            items,
            shippingAddress: address,
            totalAmount,
        })

        let razorpayOrder
        try {
            razorpayOrder = await razorpay.orders.create({
                amount: Math.round(totalAmount * 100), // Razorpay wants paise
                currency: 'INR',
                receipt: order._id.toString(),
            })
        } catch (err) {
            // No Razorpay order means nothing can ever be paid against this one.
            await Order.deleteOne({ _id: order._id })
            return res.status(502).json({
                success: false,
                message: 'Could not start the payment. Please try again.',
                error: err.error?.description || err.message,
            })
        }

        order.razorpayOrderId = razorpayOrder.id
        await order.save()

        // The cart is deliberately left untouched — it's only cleared once the
        // payment has been verified.
        res.status(201).json({
            success: true,
            shopKartOrderId: order._id,
            razorpayOrderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID, // the public key id only, never the secret
        })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const verifyPayment = async (req, res) => {
    try {
        if (!getRazorpay()) {
            return res.status(503).json({ success: false, message: 'Payments are not configured on the server.' })
        }

        const { shopKartOrderId, razorpay_payment_id, razorpay_signature } = req.body

        if (typeof razorpay_payment_id !== 'string' || typeof razorpay_signature !== 'string' || !razorpay_payment_id || !razorpay_signature) {
            return res.status(400).json({ success: false, message: 'Payment details are missing' })
        }

        if (!mongoose.isValidObjectId(shopKartOrderId)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' })
        }

        const order = await Order.findOne({ _id: shopKartOrderId, user: req.user._id })

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        // Already confirmed by an earlier call for this same payment (e.g. a retried
        // request) — return it without touching stock or the cart a second time.
        if (order.paymentStatus === 'PAID') {
            if (order.razorpayPaymentId === razorpay_payment_id) {
                return res.status(200).json({ success: true, message: 'Payment already verified', order })
            }
            return res.status(409).json({ success: false, message: 'This order has already been paid' })
        }

        if (!order.razorpayOrderId) {
            return res.status(400).json({ success: false, message: 'No payment was started for this order' })
        }

        // The signature is HMAC-SHA256("<order_id>|<payment_id>") with our secret.
        // We use the Razorpay order id we stored, not the one the browser sent, so
        // a payment for some other (cheaper) order can't be passed off as this one.
        const expected = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(`${order.razorpayOrderId}|${razorpay_payment_id}`)
            .digest('hex')

        const valid =
            razorpay_signature.length === expected.length &&
            crypto.timingSafeEqual(Buffer.from(razorpay_signature), Buffer.from(expected))

        if (!valid) {
            // The order stays PENDING and the cart is left alone.
            return res.status(400).json({ success: false, message: 'Invalid payment signature' })
        }

        // The paymentStatus filter makes PENDING -> PAID happen exactly once, even if
        // two verify requests for the same payment arrive together.
        const paidOrder = await Order.findOneAndUpdate(
            { _id: order._id, paymentStatus: { $ne: 'PAID' } },
            { $set: { paymentStatus: 'PAID', status: 'PLACED', razorpayPaymentId: razorpay_payment_id } },
            { new: true }
        )

        if (!paidOrder) {
            const current = await Order.findById(order._id)
            return res.status(200).json({ success: true, message: 'Payment already verified', order: current })
        }

        // Take the purchased units out of stock. Stock was checked when the payment
        // order was created, but someone else may have bought in the meantime — the
        // customer has already paid at this point, so clamp at 0 rather than fail.
        await Promise.all(
            paidOrder.items.map((item) =>
                Product.updateOne(
                    { _id: item.product },
                    [{ $set: { stock: { $max: [0, { $subtract: ['$stock', item.quantity] }] } } }],
                    { updatePipeline: true }
                )
            )
        )

        await User.updateOne({ _id: req.user._id }, { $set: { cart: [] } })

        res.status(200).json({ success: true, message: 'Payment verified', order: paidOrder })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

// Only orders that were actually paid for. Checkout attempts that were abandoned
// or failed stay in the database as PENDING but aren't shown as orders.
export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id, paymentStatus: 'PAID' }).sort({ createdAt: -1 })

        res.status(200).json({ success: true, count: orders.length, orders })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' })
        }

        // Filtering by user as well as id means someone else's order is simply
        // "not found" — we don't even reveal that it exists.
        const order = await Order.findOne({ _id: id, user: req.user._id })

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' })
        }

        res.status(200).json({ success: true, order })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

// Bonus: development-only endpoint to move an order one step along
// PLACED -> CONFIRMED -> SHIPPED -> DELIVERED. There's no admin role in the app
// yet, so it's limited to the caller's own orders and disabled in production.
export const updateOrderStatus = async (req, res) => {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(404).json({ success: false, message: 'Not found' })
        }

        const { id } = req.params
        const { status } = req.body

        if (!mongoose.isValidObjectId(id)) {
            return res.status(400).json({ success: false, message: 'Invalid order ID' })
        }

        const index = ORDER_STATUSES.indexOf(status)

        // index 0 is PENDING_PAYMENT, and PLACED is only ever set by payment verification.
        if (index < 2) {
            return res.status(400).json({ success: false, message: 'Status must be one of: CONFIRMED, SHIPPED, DELIVERED' })
        }

        const previous = ORDER_STATUSES[index - 1]

        const order = await Order.findOneAndUpdate(
            { _id: id, user: req.user._id, paymentStatus: 'PAID', status: previous },
            { $set: { status } },
            { new: true }
        )

        if (!order) {
            const exists = await Order.exists({ _id: id, user: req.user._id })
            if (!exists) {
                return res.status(404).json({ success: false, message: 'Order not found' })
            }
            return res.status(400).json({ success: false, message: `Only a ${previous} order can be moved to ${status}` })
        }

        res.status(200).json({ success: true, message: 'Order status updated', order })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}
