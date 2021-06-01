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
  //const unit = req.body.unit;
  let newAmount = 1;
  let totalPrice=0; // price for every product in cart
  let finalPrice=0; // the total cart price 
  if (!productId || !amount) {
    return res.status(400).json({
      message: "please enter the product id and amount",
    });
  }

  try {
    const client = await Client.findById(req.userId);
    const addedProduct=await Product.findById(productId);
    if(!addedProduct){
      return res.status(400).json({
        message: "product is unavailable",
      });
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
      tempPrice=(addedProduct.price)*amount;
      totalPrice=clientCart[createdBefore].totalPrice + tempPrice
      
     //console.log("total price for created befor is  ", totalPrice);

      clientCart[createdBefore].amount = newAmount;
      clientCart[createdBefore].totalPrice = totalPrice;
    } else {
      totalPrice=addedProduct.price*amount;
      //console.log("total price for new product added is  ", totalPrice);
      clientCart.push({
        product: productId,
        amount: amount,
        totalPrice:totalPrice
      //  unit: unit,
      });
      
    }
    client.cart = clientCart;
    await client.save();

    
    for (prod in client.cart) {
       
        finalPrice=finalPrice+clientCart[prod].totalPrice;
        console.log("final price in for loop is ",finalPrice)
    }
    
    res.status(201).json({
      state: 1,
      message: client.cart,
      finalPrice:finalPrice
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