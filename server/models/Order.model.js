import mongoose from "mongoose"

const orderScheme = mongoose.Schema(
    {
        buyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Order must belong to a buyer"],
        },
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Order must reference a product"],
        },
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Seller",
            required: [true, "Order must reference a seller"],
        },
        quantity: {
            type: Number,
            required: [true, "Quantity is required"],
            min: [1, "Quantity must be at least 1"],
            default: 1,
        },
        priceAtPurchase: {
            type: Number,
            required: [true, "Price at purchase is required"],
            min: [0, "Price cannot be negative"],
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "shipped", "delivered", "cancelled"],
                message: "Status must be one of: pending, shipped, delivered, cancelled",
            },
            default: "pending",
        },
        shippingAddress: {
            street: { type: String, trim: true },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            pincode: { type: String, trim: true },
        },
    },
    { timestamps: true }
)

const Order = mongoose.model("Order", orderScheme)

export default Order
