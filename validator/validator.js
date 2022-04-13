const ObjectId = require('mongoose').Types.ObjectId

const isValid = (value) => {
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value !== 'string') return false
    return true;
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


module.exports = {
    isValid,
    isValidRequestBody,
    isValidEmail,
    isValidPhone,
    isValidObjectId,
   
}