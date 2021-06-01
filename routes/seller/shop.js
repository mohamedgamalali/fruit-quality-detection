const express      = require('express');
const {body}       = require('express-validator');

const authController = require('../../controllers/seller/shop');
// const isAuthVerfy         = require('../../meddlewere/seller/isAuthVerfy');
 const isAuth         = require('../../meddlewere/seller/isAuth');


const router  = express.Router();


// Validation Rules
const {
    addProductValidations,
    editProductValidations
} = require('../../helpers/validation');

const validate = require('../../meddlewere/seller/validate');


router.post('/addProduct', isAuth, addProductValidations(), validate,  authController.postAddProduct);

router.post('/editProduct', isAuth, editProductValidations(), validate, authController.postEditProduct);

router.get('/Products',isAuth ,authController.getProduct);

module.exports = router;