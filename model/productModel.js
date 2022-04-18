const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    description: {
        type: String,
        required: true,
        trim: true
    },

    price: {
        type: Number,
        required: true,
        trim: true
    },

    currencyId: {
        type: String,
        required: true,
        trim: true
        //default: "INR"
    },

    currencyFormat: {
        type: String,
        required: true,
        trim: true
        // default: "₹"
    },

    isFreeShipping: {
        type: Boolean,
        default: false,
        trim: true
    },

    productImage: {
        type: String,
    },

    style: {
        type: String,
        trim: true
    },

    availableSizes: {
        type: [],
        // enum: ["S", "XS", "M", "X", "L", "XXL", "XL"],
        required: true
    },

    installments: {
        type: Number,
        trim: true
    },

    deletedAt: {
        type: Date,
        default: ""
    },

    isDeleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })


module.exports = mongoose.model('Product', productSchema)