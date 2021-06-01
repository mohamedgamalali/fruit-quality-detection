const { body } = require('express-validator');

const addProductValidations = () => {
    return [
        body('name', 'name can\'t be empty!').not().isEmpty().trim(),
        body('productType', 'productType can\'t be empty!').not().isEmpty().trim(),
        body('fresh', 'fresh can\'t be empty!').not().isEmpty().trim(),
    ]
}


const editProductValidations = () => {
    return [
        body('name', 'name can\'t be empty!').not().isEmpty().trim(),
        body('productType', 'productType can\'t be empty!').not().isEmpty().trim(),
        body('id', 'id can\'t be empty!').not().isEmpty(),
    ]
}

module.exports = {
    addProductValidations,
    editProductValidations
}