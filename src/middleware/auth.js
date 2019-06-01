const User = require('../models/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const verify = jwt.verify(token, 'nodejstask');
        const user = await User.findOne({_id: verify._id, 'tokens.token': token});
        if(!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();

    } catch (e) {
        res.status(401).send();
    }
}

// const fileDownload = async (req, res, next) => {
//     try {
//         const fileUrl = req.body.url;

//     } catch (e) {

//     }
// }


module.exports = auth;