const express = require('express');
const { body } = require('express-validator');

const { getProducts, addToCart, getUserCart, deleteFromCart ,makeOrder,getOrders,
cancelOrder,endOrder
} = require("../../controllers/client/shop");
const isAuth = require('../../meddlewere/client/isAuth');

const router = express.Router();

router.get('/getProducts', isAuth, getProducts);
router.get('/getCart', isAuth, getUserCart);
router.put('/cart/addProduct', [
    body('productId')
        .not().isEmpty(),
    body('amount')
        .not().isEmpty()
], isAuth, addToCart);
router.delete('/cart/deleteItem', [
    body('productId')
        .not().isEmpty()
], isAuth, deleteFromCart);
router.put('/makeOrder',isAuth,makeOrder);
router.get('/getOrders',isAuth,getOrders)
router.post('/cancelOrder',isAuth,cancelOrder)
router.post('/endOrder',isAuth,endOrder)


module.exports = router;