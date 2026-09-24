import express from "express"
import { getProducts, getProductById, createProduct } from '../controllers/product.controller.js'
import { attachUserIfAuthenticated } from '../middelwares/Auth.middleware.js'

const productRoutes = express.Router()

productRoutes.post('/', createProduct)
productRoutes.get('/', getProducts)
productRoutes.get('/:id', attachUserIfAuthenticated, getProductById)

export default productRoutes
