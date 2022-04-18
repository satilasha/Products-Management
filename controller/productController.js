const productModel = require('../model/productModel')
const validate = require('../validator/validator')
const { uploadFile } = require('./awsController')


const createProduct = async function (req, res) {
    try {
        const data = req.body
        const files = req.files

        if (!validate.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please enter the product details" });
        }
        if (files.length == 0) {
            return res.status(400).send({ status: fale, message: "Please provide product's image" })
        }

        const { title, description, price, style, availableSizes, installments, currencyId, currencyFormat } = data

        if (!validate.isValid(title)) {
            return res.status(400).send({ status: false, message: "Please provide product's title" })
        }
        const alreadyTitle = await productModel.findOne({ title })
        if (alreadyTitle) {
            return res.status(400).send({ status: false, message: "Products title is already exists" })
        }

        if (!validate.isValid(description)) {
            return res.status(400).send({ status: false, message: "Please provide product's description" })
        }

        if (!validate.isValidNum(price)) {
            return res.status(400).send({ status: false, message: "Please provide valid product's price" })
        }
        if (Object.keys(data).includes('style')) {
            if (!validate.isValid(style)) {
                return res.status(400).send({ status: false, message: "Please provide product's style" })
            }
        }
        if (!validate.isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "please provide the product size" })
        }
        let sizeKeys = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        for (let i = 0; i < availableSizes.length; i++) {
            let sizePresent = sizeKeys.includes(availableSizes[i])
            if (!sizePresent)
                return res.status(400).send({ status: false, message: "Please give proper sizes among XS S M X L XXL XL" })
        }
        if (!validate.isValidString(currencyId)) {
            return res.status(400).send({ status: false, message: "Please provide valid product's currencyId" })
        }
        if (!validate.isValidString(currencyFormat)) {
            return res.status(400).send({ status: false, message: "Please provide valid product's currencyFormat" })
        }
        if (Object.keys(data).includes('installments')) {
            if (!validate.isValidNum(installments)) {
                return res.status(400).send({ status: false, message: "Please provide product's installments" })
            }
        }


        const newProductImage = await uploadFile(files[0])

        const productData = { title, description, price, productImage: newProductImage, style, availableSizes, installments, currencyId, currencyFormat }

        const newProduct = await productModel.create(productData)

        return res.status(201).send({ status: true, data: newProduct })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ Error: error.message })
    }
}
const getProduct = async (req, res) => {
    try {
        console.log(req.headers)
        let filterQuery = { isDeleted: false, deletedAt: null };
        let filter = req.query;
        let Sort;

        if (validate.isValidRequestBody(filter)) {
            let { name, size, priceSort, priceGreaterThan, priceLessThan } = filter;

            if (Object.keys(filter).includes('name')) {
                filterQuery.title = { $regex: `.*${name.trim()}.*` };
            }
            if (Object.keys(filter).includes('priceSort')) {
                if (priceSort == "ascending") {
                    Sort = 1;
                }
                if (priceSort == "decending") Sort = -1;
                else {
                    return res.status(400).send({ status: false, message: "Please give ascending or decending price sort" })
                }
            }

            if (Object.keys(filter).includes('size')) {
                let sizeKeys = ["S", "XS", "M", "X", "L", "XXL", "XL"]
                sizeArr = size.trim().split(' ')
                for (let i = 0; i < sizeArr.length; i++) {
                    let sizePresent = sizeKeys.includes(sizeArr[i])
                    if (!sizePresent)
                        return res.status(400).send({ status: false, message: "Please give proper sizes among XS S M X L XXL XL" })
                }
                let allSize = size.trim().split(' ')  
                console.log(allSize)
                filterQuery.availableSizes = { $in: allSize }
            }

            if (Object.keys(filter).includes('priceGreaterThan')) {
                if (!validate.isValidNum(priceGreaterThan)) {
                    return res.status(400).send({ status: false, msg: "Please give valid price" })
                }
                filterQuery.price = { $gte: priceGreaterThan };
            }
            if (Object.keys(filter).includes('priceLessThan')) {
                if (!validate.isValidNum(priceLessThan)) {
                    return res.status(400).send({ status: false, msg: "Please give valid price" })
                }
                filterQuery.price = { $lte: priceLessThan };
            }
            if(filter.hasOwnProperty("priceLessThan",'priceGreaterThan')){
                if (!validate.isValidNum(priceLessThan)) {
                    return res.status(400).send({ status: false, msg: "Please give valid price" })
                }
                if (!validate.isValidNum(priceGreaterThan)) {
                    return res.status(400).send({ status: false, msg: "Please give valid price" })
                }
                filterQuery.price = { $lte: priceLessThan, $gte: priceGreaterThan};
            }
        }
        // console.log(filterQuery)

        const product = await productModel.find(filterQuery).sort({ price: Sort });
        if (product.length == 0) {
            return res.status(400).send({ status: false, msg: "No product found" });
        }

        res.status(200).send({ status: true, data: product });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message });
    }
};


