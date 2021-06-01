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
        required: true
    },
    fresh: {
        type: String,
        required: true,
    },
    seller: {
        type: schema.Types.ObjectId,
        refPath: 'seller',
        required:true

    },

    pricePerUnit: { // Optional
        type: Number,
        required: false
    },

    price: { // Price per Kilo (Main price)
        type: Number,
        required: true
    }


}, { timestamps: true });

module.exports = mongoose.model('product', productSchema);