const express = require('express');

const {getProducts,addToCart,getUserCart ,deleteFromCart}=require("../../controllers/client/shop");
const isAuth         = require('../../meddlewere/client/isAuth');

const router  = express.Router();

router.get('/getProducts' ,isAuth,getProducts);
router.get('/getCart',isAuth,getUserCart);
router.put('/addProduct',isAuth,addToCart);
router.delete('/deleteItem',isAuth,deleteFromCart);



module.exports = router;