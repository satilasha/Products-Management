const userModel = require('../model/userModel')



/**********************validation*************************************/


const isValid = function (value) {
    if (typeof value === undefined || typeof value === null) return false
    if (typeof value === 'string' && value.trim().length > 0) return true
}


const isValidPassword = function (password) {
    if (password.length > 7 && password.length < 16) return true
}

// const isValidPincode = function (pincode) {
//     if (pincode.length > 6 && pincode.length < 6) return true
// }


/**********************create user*************************************/



const createUser = async function (req, res) {
    try {
        const data = req.body

        if (Object.keys(data) == 0) {
            return res.status(400).send({ staus: false, message: "Please provide data" })
        }

        const { fname, lname, email, phone, password, pincode, address } = data

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, message: "fname is required" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, message: "lname is required" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, message: "email is required" })
        }

        // if (!isValid(profileImage)) {
        //     return res.staus(400).send({ status: false, message: "profile image link is required" })
        // }

        if (!isValid(phone)) {
            return res.status(400).send({ status: false, message: "phone number is required" })
        }

        if (!isValid(password)) {
            return res.status(400).send({ status: false, message: "password is required" })
        }

        if (address) {
            if (address.shipping) {
                if (!isValid(address.shipping.street)) {
                    return res.status(400).send({ status: false, message: "street is required" })
                }

                if (!isValid(address.shipping.city)) {
                    return res.status(400).send({ status: false, message: "city is required" })
                }

                if (!isValid(address.shipping.pincode)) {
                    return res.status(400).send({ status: false, message: "pincode is required" })
                }
            }
            if (address.billing) {
                if (!isValid(address.billing.street)) {
                    return res.status(400).send({ status: false, message: "street is required" })
                }

                if (!isValid(address.billing.city)) {
                    return res.status(400).send({ status: false, message: "city is required" })
                }

                if (!isValid(address.billing.pincode)) {
                    return res.status(400).send({ status: false, message: "pincode is required" })
                }
            }
        }

        /*************************************dupticate data***********************************/

        const dupliEmail = await userModel.findOne({ email })
        if (dupliEmail) { return res.status(400).send({ status: false, message: "Email already exists" }) }

        const dupliPhone = await userModel.findOne({ phone })
        if (dupliPhone) { return res.status(400).send({ status: false, message: "Phone number already exists" }) }

        /*************************************other validation***********************************/

        let Email = email
        let validateEmail = function (Email) {
            return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(Email);
        }
        if (!validateEmail(Email)) {
            return res.status(400).send({ status: false, message: "Please enter a valid email" })
        }

        const Phone = phone
        const validateMobile = function (Phone) {
            return /^(\+91[\-\s]?)?[0]?(91)?[6789]\d{9}$/.test(Phone)
        }
        if (!validateMobile(Phone)) {
            return res.status(400).send({ status: false, message: "Please enter valid mobile" })
        }


        // if (!isValidPincode(pincode)) {
        //     return res.status(400).send({ status: false, message: "Please enter valid pincode" })
        // }


        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Password length must be between 8 to 15 characters" })
        }
        

        const userData = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user create successfully", data: userData })

    } catch (error) {
        console.log(error)
        return res.status(500).send({ Error: error.message })

    }
}

module.exports = { createUser }

