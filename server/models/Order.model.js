import mongoose from "mongoose"

export const ORDER_STATUSES = ["PENDING_PAYMENT", "PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"]

// Each item is a snapshot of the product at purchase time. `product` is kept so the
// order can link back to the product page, but name/price/image are copied in, so a
// later price change or a deleted product never rewrites order history.
const orderItemScheme = mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
        },
        image: {
            type: String,
        },
    },
    { _id: false }
)

const orderScheme = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Order must belong to a user"],
            index: true,
        },
        items: {
            type: [orderItemScheme],
            validate: [(items) => items.length > 0, "Order must have at least one item"],
        },
        shippingAddress: {
            fullName: { type: String, required: true, trim: true },
            phone: { type: String, required: true, trim: true },
            addressLine1: { type: String, required: true, trim: true },
            city: { type: String, required: true, trim: true },
            state: { type: String, required: true, trim: true },
            pincode: { type: String, required: true, trim: true },
        },
        totalAmount: {
            type: Number,
            required: true,
            min: [0, "Total cannot be negative"],
        },
        paymentStatus: {
            type: String,
            enum: ["PENDING", "PAID", "FAILED"],
            default: "PENDING",
        },
        status: {
            type: String,
            enum: ORDER_STATUSES,
            default: "PENDING_PAYMENT",
        },
        razorpayOrderId: String,
        razorpayPaymentId: String,
    },
    { timestamps: true }
)

const Order = mongoose.model("Order", orderScheme)

export default Order
