const ProductCategory=require("../../models/models.products-category");

module.exports.index = async(req,res)=>{
    let find={
        deleted:false,
    }
    function createTree(arr,parentId=""){
        const tree=[];
        arr.forEach((item) => {
            if(item.parent_id === parentId){
                const newItem =item;
                const children =createTree(arr,item.id);
                if(children.length>0){
                    newItem.children = children;
                }
                tree.push(newItem);
            }
        });
        return tree;
    }

    const records= await ProductCategory.find(find);
    const newRecords=createTree(records);
    res.render("admin/pages/products-category/index",{
        pageTitle:"Danh mục sản phẩm",
        record:newRecords
    });
}

module.exports.create = async (req,res)=>{
    let find={
        deleted:false,
    }

    function createTree(arr,parentId=""){
        const tree=[];
        arr.forEach((item) => {
            if(item.parent_id === parentId){
                const newItem =item;
                const children =createTree(arr,item.id);
                if(children.length>0){
                    newItem.children = children;
                }
                tree.push(newItem);
            }
        });
        return tree;
    }

    const records=await ProductCategory.find(find);
    const newRecords=createTree(records);
    console.log(newRecords);

    //console.log(records);
    res.render("admin/pages/products-category/create",{
        pageTitle:"Danh mục sản phẩm",
        record:newRecords,
    });
}

module.exports.createPost = async(req,res)=>{
    if(req.body.position ==""){
        const countProduct=await ProductCategory.countDocuments();
        req.body.position=countProduct +1;
    }else{
        req.body.position=parseInt(req.body.position);
    }
    const record=new ProductCategory(req.body);
    await record.save();

    res.redirect("/admin/products-category");
}