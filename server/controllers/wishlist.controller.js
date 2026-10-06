import mongoose from 'mongoose'
import Product from '../models/Product.model.js'
import User from '../models/Users.model.js'

const WISHLIST_FIELDS = 'name price category imageUrl stock'

export const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        // The filter only matches if the product isn't saved yet, so the check and
        // the write happen in one step and two quick clicks can't add a duplicate.
        // (matchedCount, not modifiedCount: timestamps makes every update "modify" updatedAt.)
        const result = await User.updateOne(
            { _id: req.user._id, wishlist: { $ne: product._id } },
            { $push: { wishlist: product._id } }
        )

        if (result.matchedCount === 0) {
            return res.status(409).json({ success: false, message: 'Product already in wishlist' })
        }

        res.status(201).json({ success: true, message: 'Product added to wishlist' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const getWishlist = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('wishlist')
            .populate({ path: 'wishlist', select: WISHLIST_FIELDS })

        // A product deleted after it was saved populates as null — skip it.
        const wishlist = user.wishlist.filter((product) => product)

        res.status(200).json({ success: true, count: wishlist.length, wishlist })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        const result = await User.updateOne(
            { _id: req.user._id, wishlist: productId },
            { $pull: { wishlist: productId } }
        )

        if (result.matchedCount === 0) {
            return res.status(404).json({ success: false, message: 'Product not in wishlist' })
        }

        res.status(200).json({ success: true, message: 'Product removed from wishlist' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params

        if (!mongoose.isValidObjectId(productId)) {
            return res.status(400).json({ success: false, message: 'Invalid product ID' })
        }

        const removed = await User.updateOne(
            { _id: req.user._id, wishlist: productId },
            { $pull: { wishlist: productId } }
        )

        if (removed.matchedCount > 0) {
            return res.status(200).json({ success: true, saved: false, message: 'Product removed from wishlist' })
        }

        const product = await Product.findById(productId)

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' })
        }

        await User.updateOne(
            { _id: req.user._id, wishlist: { $ne: product._id } },
            { $push: { wishlist: product._id } }
        )

        res.status(200).json({ success: true, saved: true, message: 'Product added to wishlist' })
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server crashed', error: err.message })
    }
}
