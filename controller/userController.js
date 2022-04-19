const userModel = require('../model/userModel')
const { uploadFile } = require('./awsController')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const validate = require('../validator/validator')

/**********************create user*************************************/



const createUser = async function (req, res) {
    try {
        const data = req.body
        let files = req.files;

        if (!validate.isValidRequestBody(data)) {
            return res.status(400).send({ status: false, msg: "please enter the user details" });
        }
        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "Please provide user's profile picture " })
        }

        const { fname, lname, email, phone, password, address } = data


        if (!validate.isValid(fname)) {
            return res.status(400).send({ status: false, message: "Please provide user's first name" })
        }

        if (!validate.isValid(lname)) {
            return res.status(400).send({ status: false, message: "Please provide user's last name" })
        }

        if (!validate.isValid(email)) {
            return res.status(400).send({ status: false, message: "Please provide user's emailId" })
        }
        if (!validate.isValidEmail(email.trim())) {
            res.status(400).send({ status: false, message: `Invalid email` })
            return
        }
        const isEmailAlreadyUsed = await userModel.findOne({ email });
        if (isEmailAlreadyUsed) {
            res.status(400).send({ status: false, message: `${email}  is already registered` })
            return
        }

        if (!validate.isValid(phone)) {
            return res.status(400).send({ status: false, message: "Please provide user's phone number" })
        }
        if (!validate.isValidPhone(phone)) {
            res.status(400).send({ status: false, message: 'Enter a phone number without 0 or +91' })
            return
        }
        const isPhoneAlreadyUsed = await userModel.findOne({ phone: phone });
        if (isPhoneAlreadyUsed) {
            res.status(400).send({ status: false, message: `Phone number is already registered` })
            return
        }
        if (!validate.isValid(password)) {
            return res.status(400).send({ status: false, message: "Please provide password" })
        }
        if (!validate.isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password should be of 8 to 15 characters" })
        }
        if (!validate.isValid(address)) {
            return res.status(400).send({ status: false, message: "Please provide address" })
        }
        if (!validate.isValid(address.shipping)) {
            return res.status(400).send({ status: false, message: "Please provide address" })
        }
        if (!validate.isValid(address.billing)) {
            return res.status(400).send({ status: false, message: "Please provide address" })
        }

        if (!validate.isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, message: "Please provide street name in shipping address" })
        }

        if (!validate.isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, message: "Please provide city name in shipping address" })
        }

        if (!validate.isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide pincode in shipping address" })
        }
        if (!validate.isValidPincode(address.shipping.pincode)) {
            res.status(400).send({ status: false, message: `Pincode is not valid` })
            return
        }


        if (!validate.isValid(address.billing.street)) {
            return res.status(400).send({ status: false, message: "Please provide street name in billing address" })
        }

        if (!validate.isValid(address.billing.city)) {
            return res.status(400).send({ status: false, message: "Please provide city name in billing address" })
        }

        if (!validate.isValid(address.billing.pincode)) {
            return res.status(400).send({ status: false, message: "Please provide pincode in billing address" })
        }
        if (!validate.isValidPincode(address.billing.pincode)) {
            res.status(400).send({ status: false, message: `Pincode is not valid` })
            return
        }


        /*************************upload image***********************************/


        const profilePicture = await uploadFile(files[0])
        if (!profilePicture) {
            return res.status(400).send({ status: false, msg: "profileImage not uploaded in the files" });

        }


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

        let email = req.body.email;
        let pass = req.body.password;

        if (!email || !pass)
            return res.status(400).send({ status: false, message: "email or the password is not entered" });

        if (!validate.isValidEmail(email)) {
            return res.status(400).send({ status: false, message: `Invalid email` })
        }

        if (!validate.isValidPassword(pass)) {
            return res.status(400).send({ status: false, message: "Password should be of 8 to 15 characters" })
        }

        const user = await userModel.findOne({ email: email })
        if (!user) return res.status(400).send({ status: false, message: "Email is incorrect" })

        const password = user.password;
        const passMatch = await bcrypt.compare(pass, password)
        if (!passMatch) return res.status(400).send({ status: false, message: "Password is incorrect" })


        /******************************create token***********************************/

        const token = jwt.sign({

            userId: user._id,

        }, "Group26", { expiresIn: "1800000s" });

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

        if (!validate.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
        }

        const getProfileData = await userModel.findOne({ _id: userId })
        if (!getProfileData) {
            return res.status(400).send({ status: false, message: "invalid userId" })
        }

        return res.status(200).send({ staus: true, message: "successfull", data: getProfileData })

    } catch (error) {

        return res.status(500).send({ Error: error.message })
    }
}


