const validate = require('../validator/validator')
const productModel = require('../model/productModel')
const cartModel = requirw('/..model/cartModel')
const userModel = require('../model/userModel')

const addProduct = async (req, res) => {
    try {
        let user_id = req.params.userId
        const data = req.body;
        if (!validate.isValidObjectId(user_id)) {
            return res.status(400).send({ status: false, msg: "Invalid userId" });
        }
        const user = await userModel.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).send({ status: false, msg: "user does not exists" });
        }

        if (!validator.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "enter data to add product to cart" });
        }
        const { userId, items } = data;
        if (!validate.isValid(userId)) {
            return res.status(400).send({ status: false, msg: "enter a user id" });
        }
        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, msg: "Invalid userId" });
        }
        // if (user_id !== req.loggedInUser) {
        //     return res.status(403).send({ satus: false, message: `Unauthorized access! Owner info doesn't match` })
        // }
        // if (user_id !== userId) {
        //     return res.status(403).send({ satus: false, message: `Unauthorized access! Owner info doesn't match` })
        // }
        if (!validate.isValid(items)) {
            return res.status(400).send({ status: false, msg: "enter a user id" });
        }
        if (!Array.isArray(items)) {
            return res.status(400).send({ status: false, msg: "items should be an array" });
        }

        let { productId, quantity } = items[0]

        if (!validate.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "enter the productId" });
        }

        if (!validate.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "enter a valid productId" });
        }
        const product = await productModel.findOne({ _id: productId });
        if (!product) {
            return res.status(404).send({ status: false, msg: "product not found" });
        }

        if (!validate.isValidNum(quantity) && quantity < 1) {
            return res.status(400).send({ status: false, msg: "enter a qunatity more than 1 " });
        }

        let totalItems = items.length;
        let totalPrice = product.price * quantity;
        
        const cartPresent = await cartModel.findOne({ userId: user_id });
        if (cartPresent) {
            
            totalItems = totalItems + 1
            totalPrice  = totalPrice + cartPresent.totalPrice;

            for(i=0;i<cartPresent.items.length;i++){
            if(cartPresent.items[i].productId == items[0].productId){

                const newProduct = await cartModel.findOneAndUpdate(
                    { userId: userId , 'items[i].productId': items[0].productId},
                    {$inc: { 'items[i].quantity': 1}, $set: { totalPrice: totalPrice, totalItems: totalItems } },
                    { new: true })

                    return res.status(201).send({ status: true, data: newProduct });}
            }

            const newProduct = await cartModel.findOneAndUpdate(
                { userId: userId },
                {$addToSet: { items: items[0]}, $set: { totalPrice: totalPrice, totalItems: totalItems } },
                { new: true });
            return res.status(201).send({ status: true, data: newProduct });
        }
        newProduct = {
            userId,
            items,
            totalPrice,
            totalItems,
          };
      
          cart = await cartModel.create(newproduct);
          res.status(201).send({ status: true, data: cart });


    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = {
    addProduct
}