/// get Product by id ------------------------------------

const getProductbyid = async function (req, res) {

    try {
        const productId = req.params.productId

        if (!validate.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Valid productId is required" })
        }


        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) { return res.status(404).send({ status: false, message: "No data found" }) }

        return res.status(200).send({ status: true, message: "Product Data", data: product })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ message: err.message })
    }
}



const Productupdate = async function (req, res) {
    try {
        let reqBody = req.body
        let id = req.params.productId
        let files = req.files
        let updatedProductData = {}
        if (!validate.isValidObjectId(id)) {
            return res.status(400).send({ status: false, message: "Valid productId is required" })
        }

        if (!validate.isValidRequestBody(reqBody) && !files) {
            return res.status(400).send({ status: false, msg: "Please give data to update" })
        }

        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = reqBody

        const findProduct = await productModel.findOne({ _id: id, isDeleted: false })
        if (!findProduct) {
            return res.status(404).send({ status: false, msg: "product not found" })
        }

        if (Object.keys(reqBody).includes('title')) {
            if (!validate.isValid(title)) {
                return res.status(400).send({ status: false, message: 'Title is not valid' })
            }
            const alreadyTitle = await productModel.findOne({ title })
            if (alreadyTitle) {
                return res.status(400).send({ status: false, message: "Products title is already exists" })
            }
            updatedProductData.title = title
        };
        if (Object.keys(reqBody).includes('description')) {
            if (!validate.isValid(description)) {
                return res.status(400).send({ status: false, message: 'description is not valid' })
            }
            updatedProductData.description = description
        };
        if (Object.keys(reqBody).includes('price')) {
            if (!validate.isValidNum(price)) {
                return res.status(400).send({ status: false, message: 'price is not valid' })
            }
            updatedProductData.price = price
        };

        if (Object.keys(reqBody).includes('currencyId')) {
            if (!validate.isValidString(currencyId)) {
                return res.status(400).send({ statas: false, message: 'currencyId is not valid' })
            }
            updatedProductData.currencyId = currencyId
        }
        if (Object.keys(reqBody).includes('currencyFormat')) {
            if (!validate.isValidString(currencyFormat)) {
                return res.status(400).send({ statas: false, message: 'formate is not valid' })
            }
            updatedProductData.currencyFormat = currencyFormat
        }

        if (Object.keys(reqBody).includes('isFreeShipping')) {
            if (isFreeShipping != true || false) {
                return res.status(400).send({ status: false, message: 'isFreeShipping should be true or false' })
            };
            updatedProductData.isFreeShipping = isFreeShipping
        }
        if (Object.keys(reqBody).includes('style')) {
            if (!validate.isValid(style)) {
                return res.status(400).send({ status: false, message: 'style is not valid' })
            }
            updatedProductData.style = style
        };
        if (Object.keys(reqBody).includes('availableSizes')) {
            if (!validate.isValid(availableSizes)) {
                return res.status(400).send({ status: false, message: 'style is not valid' })
            }
            let sizeKeys = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            for (let i = 0; i < availableSizes.length; i++) {
                let sizePresent = sizeKeys.includes(availableSizes[i])
                if (!sizePresent)
                    return res.status(400).send({ status: false, message: "Please give proper sizes among XS S M X L XXL XL" })
            }
            updatedProductData.availableSizes = availableSizes
        };
        if (Object.keys(reqBody).includes('installments')) {
            if (!validate.isValidNum(installments)) {
                return res.status(400).send({ status: false, message: "Please provide product's installments" })
            }
            updatedProductData.installments = installments
        }
        if (files.length > 0) {
            if (Object.keys(files[0]).includes('fieldname')) {
                if (files.length == 0) {
                    return res.status(400).send({ status: false, message: "Please provide a product image" })
                }
                productPicture = await uploadFile(files[0])

                updatedProductData.productImage = productPicture
            }
        }


        let updateProduct = await productModel.findOneAndUpdate({ _id: id },
            updatedProductData, { new: true })
        res.status(200).send({ status: true, msg: 'Success', data: { updateProduct } })


    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


/****************************delete product******************************/


const deleteProductById = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!validate.isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: "Valid productId is required" })
        }

        const searchProduct = await productModel.findOne({ _id: productId })
        if (!searchProduct) {
            return res.status(404).send({ status: false, message: "product does't exists" })
        }

        if (searchProduct.isDeleted == true) {
            return res.status(400).send({ status: false, message: "product is already is deleted" })
        }


        const deleteProduct = await productModel.findOneAndUpdate({ _id: productId, isDeleted: false }, { isDeleted: true, deletedAt: new Date() }, { new: true })

        res.status(200).send({ status: true, message: "successfully deleted", data: deleteProduct })
    } catch (error) {
        console.log(error)
        return res.status(500).send({ Error: error.message })
    }
}


module.exports = { createProduct, getProduct, getProductbyid, Productupdate, deleteProductById }
