import express from "express"
import {registerUser,login,getMe} from '../controllers/user.controller.js'
import {isAuthenticated} from '../middelwares/Auth.middleware.js'

const userRoutes = express.Router()

userRoutes.post('/register',registerUser)
userRoutes.post('/login',login)
userRoutes.get('/me',isAuthenticated,getMe)


export default userRoutes