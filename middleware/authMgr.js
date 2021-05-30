const jwt = require('jsonwebtoken');
const config = require('../config/index');

module.exports.generateToken = (payload) => {
    if (!payload) {
        console.error('No payload provided');
        return;
    }
    // accessToken which expires in 1 hour
    const accessToken = jwt.sign(payload, config.SECRET, { expiresIn: 24 * 60 * 60 * 1 });
    return accessToken;
};
