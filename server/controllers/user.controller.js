import bcrypt from 'bcrypt'
import User from '../models/Users.model.js'
import {genToken} from '../util/genToken.js'

const cookieOptions = {
    //what does this means
    httpOnly : true
}


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

        const token = genToken(newUser._id)

        // console.log(token);

        res.cookie('token',token,cookieOptions)

        res.status(201).json({ message: 'User Registered', user: newUser })

    }
    catch(err){
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const login = async (req,res)=>{
    try{
        const {email,password} = req.body

        if(!email||!password){
            return res.status(401).send({message:'Incomplete field'})
        }

        const userExist = await User.findOne({email})

        if(!userExist){
            return res.status(404).send({message:'Username not found'})
        }

        const validPassword = await bcrypt.compare(password,userExist.password)

        if(!validPassword){
            return res.status(401).send({message:'Incorrect password'})
        }

        const token = genToken(userExist._id)

        res.cookie('token',token,cookieOptions)

        res.status(200).json({ message: 'User Logged In' })

    }catch(err){
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const getMe = async(req,res)=>{
    const AuthUser = req.user 
    res.status(200).json({AuthUser})
}