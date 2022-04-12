const { uploadFile } = require('./awsController')
const productModel = require('../model/productModel')


/**************************validation*************************************/


const isValid = function (value) {
    if (typeof value === undefined || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length > 0) return true
}


/**************************create product*************************************/


const createProduct = async function (req, res) {
    try {
        const data = req.body
        const files = req.files

        if (files.length == 0) { return res.status(400).send({ status: fale, message: "Please provide product's image" }) }

        const { title, description, price, style, availableSizes, installments } = data

        if (!isValid(title)) {
            return res.status(400).send({ status: false, message: "Please provide product's title" })
        }

        const alreadyTitle = await productModel.findOne({ title })
        if (alreadyTitle) {
            return res.status(400).send({ status: false, message: "Product title is already exists" })
        }

        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide product's description" })
        }


        if (!isValid(price)) {
            return res.status(400).send({ status: false, message: "Please provide product's price" })
        }

        if (!isValid(style)) {
            return res.status(400).send({ status: false, message: "Please provide product's style" })
        }

        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide the product size" })
        }

        if (!isValid(installments)) {
            return res.status(400).send({ status: false, message: "Please provide product's installmensts" })
        }


        /*************************upload image***********************************/

        
        const newProductImage = await uploadFile(files[0])

        const productData = { title, description, price, productImage: newProductImage, style, availableSizes, installments }

        const newProduct = await productModel.create(productData)

        return res.status(201).send({ status: true, data: newProduct })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ Error: error.message })
    }
}

module.exports = { createProduct }