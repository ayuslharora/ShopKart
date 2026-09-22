import jwt from 'jsonwebtoken'
import User from '../models/Users.model.js'

export const isAuthenticated = async (req,res,next) => {
    try{
        const token = req.cookies.token

        if(!token){
            return res.status(401).json({ message: 'Not logged in' })
        }

        let decoded
        try{
            decoded = jwt.verify(token, process.env.jwtSec)
        }catch(err){
            return res.status(401).json({ message: 'Invalid Token', error: err.message })
        }

        const user = await User.findOne({ _id: decoded.id}).select('-password')

        if(!user){
            return res.status(401).json({ message: 'User not found' })
        }

        req.user = user

        next()

    }catch(err){
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const attachUserIfAuthenticated = async (req,res,next) => {
    try{
        const token = req.cookies.token

        if(!token){
            return next()
        }

        let decoded
        try{
            decoded = jwt.verify(token, process.env.jwtSec)
        }catch(err){
            return next()
        }

        const user = await User.findOne({ _id: decoded.id}).select('-password')

        if(user){
            req.user = user
        }

        next()

    }catch(err){
        next()
    }
}