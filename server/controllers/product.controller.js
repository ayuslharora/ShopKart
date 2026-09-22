import Product from '../models/Product.model.js'
import User from '../models/Users.model.js'
import '../models/Seller.model.js'

const RECENTLY_VIEWED_LIMIT = 10

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true }).sort({ createdAt: -1 })
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
