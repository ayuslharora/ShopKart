import mongoose from "mongoose"

const userScheme = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    username:{
        type:String,
        required:true,
        unique:true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    profileImage: {
        type: String
    },

    orders: [],
})

const User = mongoose.model("User",userScheme)

export default User