const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartSchema = new mongoose.model({
    userId: {
        type: ObjectId,
        ref: 'User',
        required: true
    },

    items: [{
        productId: {
            type: ObjectId,
            ref: 'Product',
            requierd: true
        },
        quantity: {
            type: Number,
            requierd: true,
            min: 1
        }
    }],

    totalprice: {
        type: Number,
        required: true,
        comment: "Holds total price of all the items in the cart"
    },

    totalItems: {
        type: Number,
        required: true,
        comment: "Holds total number of items in the cart"
    }
}, {timestamps: true})


module.exports = mongoose.model('Cart', cartSchema)