let updateUser = async function (req, res) {
    try {
        let data = req.body
        let user_id = req.params.userId
        let updateUserData = {}
        let files = req.files

        if (!validate.isValidRequestBody(data) && !files) {
            return res.status(400).send({ status: false, msg: "Please give data to update" })
        }

        if (!validate.isValidObjectId(user_id)) {
            return res.status(400).send({ status: false, message: "Please enter a valid user Id" })
        }
        let validUser = await userModel.findOne({ _id: user_id })
        if (!validUser)
            return res.status(404).send({ status: false, message: "No user found" })
        if (user_id !== req.loggedInUser) {
            return res.status(403).send({ satus: false, message: `Unauthorized access! Owner info doesn't match` })
        }
        let { fname, lname, email, phone, password, profileImage, address } = data

        if (Object.keys(data).includes('fname')) {
            if (!validate.isValid(fname)) {
                return res.status(400).send({ status: false, message: "Please give a proper fname" })
            }
            updateUserData.fname = fname
        }
        if (Object.keys(data).includes('lname')) {
            if (!validate.isValid(lname)) {
                return res.status(400).send({ status: false, message: "Please give a proper lname" })
            }
            updateUserData.lname = lname
        }
        if (Object.keys(data).includes('email')) {
            if (!validate.isValid(email)) {
                return res.status(400).send({ status: false, message: "email is not valid" })
            }
            if (!validate.isValidEmail(email.trim())) {
                res.status(400).send({ status: false, message: `Invalid email` })
                return
            }
            const dupliEmail = await userModel.findOne({ email })
            if (dupliEmail) { return res.status(400).send({ status: false, message: "Email already exists" }) }

            updateUserData.email = email
        }
        if (Object.keys(data).includes('phone')) {
            if (!validate.isValid(phone)) {
                return res.status(400).send({ status: false, message: "phone is not valid" })
            }
            if (!validate.isValidPhone(phone)) {
                res.status(400).send({ status: false, message: 'Phone number is not valid' })
                return
            }
            const dupliPhone = await userModel.findOne({ phone })
            if (dupliPhone) { return res.status(400).send({ status: false, message: "Phone number already exists" }) }

            updateUserData.phone = phone
        }
        if (Object.keys(data).includes('password')) {
            if (!validate.isValid(password)) {
                return res.status(400).send({ status: false, message: "password is not valid" })
            }
            if (!validate.isValidPassword(password)) {
                return res.status(400).send({ status: false, message: "Password length must be between 8 to 15 characters" })
            }
            const salt = 10
            const encyptedPassword = await bcrypt.hash(password, salt)
            updateUserData.password = encyptedPassword

        }
        if (files.length > 0) {
            if (Object.keys(files[0]).includes('fieldname')) {
                if (files.length == 0) {
                    return res.status(400).send({ status: false, message: "Please provide a profile image" })
                }
                profileImage = await uploadFile(files[0])

                updateUserData.profileImage = profileImage
            }
        }

        if (Object.keys(data).includes("address")) {
            if (Object.keys(address).includes('shipping')) {
                if (Object.keys(address.shipping).includes('street')) {
                    if (!validate.isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: "street is not valid" })
                    }
                    updateUserData['address.shipping.street'] = data.address.shipping.street
                }
                if (Object.keys(address.shipping).includes('city')) {
                    if (!validate.isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "city is not valid" })
                    }
                    updateUserData['address.shipping.city'] = data.address.shipping.city
                }
                if (Object.keys(address.shipping).includes('pincode')) {
                    if (!validate.isValid(address.shipping.city)) {
                        return res.status(400).send({ status: false, message: "pincode is not valid" })
                    }
                    if (!validate.isValidPincode(address.shipping.pincode)) {
                        res.status(400).send({ status: false, message: `Pincode is not valid` })
                        return
                    }
                    updateUserData['address.shipping.pincode'] = data.address.shipping.pincode
                }
            }

            if (Object.keys(address).includes('billing')) {
                if (Object.keys(address.billing).includes('street')) {
                    if (!validate.isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: "street is not valid" })
                    }
                    updateUserData['address.billing.street'] = data.address.billing.street
                }
                if (Object.keys(address.billing).includes('city')) {
                    if (!validate.isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: "city is not valid" })
                    }
                    updateUserData['address.billing.city'] = data.address.billing.city
                }

                if (Object.keys(address.billing).includes('pincode')) {
                    if (!validate.isValid(address.billing.pincode)) {
                        return res.status(400).send({ status: false, message: "pincode is not valid" })
                    }
                    if (!validate.isValidPincode(address.billing.pincode)) {
                        res.status(400).send({ status: false, message: `Pincode is not valid` })
                        return
                    }
                    updateUserData['address.billing.pincode'] = data.address.billing.pincode
                }
            }
        }
        // console.log(files)
        // console.log(data)
        console.log(updateUserData)
        let updateduser = await userModel.findOneAndUpdate(
            { _id: user_id },
            { $set: updateUserData },
            { new: true });

        return res.status(200).send({ status: true, message: "User profile updated", data: updateduser });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}







module.exports = { createUser, loginUser, getProfile, updateUser }



