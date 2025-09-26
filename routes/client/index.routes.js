const productsRoutes=require("./products.routes");
const homesRoutes=require("./home.routes");

module.exports=(app)=>{
    app.use("/",homesRoutes);
    app.use("/products",productsRoutes);
}