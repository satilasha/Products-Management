const { uploadFile } = require('./awsController')
const productModel = require('../model/productModel')

const isValid = function (value) {
    if (typeof value === undefined || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length > 0) return true
}

const createProduct = async function(req, res){
    try {
        const data = req.body
        const files = req.files

        if(files.length==0){return res.status(400).send({status:fale, message: "Please provide product's image"})}

        const {title, description, price, style, availableSizes, installments} = data

        if(!isValid(title)){
            return res.status(400).send({status:false, message:"Please provide product's title"})
        }

        const alreadyTitle = await productModel.findOne({title})
        if(alreadyTitle){
            return res.status(400).send({status:false, message:"Products title is already exists"})
        }
        
        if(!isValid(description)){
            return res.status(400).send({status:false, message:"Please provide product's description"})
        }

        
        if(!isValid(price)){
            return res.status(400).send({status:false, message:"Please provide product's price"})
        }

        if(!isValid(style)){
            return res.status(400).send({status:false, message:"Please provide product's style"})
        }

        if(!isValid(availableSizes)){
            return res.status(400).send({status:false, message:"please provide the product size"})
        }

        if(!isValid(installments)){
            return res.status(400).send({status:false, message:"Please provide product's installments"})
        }


        const newProductImage = await uploadFile(files[0])

        const productData = {title, description, price,productImage:newProductImage, style, availableSizes, installments }

        const newProduct = await productModel.create(productData)

        return res.status(201).send({status:true, data:newProduct})

    } catch (error) {
       console.log(error)
       return res.status(500).send({Error:error.message})
    }
}

/// get Product by id ------------------------------------

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
  


/****************************delete product******************************/


const deleteProductById = async function (req, res){
    try {
        const productId = req.params.productId

        const searchProduct = await productModel.findOne({_id:productId, isDeleted:false})

        if(!searchProduct){
            return res.status(400).send({status:false, message:"product does't exists"})
        }

        const deleteProduct = await productModel.findOneAndUpdate({_id:productId, isDeleted: false}, {isDeleted: true, deletedAt:new Date()}, {new: true})

        res.status(200).send({status:true, message:"successfully deleted", data: deleteProduct})
    } catch (error) {
        console.log(error)
        return res.status(500).send({Error:error.message})
    }
}


module.exports = {createProduct, deleteProductById}