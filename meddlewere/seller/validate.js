const { validationResult } = require('express-validator');

// Middleware To catch any Validation Errors
module.exports = (req, res, next) =>{
    const errors = validationResult(req);
    
    // If no Errors
    if (errors.isEmpty()) {
        return next();
    }

    // Here  There are Errors 
    // Let's Catch them
    
    // Just formatted the errors a bit 
    // in this array
    const extractedErrors = [];
    errors.array().map(e => extractedErrors.push({[e.param]: e.msg}));
    
    res.status(422).json({
        state: 5,
        message: 'Validation Error',
        errors: extractedErrors
    });

}