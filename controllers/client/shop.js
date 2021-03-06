const Product = require("../../DB-models/products");
const Client = require("../../DB-models/client");

const { check, validationResult } = require('express-validator');


exports.getProducts = async (req, res, next) => {
  /**
   * this func accept query params id if it exist will return details of thar product
   *
   *
   */
  const page = req.query.page * 1 || 1;
  const id = req.query.id;
  const itemPerPage = 10;
  const order = req.query.order || -1;
  const date = Boolean(Number(req.query.date)) || false;
  const price = Boolean(Number(req.query.price)) || false;
  const productType = req.query.productType || false;
  let find = {}
  let totaProducts = 0;
  let allProducts;
  try {
    if (id) {
      const product = await Product.findById(id.toString()).select("-orders");

      return res.status(201).json({
        state: 1,
        message: `product in page ${page}`,
        products: product,
        total: 1,
      });
    }

    if (productType) {
      find = { productType: productType };
    }

    if (date) {
      totaProducts = await Product.find(find).countDocuments();
      allProducts = await Product.find(find)
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .select("-orders")
        .sort({ createdAt: order });
    } else if (price) {
      totaProducts = await Product.find(find).countDocuments();
      allProducts = await Product.find(find)
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .select("-orders")
        .sort({ price: order });
    }else{
      totaProducts = await Product.find(find).countDocuments();
      allProducts = await Product.find(find)
        .skip((page - 1) * itemPerPage)
        .limit(itemPerPage)
        .select("-orders");
    }


    res.status(201).json({
      state: 1,
      message: `product in page ${page}`,
      products: allProducts,
      total: totaProducts,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.addToCart = async (req, res, next) => {
  const productId = req.body.productId;

  const amount = req.body.amount;
  const errors = validationResult(req);

  //const unit = req.body.unit;
  let newAmount = 1;
  let totalPrice = 0; // price for every product in cart
  let finalPrice = 0; // the total cart price 

  try {

    if (!errors.isEmpty()) {
      const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
      error.statusCode = 422;
      error.state = 5;
      throw error;
    }

    const client = await Client.findById(req.userId);
    const addedProduct = await Product.findById(productId);
    if (!addedProduct) {
      const error = new Error(`product not found`);
      error.statusCode = 404;
      error.state = 9;
      throw error;
    }
    //console.log("client isssss" ,addedProduct)
    clientCart = [...client.cart];
    // console.log(clientCart);
    const createdBefore = clientCart.findIndex((val) => {
      return val.product.toString() === productId.toString();
    });

    if (createdBefore >= 0) {
      //let tempPrice=(addedProduct.price*amount)+clientCart[createdBefore].totalPrice;
      newAmount = clientCart[createdBefore].amount + amount;
      tempPrice = (addedProduct.price) * amount;
      totalPrice = clientCart[createdBefore].totalPrice + tempPrice

      //console.log("total price for created befor is  ", totalPrice);

      clientCart[createdBefore].amount = newAmount;
      clientCart[createdBefore].totalPrice = totalPrice;
    } else {
      totalPrice = addedProduct.price * amount;
      //console.log("total price for new product added is  ", totalPrice);
      clientCart.push({
        product: productId,
        amount: amount,
        totalPrice: totalPrice
        //  unit: unit,
      });

    }
    client.cart = clientCart;
    await client.save();


    for (prod in client.cart) {

      finalPrice = finalPrice + clientCart[prod].totalPrice;
    }

    res.status(201).json({
      state: 1,
      message: client.cart,
      finalPrice: finalPrice
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};


exports.getUserCart = async (req, res, next) => {

  try {
    const client = await Client.findById(req.userId)
    .select('cart')
    .populate({
      path:'cart.product',
      select:'name price seller imageUrl fresh',
      populate:{
        path:'seller',
        select:'name'
      }
    });
    const clientCart = client.cart;
    let finalPrice = 0 ;
    for (prod in client.cart) {

      finalPrice = finalPrice + clientCart[prod].totalPrice;
    }
    return res.status(200).json({
      cartItems: clientCart,
      finalPrice:finalPrice
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
}



exports.deleteFromCart = async (req, res, next) => {
  const productId = req.body.productId;
  const errors = validationResult(req);


  try {

    if (!errors.isEmpty()) {
      const error = new Error(`validation faild for ${errors.array()[0].param} in ${errors.array()[0].location}`);
      error.statusCode = 422;
      error.state = 5;
      throw error;
    }

    const client = await Client.findById(req.userId);
    clientCart = [...client.cart];
    const updatedCart = clientCart.filter(item => {
      return item._id.toString() !== productId.toString();
    })

    client.cart = updatedCart;
    await client.save();
    return res.status(200).json({
      clientCart: client.cart
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }

}