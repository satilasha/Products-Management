const express = require('express')
const router = express.Router()

const userController = require('../controller/userController')

const middleware = require('../middleware/auth')
const userModel = require('../model/userModel')

router.post('/register', userController.createUser)

router.post('/login', userController.loginUser)

router.get('/user/:userId/profile', middleware.authentication, userController.getProfile )

router.put('/user/:userId/profile', middleware.authentication, userController.updateUser )

module.exports = router










