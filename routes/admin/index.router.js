const systemConfig=require("../../config/sytem");
const dashBoardRoutes=require("./dashboard.router");
const productsRoutes=require("./products.router");
const productCategoryRoutes=require("./products-category.router");

module.exports=(app)=>{
    const PATH_ADMIN=systemConfig.prefixAdmin;
    app.use(PATH_ADMIN+"/dashboard",dashBoardRoutes);

    app.use(PATH_ADMIN+"/products",productsRoutes);

    app.use(PATH_ADMIN+"/products-category",productCategoryRoutes);
}