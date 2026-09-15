import mongoose from "mongoose"

const sellerScheme = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name must be under 50 characters"],
        },
        shopName: {
            type: String,
            required: [true, "Shop name is required"],
            trim: true,
            minlength: [2, "Shop name must be at least 2 characters"],
            maxlength: [60, "Shop name must be under 60 characters"],
        },
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            lowercase: true,
            minlength: [3, "Username must be at least 3 characters"],
            maxlength: [20, "Username must be under 20 characters"],
            match: [/^[a-z0-9._]+$/, "Username can only contain lowercase letters, numbers, dots and underscores"],
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Enter a valid email address"],
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [7, "Password must be greater than 6 characters"],
        },
        phone: {
            type: String,
            match: [/^[0-9]{10}$/, "Enter a valid 10-digit phone number"],
        },
        profileImage: {
            type: String,
            default: "",
        },
        address: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
        },
        products: {
            type: [mongoose.Schema.Types.ObjectId],
            ref: "Product",
            default: [],
        },
        isVerified: {
            type: Boolean,
            default: false,
        },
        rating: {
            type: Number,
            default: 0,
            min: 0,
            max: 5,
        },
    },
    { timestamps: true }
)

const Seller = mongoose.model("Seller", sellerScheme)

export default Seller
