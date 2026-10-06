import mongoose from "mongoose"

const userScheme = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true,
            minlength: [2, "Name must be at least 2 characters"],
            maxlength: [50, "Name must be under 50 characters"],
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
        profileImage: {
            type: String,
            default: "",
        },
        wishlist: {
            type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
            default: [],
        },
        recentlyViewed: {
            type: [
                {
                    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
                    viewedAt: { type: Date, default: Date.now },
                },
            ],
            default: [],
        },
    },
    { timestamps: true }
)

const User = mongoose.model("User", userScheme)

export default User
