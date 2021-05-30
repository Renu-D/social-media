/**
 * Error Handler -Express
 */
//  const logger = require('../utils/log4js').getLogger('ERROR-HANDLER');

 const errorHandler = (err, req, res, next) => {
     if (!err) {
         return next();
     }
     console.error(JSON.stringify(err));
     return res.status(err.status || 500).json({
         error: err
     });
 };
 
 module.exports =  errorHandler;