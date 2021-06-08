const Product = require("../../DB-models/products");
const Client = require("../../DB-models/client");
const Order = require("../../DB-models/order");

const { check, validationResult } = require("express-validator");

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
  let find = {};
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
    } else {
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

  let amount = req.body.amount;
  amount = parseInt(amount);
  const errors = validationResult(req);

  //const unit = req.body.unit;
  let newAmount = 1;
  let totalPrice = 0; // price for every product in cart
  let finalPrice = 0; // the total cart price

  try {
    if (!errors.isEmpty()) {
      const error = new Error(
        `validation faild for ${errors.array()[0].param} in ${
          errors.array()[0].location
        }`
      );
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
      tempPrice = addedProduct.price * amount;
      totalPrice = clientCart[createdBefore].totalPrice + tempPrice;

      //console.log("total price for created befor is  ", totalPrice);

      clientCart[createdBefore].amount = newAmount;
      clientCart[createdBefore].totalPrice = totalPrice;
    } else {
      let seller=await Product.findById(productId).populate("seller");
   console.log("seller is :", seller )
      totalPrice = addedProduct.price * amount;
      //console.log("total price for new product added is  ", totalPrice);
      clientCart.push({
        product: productId,
        amount: amount,
        totalPrice: totalPrice,
        seller:seller._id
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
      message: "Added to cart"
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
      .select("cart")
      .populate({
        path: "cart.product",
        select: "name price seller imageUrl fresh",
        populate: {
          path: "seller",
          select: "name city",
        },
      });
    const clientCart = client.cart;
    let finalPrice = 0;
    for (prod in client.cart) {
      finalPrice = finalPrice + clientCart[prod].totalPrice;
    }
    return res.status(200).json({
      cartItems: clientCart,
      finalPrice: finalPrice,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.deleteFromCart = async (req, res, next) => {
  const productId = req.body.productId;
  const errors = validationResult(req);

  try {
    if (!errors.isEmpty()) {
      const error = new Error(
        `validation faild for ${errors.array()[0].param} in ${
          errors.array()[0].location
        }`
      );
      error.statusCode = 422;
      error.state = 5;
      throw error;
    }

    const client = await Client.findById(req.userId);
    clientCart = [...client.cart];
    console.log('client carty is :' , clientCart)
    const updatedCart = clientCart.filter((item) => {
      return item._id.toString() !== productId.toString();
    });

    client.cart = updatedCart;
    await client.save();
    return res.status(200).json({
      state:1,
      clientCart: client.cart,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
      error.state = 5;
    }
    next(err);
  }
};
exports.makeOrder = async (req, res, next) => {
  const client = await Client.findById(req.userId);
  const locationName = req.body.locationName;
  const locationAddres=req.body.locationAddres;

  try {
    let products;
    // for (product in client.cart) {
    // }
    const client = await Client.findById(req.userId)
      .select("cart")
      .populate({
        path: "cart.product",
        select: "name price seller imageUrl fresh",
       
      }).populate('seller');
      console.log("client is : ",client.cart)

    let orderPrice = 0;
    //console.log("client is : ", client.cart);
    for (product in client.cart) {
      orderPrice = orderPrice + client.cart[product].totalPrice;
    }
   // console.log(orderPrice);

    const order = await new Order({
      client: req.userId,
      locationName:locationName,
      locationAddres:locationAddres,
      products: client.cart,
      totalPrice: orderPrice,
    }).save();
    //console.log('client cart : ' ,order)
    client.cart = [];
    await client.save();
    return res.status(201).json({
      message: "order created",
      data: order,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {

 try{ const clientOrder = await Order.find({ client: req.userId });
  return res.status(200).json({
    message: "orders",
    data: clientOrder,
  });
  }catch(err){
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.cancelOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  try {
    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({
        message: "order not found",
      });
    }

    if (order.client.toString() !== req.userId.toString()) {
      return res.status(300).json({
        message: "this user not alowed to delete this order",
      });
    }
    const canceledOrder = await order.cancelOrder();

    return res.status(200).json({
      message: "canceled",
      data: canceledOrder,
    });

    console.log(order);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getOrders = async (req, res, next) => {
  const clientOrder = await Order.find({ client: req.userId });
  return res.status(200).json({
    message: "orders",
    data: clientOrder,
  });
};

exports.endOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  try {
    let order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({
        message: "order not found",
      });
    }

    const endededOrder = await order.endOrder();

    return res.status(200).json({
      message: "ended",
      data: endededOrder,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
