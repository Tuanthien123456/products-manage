const mongoose=require("mongoose");

const orderSchema= new mongoose.Schema(
    {
        user_id:String,
        cart_id:String,
        userInfo:{
            fullName:String,
            phone:String,
            address:String
        },
        products:[{
            product_id:String,
            price:Number,
            discountPercentage:Number,
            quantity:Number
        }],
        totalPrice: Number, 
        paymentMethod: {        // phương thức thanh toán: "momo", "cod", "vnpay", ...
            type: String,
            default: "cod"
        },
        paymentStatus: {        // trạng thái thanh toán
            type: String,
            enum: ["pending", "paid", "failed"],
            default: "pending"
        },
        paymentData: {          // lưu dữ liệu trả về từ MoMo hoặc gateway khác
            transactionId: String,
            payUrl: String,
            response: Object
        },
        deleted:{
            type:Boolean,
            default:false,
        },
        deletedAt:Date,
    },
    {
        timestamps:true
    });
const Orders=mongoose.model('Orders',orderSchema,"orders");

module.exports=Orders;