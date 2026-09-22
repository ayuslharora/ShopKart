import express from "express"
import {registerUser,login,getMe,logout,getProfileOverview,toggleWishlist} from '../controllers/user.controller.js'
import {isAuthenticated} from '../middelwares/Auth.middleware.js'

const userRoutes = express.Router()

userRoutes.post('/register',registerUser)
userRoutes.post('/login',login)
userRoutes.get('/me',isAuthenticated,getMe)
userRoutes.post('/logout', isAuthenticated, logout)
userRoutes.get('/profile-overview', isAuthenticated, getProfileOverview)
userRoutes.post('/wishlist/:productId', isAuthenticated, toggleWishlist)


export default userRoutes