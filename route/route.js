const express = require('express')
const router = express.Router()

const userController = require('../controller/userController')
const productController = require('../controller/productController')


const middleware = require('../middleware/auth')


/******************************User**************************/

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.get('/user/:userId/profile', middleware.authentication, userController.getProfile)

router.post('/products/:productId', productController.Productupdate)

router.put('/user/:userId/profile', middleware.authentication, userController.updateUser)
/**************************Product*************************/

router.post('/products', productController.createProduct)

router.delete('/products/:productId', productController.deleteProductById)

module.exports = router










