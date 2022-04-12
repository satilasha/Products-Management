const productModel = require("../model/productModel")

const Productupdate = async function (req, res) {
    try {
        let reqBody = req.body
        let id = req.params.productId
        if (Object.keys(reqBody).length == 0) {
            return res.status(400).send({ status: false, msg: "No data found" })
        }


        const { title, description, price, isFreeShipping, style, availableSizes, installments } = reqBody

        const findProduct = await productModel.findOne({ _id: id, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, msg: "product id does not exists" })
        }

        const ProductData = {
            title: title, description: description, price: price, currencyId: "₹", currencyFormat: "INR",
            isFreeShipping: isFreeShipping, productImage: uploadedFileURL,
            style: style, availableSizes: availableSizes, installments: installments
        }
        let updateProduct = await productModel.findOneAndUpdate({ _id: id },
            ProductData, { new: true })
        res.status(200).send({ status: true, msg: 'Success', data: { updateProduct } })


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
module.exports.Productupdate = Productupdate