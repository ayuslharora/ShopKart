import express from "express"
import mongoose from "mongoose"
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import productRoutes from './routes/product.route.js'
import orderRoutes from './routes/order.route.js'
import wishlistRoutes from './routes/wishlist.route.js'
import cartRoutes from './routes/cart.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express();

dotenv.config();

const PORT = process.env.PORT || 8000

mongoose.connect(process.env.DBUrl).then(() => {
    console.log("DB Connected");
}).catch((err) => {
    console.log(err);
})

app.use(cors(
    {
        // any localhost port (Vite picks 5173, 5174, ... depending on what's free),
        // plus the deployed frontend when CLIENT_URL is set
        origin: [/^http:\/\/localhost:\d+$/, process.env.CLIENT_URL].filter(Boolean),
        credentials: true,
    }
))
app.use(express.json())
app.use(cookieParser())


app.use('/users', userRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)
app.use('/wishlist', wishlistRoutes)
app.use('/cart', cartRoutes)


app.get('/', (req, res) => {
    res.send('Sever On Hellllooooo...')
})


app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})
