import Order from '../models/Order.model.js'
import Product from '../models/Product.model.js'

export const createOrder = async (req, res) => {
    try {
        const { productId, quantity = 1, shippingAddress } = req.body

        if (!productId) {
            return res.status(400).json({ message: 'productId is required' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        const order = await Order.create({
            buyer: req.user._id,
            product: product._id,
            seller: product.seller,
            quantity,
            priceAtPurchase: product.price * quantity,
            shippingAddress,
        })

        res.status(201).json(order)
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ buyer: req.user._id })
            .sort({ createdAt: -1 })
            .populate('product', 'name imageUrl price')

        res.status(200).json(orders)
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}
