const Product = require("../../models/models.products")
const searchProductHelpers=require("../../helpers/searchProduct");
module.exports.index= async (req,res)=>{
    let find={
        deleted:false
    }

    //Tìm kiếm
    const searchProduct=searchProductHelpers(req.query);
    if(req.query.keyword){
        find.title=searchProduct.regex;
    }
    //End Tìm kiếm


    const products= await Product.find(find);
    res.json(products);
};

// chi tiết
module.exports.detail= async (req,res)=>{
    const id=req.params.id;

    let find={
        _id:id,
        deleted:false
    }
    const products= await Product.findOne(find);
    res.json(products);
};
//End chi tiết