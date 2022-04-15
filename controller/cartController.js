const validate = require('../validator/validator')
const productModel = require('../model/productModel')
const cartModel = require('../model/cartModel')
const userModel = require('../model/userModel')

const addProduct = async (req, res) => {
    // try {
    let user_id = req.params.userId
    const data = req.body;
    if (!validate.isValidObjectId(user_id)) {
        return res.status(400).send({ status: false, msg: "Invalid userId" });
    }
    const user = await userModel.findOne({ _id: user_id });
    if (!user) {
        return res.status(404).send({ status: false, msg: "user does not exists" });
    }

    if (!validate.isValidRequestBody(data)) {
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
    let totalPrice = quantity * product.price;
    console.log(totalPrice)

    const cartPresent = await cartModel.findOne({ userId: user_id });
    if (cartPresent) {

        totalItems = cartPresent.totalItems + 1
        totalPrice = totalPrice + cartPresent.totalPrice;

        for (i = 0; i < cartPresent.items.length; i++) {
            if (cartPresent.items[i].productId == items[0].productId) {
                // let ss = items[i]
                const newProduct = await cartModel.findOneAndUpdate(
                    { userId: userId, items: { $elemMatch: { productId: items[0].productId } } },
                    { $inc: { "items.$.quantity": 1 }, $set: { totalPrice: totalPrice, totalItems: totalItems } },
                    { new: true }
                )

                return res.status(201).send({ status: true, data: newProduct });
            }
        }
        console.log(items[0])
        const newProduct = await cartModel.findOneAndUpdate(
            { userId: userId },
            { $push: { items: items[0] }, $set: { totalPrice: totalPrice, totalItems: totalItems } },
            { new: true });
        return res.status(201).send({ status: true, data: newProduct });

    }
    console.log(items[0])
    newProduct = {
        userId,
        items,
        totalPrice,
        totalItems,
    };

    cart = await cartModel.create(newProduct);
    res.status(201).send({ status: true, data: cart });


    // } catch (error) {
    //     res.status(500).send({ status: false, message: error.message })
    // }
}

const updateCart = async function (req, res) {
    // try {
        const userId = req.params.userId
        const reqBody = req.body

        const { cartId, productId, removeProduct } = reqBody


        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please provide valid userId" })
        }

        if (!validate.isValid(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide cartId" })
        }
        if (!validate.isValidObjectId(cartId)) {
            return res.status(400).send({ status: false, message: "Please provide valid cartId" })
        }

        if (!validate.isValid(productId)) {
            return res.status(400).send({ status: fale, message: "Please provide productId" })
        }
        if (!validate.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Please provide valid productId" })
        }


        const user = await userModel.findOne({ _id: userId })
        if (!user) {
            return res.status(400).send({ status: false, message: "userId does't exit" })
        }

        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) {
            return res.status(400).send({ status: false, message: "ProductId  does't exit" })
        }

        const cartPresent = await cartModel.findOne({ userId: userId, _id: cartId })
        if (!cartPresent) {
            return res.status(400).send({ status: false, message: "cartId does't exit" })
        }
        if (!validate.isValid(removeProduct)) {
            return res.status(400).send({ status: false, message: "Please enter removeProduct" })
            
        }
        if(!(removeProduct ==0 || removeProduct ==1) ){
            return res.status(400).send({ status: false, message: "Please enter removeProduct with value 0 or 1" })
        }

        if(removeProduct == 1){
            return res.send({msg :"1"})

           
            let totalPrice =  product.price;
                     
                let totalItems = cartPresent.totalItems - 1
                totalPrice =  cartPresent.totalPrice - totalPrice ;
        
                for (i = 0; i < cartPresent.items.length; i++) {
                    if (cartPresent.items[i].productId == productId) {
                        if(cartPresent.items[i].quantity == 1){
                            const newProduct = await cartModel.findOneAndUpdate(
                                { userId: userId, items: { $elemMatch: { productId: productId } } },
                                { $pull: { items:{productId:productId} }, $set: { totalPrice: totalPrice, totalItems: totalItems } },
                                { new: true }
                            )
                            return res.status(201).send({ status: true, data: newProduct });
                        }

                        // let ss = items[i]
                        const newProduct = await cartModel.findOneAndUpdate(
                            { userId: userId, items: { $elemMatch: { productId: productId } } },
                            { $inc: { "items.$.quantity": -1 }, $set: { totalPrice: totalPrice, totalItems: totalItems } },
                            { new: true }
                        )
        
                        return res.status(201).send({ status: true, data: newProduct });
                    }
                }
               
        
            }else if(removeProduct==0){
                // return res.send('cart')
                return res.send({msg:"0"})

                
                     
                for (i = 0; i < cartPresent.items.length; i++) {
                   
                    if (cartPresent.items[i].productId == productId) {
//                         let totalPrice =  cartPresent.items[i].quantity * product.price;
//                         console.log(cartPresent.items[i].quantity)
//                         // console.log(totalPrice)
//                         let b = parseInt(cartPresent.totalItems) - parseInt(cartPresent.items[i].quantity)
//                         console.log(b)
//                        let a =  cartPresent.totalPrice - totalPrice 
// console.log(a )
                        // if(cartPresent.items[i].quantity == 1){
                            const newProduct = await cartModel.findOneAndUpdate(
                                { userId: userId, items: { $elemMatch: { productId: productId } } },
                                { $pull: { items:{productId:productId}, $dc: { totalPrice: 1, totalItems: 1 }} },
                                { new: true }
                            )
                            return res.status(201).send({ status: true, data: newProduct });
                        }else{
                            return res.send({status:false, msg:"product does not exists in cart"})
                        }
                    // }
                }
            }
        


    // } catch (error) {

    //     return res.status(500).send({ status: false, msg: error.message })
    // }
}


const getCartById = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
        }
        const checkuser = await userModel.findOne({ _id: userId })
        if (!checkuser) {
            return res.status(400).send({ status: false, message: " user does't exist" })
        }
        const getCart = await cartModel.findOne({ userId: userId })
        if (!getCart) {
            return res.status(400).send({ status: false, message: "User Id does't exist" })
        }

        res.status(200).send({ status: false, message: "successfull", data: getCart })
    } catch (error) {

        return res.status(500).send({ status: false, msg: error.message })
    }
}


const deletedCart = async function (req, res) {
    try {
        const userId = req.params.userId

        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
        }
        const checkuser = await userModel.findOne({ _id: userId })
        if (!checkuser) {
            return res.status(400).send({ status: false, message: " user does't exist" })
        }

        const checkCart = await cartModel.findOne({ userId: userId })
        if (!checkCart) {
            return res.status(400).send({ status: false, message: "cart does't exist" })
        }

        const deleteCart = await cartModel.findOneAndUpdate({ userId: userId },
            { $set:{ items: [], totalPrice: 0, totalItems: 0 }}, 
             { new: true })

        res.status(200).send({ status: true, message: "successfully cart deleted", data: deleteCart })
    } catch (error) {

        return res.status(500).send({ status: false, msg: error.message })
    }
}


module.exports = {
    addProduct,
    updateCart,
    getCartById,
    deletedCart
}