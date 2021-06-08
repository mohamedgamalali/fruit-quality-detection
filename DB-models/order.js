const mongoose = require("mongoose");

const schema = mongoose.Schema;

const orderSchema = new schema(
  {
    client: {
      type: schema.Types.ObjectId,
      ref: "client",
    },
    // location: {
    //   type: { type: String },
    //   coordinates: [Number],
    // },
    locationName: {
     
        type: String,
        required: true,
    }
,
      locationAddres: {
        type: String,
        required: true,
      },
    
    
    status: {
      type: String,
      default: "started",
    },
    // seller: {
    //     type: schema.Types.ObjectId,
    //     ref: 'seller'
    // },
    products: [
      {
        product: {
          type: schema.Types.ObjectId,
          ref: "product",
        },
        amount: {
          type: Number,
          required: true,
        },
        seller:{
            type:schema.Types.ObjectId,
            ref:"seller"
        },
       
      },
    ],

    // pay: {
    //     type: Boolean,
    //     default: false
    // },
    // reted:{
    //     type: Boolean,
    //     default: false
    // },
    totalPrice:{
        type:Number,
        required:true,
        default:0
    },
  },
 
  { timestamps: true }
);

orderSchema.index({ location: "2dsphere" });

orderSchema.methods.cancelOrder = function () {
  this.status = "cancel";
  return this.save();
};

orderSchema.methods.endOrder = function () {
  this.status = "ended";
  return this.save();
};

module.exports = mongoose.model("order", orderSchema);
