import bcrypt from 'bcrypt'
import User from '../models/Users.model.js'
import Order from '../models/Order.model.js'
import {genToken} from '../util/genToken.js'

const RECENT_ORDERS_LIMIT = 5

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

        const userResponse = newUser.toObject()
        delete userResponse.password

        res.status(201).json({ message: 'User Registered', user: userResponse })

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


export const logout = async (req, res) => {
    try {
        res.clearCookie('token', cookieOptions)
        res.status(200).json({ message: 'Logged out' })
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const getMe = async(req,res)=>{
    res.status(200).json(req.user)
}

export const getProfileOverview = async (req, res) => {
    try {
        const userId = req.user._id

        const [orderCount, recentOrders, userWithLists] = await Promise.all([
            Order.countDocuments({ buyer: userId }),
            Order.find({ buyer: userId })
                .sort({ createdAt: -1 })
                .limit(RECENT_ORDERS_LIMIT)
                .populate('product', 'name imageUrl price'),
            User.findById(userId)
                .select('wishlist recentlyViewed')
                .populate('wishlist', 'name imageUrl price category')
                .populate('recentlyViewed.product', 'name imageUrl price category'),
        ])

        const recentlyViewed = userWithLists.recentlyViewed
            .filter((entry) => entry.product)
            .sort((a, b) => new Date(b.viewedAt) - new Date(a.viewedAt))
            .map((entry) => ({ product: entry.product, viewedAt: entry.viewedAt }))

        res.status(200).json({
            orderCount,
            recentOrders,
            recentlyViewed,
            wishlist: userWithLists.wishlist,
        })
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}

export const toggleWishlist = async (req, res) => {
    try {
        const { productId } = req.params
        const user = await User.findById(req.user._id)

        const alreadySaved = user.wishlist.some((id) => id.toString() === productId)

        if (alreadySaved) {
            user.wishlist = user.wishlist.filter((id) => id.toString() !== productId)
        } else {
            user.wishlist.push(productId)
        }

        await user.save()

        res.status(200).json({ wishlist: user.wishlist, saved: !alreadySaved })
    } catch (err) {
        res.status(500).json({ message: 'Server crashed', error: err.message })
    }
}