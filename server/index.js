import express from "express"
import mongoose from "mongoose"
import dotenv from 'dotenv'
import userRoutes from './routes/user.route.js'
import productRoutes from './routes/product.route.js'
import orderRoutes from './routes/order.route.js'
import cookieParser from "cookie-parser"
import cors from 'cors'

const app = express();

const PORT = 8000

dotenv.config();

mongoose.connect(process.env.DBUrl).then(() => {
    console.log("DB Connected");
}).catch((err) => {
    console.log(err);
})

app.use(cors(
    {
        origin: "http://localhost:5174",
        credentials: true,
    }
))
app.use(express.json())
app.use(cookieParser())


app.use('/users', userRoutes)
app.use('/products', productRoutes)
app.use('/orders', orderRoutes)


app.get('/', (req, res) => {
    res.send('Sever On Hellllooooo...')
})


app.listen(PORT, () => {
    console.log(`Server running on PORT ${PORT}`);
})
