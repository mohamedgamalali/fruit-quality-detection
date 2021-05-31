

const Product = require('../../DB-models/products');

exports.getProducts = async (req, res, next) => {

    /**
     * this func accept query params id if it exist will return details of thar product
     * 
     * 
     */
    const page = req.query.page *1 || 1;
    const id =req.query.id
    const itemPerPage = 10; 
    try{

        if(id){



            const product=await Product.findById(id.toString())
            .select('-orders');

       return res.status(201).json({
            state: 1,
            message: `product in page ${page}`,
            products: product,
            total: 1
        });







        }



      const  totaProducts = await Product.find().countDocuments();   
    const allProducts=await Product.find()
    .skip((page - 1) * itemPerPage)
    .limit(itemPerPage)
    .select('-orders');

        res.status(201).json({
            state: 1,
            message: `product in page ${page}`,
            products: allProducts,
            total: totaProducts
        });


    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}


