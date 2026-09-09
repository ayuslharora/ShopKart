import mongoose from 'mongoose'
import bcrypt from 'bcrypt'
import User from '../models/Users.model.js'

export const registerUser = async (req,res)=>{
    try{
        const {name,username,email, password} = req.body

        if(!name||!username||!email||!password){
            res.status(400).send({message:"all fields are required"})
        }

        if (password.length <= 6) {
            return res.status(400).json({ message: 'Password should be greater than 6 characters' })
        }

        const userExists = await User.findOne({username})

        console.log(userExists)

        if(userExists){
            return res.status(400).json({message:"User already exists"})
        }

        const emailExists = await User.findOne({email})

        if(emailExists){
            return res.status(400).json({message:"email already used"})
        }

        const salt = await bcrypt.genSalt(10)

        const hashPassword = await bcrypt.hash(password,salt)

        const newUser = await User.create({
            name,
            username,
            email,
            password : hashPassword
        })

        res.status(201).json({ message: 'User Registered', user: newUser })

    }
    catch(err){
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}