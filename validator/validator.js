const ObjectId = require('mongoose').Types.ObjectId

const isValid = (value) => {
    if (typeof value === 'string' && value.trim().length === 0) return false
    if (typeof value === 'undefined' || value === null) return false
    // if (typeof value !== 'string') return false
    return true
}

const isValidString = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    return /^[a-zA-Z\s]{0,255}$/.test(value)
}
const isValidNum = (value) => {
    if (typeof value === 'undefined' || value === null) return false
    return /^\d*\.?\d+$/.test(value)
}
const isValidNumber = (value) => {
    if (typeof value !== 'number') return false
    // if (typeof value === 'undefined' || value === null) return false
  return true
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
    return /^[6-9]\d{9}$/.test(phone)
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
const isValidStatus = (status) => {
    return ['pending', 'completed', 'cancelled'].indexOf(status) !== -1
}

module.exports = {
    isValid,
    isValidNumber,
    isValidRequestBody,
    isValidEmail,
    isValidPhone,
    isValidPassword,
    isValidObjectId,
    isValidPincode,
    isValidNum,
    isValidString,
    isValidStatus

}