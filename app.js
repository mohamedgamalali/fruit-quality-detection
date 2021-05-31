const app = require("express")()
const express = require("express")
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer')
const fs = require('fs');
const path = require('path')
const classify = require("./ai")
const sharp = ("sharp")


require('dotenv').config();


const port = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))



    }



})

var checkImage = function (file, cb) {


    var ext = path.extname(file.originalname);

    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg') {
        cb(null, true)
    } else {
        cb('not an image', false)
    }


}


var upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkImage(file, cb)
    }
})

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
    next();
});

app.use(bodyParser.json());


app.use('/model', express.static(path.join(__dirname, 'model')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use(upload.any('img'));


//routes

const classifyRouter = require('./routes/classify');
const relableRouter = require('./routes/relabel');

//client
const clientAuth = require('./routes/client/auth');

//seller
const sellerAuth = require('./routes/seller/auth');

//app.use('/classify', classifyRouter);
//app.use('/relabel', relableRouter);

//clinet 
app.use('/client', clientAuth);

app.use('/seller', sellerAuth);

app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const state = error.state || 0;
    const message = error.message;
    res.status(status).json({ state: state, message: message });
});


mongoose
    .connect(
        MONGODB_URI, {
        useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false
    })
    .then(result => {
        app.listen(port);

        //=======>>>>    //scadual section// <<<<<<=====
    })
    .catch(err => {
        console.log(err);
    });