import express from "express"
import { createOrder, getMyOrders } from '../controllers/order.controller.js'
import { isAuthenticated } from '../middelwares/Auth.middleware.js'

const orderRoutes = express.Router()

orderRoutes.post('/', isAuthenticated, createOrder)
orderRoutes.get('/me', isAuthenticated, getMyOrders)

export default orderRoutes
