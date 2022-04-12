const userModel = require('../model/userModel')
const { uploadFile } = require('./awsController')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const ObjectId = require('mongoose').Types.ObjectId



/**************************validation*************************************/


const isValid = function (value) {
    if (typeof value === undefined || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length > 0) return true
}


const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16) return true
}



/**********************create user*************************************/



const createUser = async function (req, res) {
    try {
        const data = req.body
        let files = req.files;
        let address = JSON.parse(req.body.address)
        if (files.length == 0) { return res.status(400).send({ status: false, message: "Please provide user's profile picture " }) }

        const { fname, lname, email, phone, password } = data


        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide user's first name" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide user's last name" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide user's emailId" })
        }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide user's phone number" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password" })
        }

        if (address) {
            if (address.shipping) {
                if (!isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: "Please provide street name in shipping address" })
                }

                if (!isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "Please provide city name in shipping address" })
                }

                if (!isValid(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "Please provide pincode in shipping address" })
                }
            }
            if (address.billing) {
                if (!isValid(address.billing.street)) {
                    return res.status(400).send({ status: false, message: "Please provide street name in billing address" })
                }

                if (!isValid(address.billing.city)) {
                    return res.status(400).send({ status: false, message: "Please provide city name in billing address" })
                }

                if (!isValid(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: "Please provide pincode in billing address" })
                }
            }
        }


        /*************************************dupticate data***********************************/

          
        const dupliEmail = await userModel.findOne({ email })
        if (dupliEmail) { return res.status(400).send({ status: false, message: "Email already exists" }) }

        const dupliPhone = await userModel.findOne({ phone })
        if (dupliPhone) { return res.status(400).send({ status: false, message: "Phone number already exists" }) }


        /*************************************other validation***********************************/


        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide valid Email Address" });
        }

        if (!/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone)) {
            return res.status(400).send({ status: false, msg: "please provide valid phone" })
        }


        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password length must be between 8 to 15 characters" })
        }

        /*************************upload image***********************************/


        const profilePicture = await uploadFile(files[0])


        /*************************hashing password***********************************/


        const salt = 10

        const encyptedPassword = await bcrypt.hash(password, salt)

        const userData = {
            fname: fname, lname: lname, email: email, password: encyptedPassword, phone: phone, address: address, profileImage: profilePicture
        }

        const newUser = await userModel.create(userData)

        return res.status(201).send({ status: true, message: "user create successfully", data: newUser })

    } catch (error) {
        console.log(error)

        return res.status(500).send({ Error: error.message })

    }
}


/******************************login***********************************/


const loginUser = async function (req, res) {

    try {

        const data = req.body

        if (Object.keys(data) == 0) {
            return res.status(400).send({ status: false, message: "Please enter some data" })
        }

        let email = req.body.email;
        let pass = req.body.password;

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send({ status: false, msg: "Please provide valid Email Address" });
        }

        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, message: "Email is incorrect" })

        const password = user.password;

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password length must be between 8 to 15 characters" })
        }

        const passMatch = await bcrypt.compare(pass, password)
        if (!passMatch) return res.status(400).send({ status: false, message: "Password is incorrect" })


/******************************create token***********************************/

        const token = jwt.sign({

            userId: user._id,

        }, "Group26", { expiresIn: "30m" });

        res.setHeader("x-api-key", token);
        return res.status(200).send({ status: true, message: "User login successfully", data: { userId: user._id, token } })


    } catch (error) {
        console.log(error)

        return res.status(500).send({ status: false, Error: error.message })
    }
}


/*************************get details***********************************/


const getProfile = async function (req, res) {
    try {
        const userId = req.params.userId

        const getProfileData = await userModel.findOne({ _id: userId })

        if (!getProfileData) {
            return res.status(400).send({ status: false, message: "invalid userId" })
        }

        return res.status(200).send({ staus: true, data: getProfileData })

    } catch (error) {

        return res.status(500).send({ Error: error.message })
    }
}


let updateUser = async function (req, res) {
    try {
        let data = req.body
        let user_id = req.params.userId
        let address = JSON.parse(req.body.address)
        if (!ObjectId.isValid(user_id)) {
            return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
        }
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, message: "Please enter data to update" })
        }
        let validUser = await userModel.findOne({ _id: user_id })
        if (!validUser)
            return res.status(404).send({ status: false, message: "No user found" })

        const { fname, lname, email, phone, password, profileImage } = data
        if (Object.keys(data).includes('fname')) {
            if (!isValid(fname)) {
                return res.status(400).send({ status: false, message: "Please give a proper fname" })
            }
        }
        if (Object.keys(data).includes('lname')) {
            if (!isValid(lname)) {
                return res.status(400).send({ status: false, message: "Please give a proper lname" })
            }
        }
        if (Object.keys(data).includes('email')) {
            if (!isValid(email)) {
                return res.status(400).send({ status: false, message: "email is not valid" })
            }
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, msg: "Please provide valid Email Address" });
            }
            const dupliEmail = await userModel.findOne({ email })
            if (dupliEmail) { return res.status(400).send({ status: false, message: "Email already exists" }) }
        }
        if (Object.keys(data).includes('phone')) {
            if (!isValid(phone)) {
                return res.status(400).send({ status: false, message: "phone is not valid" })
            }
            let isValidPhone = (/^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(phone))
            if (!isValidPhone) {
                return res.status(400).send({ status: false, msg: "please provide valid phone" })
            }
            const dupliPhone = await userModel.findOne({ phone })
            if (dupliPhone) { return res.status(400).send({ status: false, message: "Phone number already exists" }) }
        }
        if (Object.keys(data).includes('password')) {
            if (!isValid(password)) {
                return res.status(400).send({ status: false, message: "password is not valid" })
            }
            if (!isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password length must be between 8 to 15 characters" })
            }
            const salt = 10
            await bcrypt.hash(password, salt)
        }
        if (Object.keys(data).includes('profileImage')) {
            if (files.length == 0) { return res.status(400).send({ status: false, message: "Please provide a profile image" }) }
            await uploadFile(files[0])
        }
        if (Object.keys(data).includes(address)) {
            if (Object.keys(address).includes('shipping.street')) {
                if (!isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: "street is not valid" })
                }
            }
            if (Object.keys(address).includes('shipping.city')) {
                if (!isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "city is not valid" })
                }
            }
            if (Object.keys(address).includes('shipping.pincode')) {
                if (!isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "pincode is not valid" })
                }
                //pincode validator
            }
            if (Object.keys(address).includes('billing.street')) {
                if (!isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: "street is not valid" })
                }
            }
            if (Object.keys(address).includes('billing.city')) {
                if (!isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "city is not valid" })
                }
            }
            if (Object.keys(address).includes('billing.pincode')) {
                if (!isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "pincode is not valid" })
                }
                //pincode validator
            }

        }


        let updateduser = await userModel.findOneAndUpdate(
            { _id: user_id },
            { $set: req.body },
            { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: updateduser });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}







module.exports = { createUser, loginUser, getProfile }



