const productModel = require('../model/productModel')

const getProduct = async function (req, res) {

    try {
      const productId = req.params.productId
      if (!(isValid(productId))) { return res.status(400).send({ status: false, message: "productId is required" }) }
      if (!isValidObjectId(productId)) { return res.status(400).send({ status: false, message: "Valid productId is required" }) }
  
  
      const product = await productModel.findOne({ _id: productId, isDeleted: false })
      if (!product) { return res.status(400).send({ status: false, message: "No data found" }) }
      
      return res.status(200).send({ status: true, message: "Product Data", data: product })
    }
    catch (err) {
      console.log(err)
      res.status(500).send({ message: err.message })
    }
  }
  
  module.exports.getProduct = getProduct
  