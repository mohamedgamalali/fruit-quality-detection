const app=require("express")()
const express=require("express")
const multer=require('multer')
const fs=require('fs');
const path=require('path')
const classify =require("./ai")
const sharp=("sharp")
var storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'uploads/images')
    },
    filename:(req,file,cb)=>{
    cb(null,file.fieldname+'-'+Date.now()+path.extname(file.originalname))
    
    
    
    }
    
    
    
    })
    
    var checkImage=function(file,cb){
    
    
    var ext=path.extname(file.originalname);
    
    if(ext==='.png'||ext==='.jpg'||ext==='.jpeg'){
        cb(null,true)
    }else{
        cb('not an image',false)
    }
    
    
    }
    
    
    var upload=multer({
        storage:storage,
        fileFilter:function(req,file,cb){
            checkImage(file,cb)
        }
    })

    app.use(express.static('model'))

app.post("/classify/image",upload.any('img'),async(req,res,next)=>{
    console.debug(req.files[0].path)
 //  await sharp(req.files[0].path).resize({ height:150, width:150}).toFile(req.files[0].path)

   const image= fs.readFileSync(req.files[0].path)
    const result=await classify(image)
    
    res.json({
        result
    })

})
// app.get("*",(req,res)=>{
//     res.send("welcome to fresh fruit project")
// })
app.listen(3000)