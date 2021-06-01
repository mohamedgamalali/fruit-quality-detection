const Product = require("../../DB-models/products");
const Client = require("../../DB-models/client");

exports.getProducts = async (req, res, next) => {
  /**
   * this func accept query params id if it exist will return details of thar product
   *
   *
   */
  const page = req.query.page * 1 || 1;
  const id = req.query.id;
  const itemPerPage = 10;
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

    const totaProducts = await Product.find().countDocuments();
    const allProducts = await Product.find()
      .skip((page - 1) * itemPerPage)
      .limit(itemPerPage)
      .select("-orders");

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
  const unit = req.body.unit;
  let newAmount = 1;
  if (!productId || !amount) {
    return res.status(400).json({
      message: "please enter the product id and amount",
    });
  }

  try {
    const client = await Client.findById(req.userId);
    clientCart = [...client.cart];
    console.log(clientCart);
    const createdBefore = clientCart.findIndex((val) => {
      return val.product.toString() === productId.toString();
    });

    if (createdBefore >= 0) {
      newAmount = clientCart[createdBefore].amount + amount;
      console.log("created ", newAmount);

      clientCart[createdBefore].amount = newAmount;
    } else {
      clientCart.push({
        product: productId,
        amount: amount,
        unit: unit,
      });
    }

    client.cart = clientCart;
    await client.save();
    res.status(201).json({
      state: 1,
      message: client.cart,
    });
  } catch (error) {
      
  }
};


exports.getUserCart=async(req,res,next)=>{

    try{
        const client =await Client.findById(req.userId);
        const clientCart=client.cart;
        return res.status(200).json({
            cartItems:clientCart
        });
    }catch(error){

    }
}



exports.deleteFromCart=async (req,res,next)=>{
    const productId = req.body.productId;
    
    if (!productId ) {
        return res.status(400).json({
          message: "please enter the product id",
        });
      }

      try{
        const client = await Client.findById(req.userId);
        clientCart = [...client.cart];
        const updatedCart=clientCart.filter(item=>{
           return item._id.toString() !== productId.toString();
        })

        client.cart=updatedCart;
        await client.save();
        return res.status(200).json({
            clientCart:client.cart
        });
      }catch(error){

      }

}