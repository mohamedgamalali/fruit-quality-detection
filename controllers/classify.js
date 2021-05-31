const fs = require('fs');
const path = require('path')
const classify = require("../ai") ;

exports.postClassfyImage = async (req, res, next) => {
    console.debug(req.files[0].path)
    //  await sharp(req.files[0].path).resize({ height:150, width:150}).toFile(req.files[0].path)

    const image = fs.readFileSync(req.files[0].path);

    const result = await classify(image)

    res.json({
        result
    })
}

