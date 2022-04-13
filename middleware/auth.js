const jwt = require("jsonwebtoken")


const authentication = (req, res, next) => {
    try {
        const token = req.headers["x-api-key"]
        if (!token) {
            return res.status(400).send({ status: false, msg: "please enter token " })
        }
        let decodeToken = jwt.decode(token)
        if (!decodeToken) {
            return res.status(401).send({ status: false, msg: "Not a valid Token " })
        }
        if((Date.now() > (decodeToken.exp * 1000))){
            return res.status(403).send({status : false, message : `session expired, please login again`})
            }
        jwt.verify(token,  "Group26");
        req.loggedInUser = decodeToken.userId
        next()
       
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

module.exports.authentication = authentication