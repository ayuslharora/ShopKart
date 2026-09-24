import Product from '../models/Product.model.js'
import User from '../models/Users.model.js'
import '../models/Seller.model.js'

const RECENTLY_VIEWED_LIMIT = 10

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

export const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock, seller } = req.body
        const imageUrl = req.body.imageUrl || req.body.image

        if (!name || !description || !category || !imageUrl) {
            return res.status(400).json({ message: 'name, description, category and image are required' })
        }

        if (price === undefined || price <= 0) {
            return res.status(400).json({ message: 'price must be greater than 0' })
        }

        if (stock === undefined || stock < 0) {
            return res.status(400).json({ message: 'stock cannot be negative' })
        }

        const product = await Product.create({ name, description, price, category, imageUrl, stock, seller })

        res.status(201).json(product)
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const getProducts = async (req, res) => {
    try {
        const { search, category } = req.query
        const filter = { isActive: true }

        if (search) {
            filter.name = { $regex: escapeRegex(search), $options: 'i' }
        }

        if (category) {
            filter.category = { $regex: `^${escapeRegex(category)}$`, $options: 'i' }
        }

        const products = await Product.find(filter).sort({ createdAt: -1 })
        res.status(200).json(products)
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('seller', 'shopName username rating')

        if (!product) {
            return res.status(404).json({ message: 'Product not found' })
        }

        if (req.user) {
            const productId = product._id

            await User.findByIdAndUpdate(req.user._id, {
                $pull: { recentlyViewed: { product: productId } },
            })

            await User.findByIdAndUpdate(req.user._id, {
                $push: {
                    recentlyViewed: {
                        $each: [{ product: productId, viewedAt: new Date() }],
                        $position: 0,
                        $slice: RECENTLY_VIEWED_LIMIT,
                    },
                },
            })
        }

        res.status(200).json(product)
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}
