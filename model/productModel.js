const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },

    description: {
        type: String,
        required: true
    },

    price: {
        type: Number,
        required: true
    },

    currencyId: {
        type: String,
        required: true
    },

    currencyFormate: {
        type: String,
        required: true
    },

    isFreeShipping: {
        type: Boolean,
        default: false
    },

    productImage: {
        type: String, 
        required: true
    },

    style: String,

    availableSizes: {
        type: String,
        enum:["S", "XS","M","X", "L","XXL", "XL"]
    },

    installments: Number,

    deletedAt:{
        type: Date
    },

    isDeleted: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('Product', productSchema)