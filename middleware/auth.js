const config = require('../config/index');
const jwt = require('jsonwebtoken');

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, config.SECRET, (err, user) => {
            if (err) {
                return next({
                    message: 'Invalid token',
                    status: 403
                });
            }
            // console.log(user);
            req.user = user;
            next();
        });
    } else {
        return next({
            message: 'Unauthorized',
            status: 401
        });
    }
};

module.exports = authenticateJWT;