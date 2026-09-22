import express from "express"
import { getProducts, getProductById } from '../controllers/product.controller.js'
import { attachUserIfAuthenticated } from '../middelwares/Auth.middleware.js'

const productRoutes = express.Router()

productRoutes.get('/', getProducts)
productRoutes.get('/:id', attachUserIfAuthenticated, getProductById)

export default productRoutes
