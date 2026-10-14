import mongoose from 'mongoose'
import Product from '../models/Product.model.js'
import User from '../models/Users.model.js'

const CART_PRODUCT_FIELDS = 'name price imageUrl stock category'

// Load the user's cart with each product populated. Price and stock always come
// from the Product collection, so the cart never shows a stale price.
const loadCart = async (userId) => {
    const user = await User.findById(userId)
        .select('cart')
        .populate({ path: 'cart.product', select: CART_PRODUCT_FIELDS })

    // A product deleted after it was added populates as null — skip it.
    return user.cart
        .filter((item) => item.product)
        .map((item) => ({ product: item.product, quantity: item.quantity }))
}

export const addToCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        if (product.stock < 1) {
            return res.status(400).json({ success: false, message: 'Product is out of stock' })
        }

        // Already in the cart: add 1, but only if that stays within stock.
        // The quantity check is part of the filter, so it can't be raced past.
        const increment = () => User.updateOne(
            { _id: req.user._id, cart: { $elemMatch: { product: product._id, quantity: { $lt: product.stock } } } },
            { $inc: { 'cart.$.quantity': 1 } }
        )

        // Not in the cart yet: push a new row — the $ne filter stops a duplicate row.
        const pushNew = () => User.updateOne(
            { _id: req.user._id, 'cart.product': { $ne: product._id } },
            { $push: { cart: { product: product._id, quantity: 1 } } }
        )

        // If the push doesn't match, another request added the row a moment ago
        // (e.g. a double click), so try the increment once more before giving up.
        const updated =
            (await increment()).matchedCount > 0 ||
            (await pushNew()).matchedCount > 0 ||
            (await increment()).matchedCount > 0

        if (!updated) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} in stock — you already have them all in your cart`,
            })
        }

        const cart = await loadCart(req.user._id)
        res.status(200).json({ success: true, message: 'Cart updated', cart })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const getCart = async (req, res) => {
    try {
        const cart = await loadCart(req.user._id)
        res.status(200).json({ success: true, cart })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const updateCartQuantity = async (req, res) => {
    try {
        const { productId } = req.params
        const { quantity } = req.body

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        if (typeof quantity !== 'number' || !Number.isInteger(quantity)) {
            return res.status(400).json({ success: false, message: 'Quantity must be a whole number' })
        }

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        if (quantity > product.stock) {
            return res.status(400).json({ success: false, message: `Only ${product.stock} in stock` })
        }

        const result = await User.updateOne(
            { _id: req.user._id, 'cart.product': product._id },
            { $set: { 'cart.$.quantity': quantity } }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Product not in cart' })
        }

        const cart = await loadCart(req.user._id)
        res.status(200).json({ success: true, message: 'Cart updated', cart })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        const result = await User.updateOne(
            { _id: req.user._id, 'cart.product': productId },
            { $pull: { cart: { product: productId } } }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Product not in cart' })
        }

        const cart = await loadCart(req.user._id)
        res.status(200).json({ success: true, message: 'Product removed from cart', cart })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}
