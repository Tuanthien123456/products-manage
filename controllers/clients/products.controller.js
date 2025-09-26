const Product=require("../../models/models.products");


module.exports.index= async (req,res)=>{
    const products = await Product.find({
         status:"active",
         deleted:false
    }).sort({position: "desc"});
    const newProduct=products.map((item)=>{
        item.priceNew=(item.price*(100-item.discountPercentage)/100).toFixed(0);
        return item;
    })
    console.log(newProduct);
    res.render("client/pages/products/index.pug",{
        Title:"Danh Sách Sản Phẩm",
        Product:newProduct
    });
}


module.exports.detail= async (req,res)=>{
    //console.log(req.params.slug);

    try {
        const find={
        deleted:false,
        slug:req.params.slug,
        status:"active"
    }
    const product=await Product.findOne(find)
    console.log(product);
    res.render("client/pages/products/detail",{
        Title:product.Title,
        product:product
    });
    } catch (error) {
        res.redirect(`/products`);
    }
}