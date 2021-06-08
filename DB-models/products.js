const mongoose = require('mongoose');

const schema = mongoose.Schema;

const productSchema = new schema({
    name: {
        type: String,
        required: true,
    },
    productType: {
        type: String,
        required: true
    },
    orders: {
        type: Number,
        default: 0
    },
    imageUrl: {
        type: String,
        required: true,
        default:"https://i2.wp.com/ceklog.kindel.com/wp-content/uploads/2013/02/firefox_2018-07-10_07-50-11.png?fit=641%2C618&ssl=1"
    },
    fresh: {
        type: String,
        required: true,
    },
    seller: {
        type: schema.Types.ObjectId,
        ref: 'seller',
        required: true

    },
    price: {
        type: Number,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);