const express=require("express");
const router=express.Router();

const controller=require("../../controllers/api/cart.controller_api");

router.get("/",controller.index);
router.post("/add/:productId", controller.addProduct);
router.put("/update/:productId", controller.updateProduct);
router.delete("/delete/:productId", controller.deleteProduct);


module.exports=router