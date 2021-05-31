const express = require('express');
const {getProducts} =require("../../controllers/client/shop")
const router  = express.Router();

router.get('/getProducts' ,getProducts);



module.exports = router;