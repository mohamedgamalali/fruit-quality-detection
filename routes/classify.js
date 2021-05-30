const express = require('express') ;

const router = express.Router() ;

const classifyController = require('../controllers/classify') ; 

router.post("/image", classifyController.postClassfyImage)


module.exports = router ;