const orderModel = require('../model/orderModel')
const validate = require('../validator/validator')

/*******create order************/


const createOrder = async function (req, res) {
    try {
        let reqbody = req.body

        // const jwtUserId = req.userId

        const user_id  = req.params.userId

        // if (!(user_id === jwtUserId)) {
        //     return res.status(400).send({ status: false, msg: "unauthorized access" })
        // }

        if(!validate.isValidObjectId(user_id )){
            return res.status(400).send({status: false, message: "Valid userId is required"})
        }
        if (!validate.isValidRequestBody(reqbody)) {
            return res.status(400).send({ status: false, message: "Please enter the order details" })
        }

        const { userId, items, totalPrice, totalItems, totalQuantity } = reqbody

        if (!validate.isValid(userId)) {
            return res.status(400).send({ status: false, message: "Please enter user Id" })
        }

        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
        }

        if (!validate.isValid(items)) {
            return res.status(400).send({ status: false, message: "Please enter item" })
        }

        if (!Array.isArray(items)) {
            return res.status(400).send({ status: false, message: "items should be an array" })
        }

        let { productId, quantity } = items[0]

        if (!validate.isValid(productId)) {
            return res.status(400).send({ status: false, msg: "enter the productId" });
        }
    
        if (!validate.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, msg: "enter a valid productId" });
        }

        if (!validate.isValidNum(quantity) && quantity < 1) {
            return res.status(400).send({ status: false, msg: "enter a qunatity more than 1 " });
        }

        if (!validate.isValid(totalPrice)) {
            return res.status(400).send({ status: false, message: "Please enter total price" })
        }

        if (!validate.isValidNum(totalPrice)) {
            return res.status(400).send({ status: false, message: "Please enter valid total price" })
        }

        if (!validate.isValid(totalItems)) {
            return res.status(400).send({ status: false, message: "Please enter total items" })
        }

        if (!validate.isValidNum(totalItems)) {
            return res.status(400).send({ status: false, message: "Please enter valid total items" })
        }

        if (!validate.isValid(totalQuantity)) {
            return res.status(400).send({ status: false, message: "Please enter total quantity" })
        }

        if (!validate.isValidNum(totalQuantity)) {
            return res.status(400).send({ status: false, message: "Please enter valid total quantity" })
        }

        const crtOrder = await orderModel.create(reqbody)
        return res.status(201).send({ status: true, message: "successfully create order", data: crtOrder })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ Error: error.message })
    }
}


/*******update order************/


const updateOrder = async function(req, res){
    try {
        let reqbody = req.body

        const userId = req.params.userId

        const {orderId} = reqbody

        if(!validate.isValidRequestBody(reqbody)){
            return res.status(400).send({status: false, message: "Please enter cart details"})
        }

        if(!validate.isValid(orderId)){
            return res.status(400).send({status: false, message: "Please enter order Id"})
        }

        if(!validate.isValidObjectId(orderId)){
            return res.status(400).send({status: false, message: "Please enter valid order Id"})
        }

        const checkOrder = await orderModel.findOne({_id:orderId })
        if(!checkOrder){
        return res.status(400).send({status: false, message: "Order Id not found"})
        }

        if(checkOrder.cancellable!=true){
            return res.status(400).send({status: false, message: "Can't cancel the order"})
        }

        if(checkOrder.userId!=userId){
            return res.status(400).send({status: false, message: "User Id can't match with the order Id"})
        }

        const updtOrder = await orderModel.findOneAndUpdate({_id:orderId}, {status: "cancelled"},{new: true} )
        res.status(200).send({ status: true, msg: 'sucesfully updated', data: updtOrder })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ Error: error.message })
    }
}


module.exports = { createOrder, updateOrder }