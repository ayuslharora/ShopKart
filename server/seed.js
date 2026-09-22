import mongoose from "mongoose"
import dotenv from 'dotenv'
import bcrypt from 'bcrypt'
import Seller from './models/Seller.model.js'
import Product from './models/Product.model.js'

dotenv.config()

const seed = async () => {
    await mongoose.connect(process.env.DBUrl)
    console.log('DB connected')

    let seller = await Seller.findOne({ username: 'stallseed' })

    if (!seller) {
        const hashPassword = await bcrypt.hash('seedpassword', 10)
        seller = await Seller.create({
            name: 'Seed Seller',
            shopName: 'ShopKart Originals',
            username: 'stallseed',
            email: 'seed@shopkart.test',
            password: hashPassword,
            isVerified: true,
        })
        console.log('Created seed seller')
    }

    await Product.deleteMany({ seller: seller._id })

    const createdProductIds = []

    const addProduct = async (name, description, price, category, stock, imageUrl) => {
        const product = await Product.create({ name, description, price, category, stock, imageUrl, seller: seller._id })
        createdProductIds.push(product._id)
        console.log(`Added product: ${product.name} — ₹${product.price}`)
    }

    await addProduct(
        'Woven market tote',
        'Hand-woven jute tote for everyday errands.',
        799,
        'Home & living',
        40,
        'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600'
    )

    await addProduct(
        'Terracotta spice set',
        'Set of 4 hand-glazed terracotta spice jars.',
        549,
        'Groceries',
        25,
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600'
    )

    await addProduct(
        'Recycled cotton throw',
        'Soft woven throw made from recycled cotton.',
        1299,
        'Home & living',
        15,
        'https://images.unsplash.com/photo-1600369672433-5451762210f8?w=600'
    )

    await addProduct(
        'Everyday canvas sneakers',
        'Lightweight canvas sneakers for daily wear.',
        1899,
        'Fashion',
        30,
        'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600'
    )

    await addProduct(
        'Cold-press coffee kit',
        'At-home cold brew kit with reusable filter.',
        899,
        'Groceries',
        20,
        'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'
    )

    await addProduct(
        'Desk lamp, brass finish',
        'Adjustable desk lamp with a brass finish.',
        1499,
        'Home & living',
        18,
        'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600'
    )

    await addProduct(
        'Linen table runner',
        'Pure linen table runner, natural dye.',
        649,
        'Home & living',
        22,
        'https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600'
    )

    await addProduct(
        'Wireless earbuds',
        'Compact wireless earbuds with 20hr battery.',
        2399,
        'Electronics',
        12,
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600'
    )

    seller.products = createdProductIds
    await seller.save()

    console.log(`Seeded ${createdProductIds.length} products`)

    await mongoose.disconnect()
    process.exit(0)
}

seed().catch((err) => {
    console.error(err)
    process.exit(1)
})
