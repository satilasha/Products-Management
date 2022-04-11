const jwt = require("jsonwebtoken")


const authentication = (req, res, next) => {
    try {
        const token = req.headers["x-api-key"]
        if (!token) {
            return res.status(400).send({ status: false, msg: "please enter token " })
        }

        let decoded = jwt.verify(token, "Group26")

        if (!decoded) {
            return res.status(403).send({ status: false, mag: "token is not valid" })
        }
        next()
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}

module.exports.authentication = authentication