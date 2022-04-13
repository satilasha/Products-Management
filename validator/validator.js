const ObjectId = require('mongoose').Types.ObjectId

const isValid = (value) => {
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value !== 'string') return false
    return true;
}
const isValidNum = (value) => {
    
    if (typeof value === 'undefined' || value === null) return false
    return /^\d*\.?\d+$/.test(value)
   
      
}
const isValidRequestBody = (requestBody) => {
    if (Object.keys(requestBody).length > 0) {
        return true
    } else
        return false
}

const isValidObjectId = (objectId) => {
    if (ObjectId.isValid(objectId)) {
        return true
    } else
        return false
}

const isValidEmail = (email) => {
    return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)
}
const isValidPhone = (phone) => {
    return /^([+]\d{2})?\d{10}$/.test(phone)
}
const isValidPassword = (password) => {
    if (8 <= password.length && 15 >= password.length)
        return true
    else
        return false
}
const isValidPincode = (pincode) => {
    return /^[1-9][0-9]{5}$/.test(pincode)
}

module.exports = {
    isValid,
    isValidRequestBody,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isValidPincode,
    isValidNum
   
}