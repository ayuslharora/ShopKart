import express from "express"
import { addToCart, getCart, updateCartQuantity, removeFromCart } from '../controllers/cart.controller.js'
import { isAuthenticated } from '../middelwares/Auth.middleware.js'

const cartRoutes = express.Router()

cartRoutes.use(isAuthenticated)

cartRoutes.get('/', getCart)
cartRoutes.post('/:productId', addToCart)
cartRoutes.patch('/:productId', updateCartQuantity)
cartRoutes.delete('/:productId', removeFromCart)

export default cartRoutes
