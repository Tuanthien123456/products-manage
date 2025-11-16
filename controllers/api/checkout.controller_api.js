const Cart = require("../../models/models.carts");
const Product = require("../../models/models.products");
const Order = require("../../models/models.order");

module.exports.order = async (req, res) => {
    try {
        const cartId = req.cookies.cartId;
        const userInfo = req.body.userInfo;

        if (!cartId) {
            return res.status(400).json({ message: "cartId không tồn tại trong cookie" });
        }

        const cart = await Cart.findById(cartId);
        if (!cart || !cart.products || cart.products.length === 0) {
            return res.status(400).json({ message: "Giỏ hàng rỗng hoặc không tồn tại" });
        }

        // Build product list
        const products = [];
        for (const item of cart.products) {

            // Lấy product từ DB
            const product = await Product.findById(item.product_id)
                .select("price discountPercentage");

            if (!product) {
                return res.status(400).json({
                    message: "Sản phẩm không tồn tại",
                    productId: item.product_id
                });
            }

            // Chống undefined
            const price = Number(product.price) || 0;
            const discount = Number(product.discountPercentage) || 0;
            const quantity = Number(item.quantity) || 1;

            products.push({
                product_id: item.product_id,
                price,
                discountPercentage: discount,
                quantity
            });
        }

        // Tính tổng tiền an toàn
        const totalPrice = products.reduce((sum, item) => {
            const priceNew = item.price - (item.price * item.discountPercentage / 100);
            return sum + (priceNew * item.quantity);
        }, 0);


        // Tạo đơn hàng COD
        const order = await Order.create({
            cart_id: cartId,
            userInfo,
            products,
            totalPrice,
            paymentMethod: "cod",
            paymentStatus: "pending"
        });

        // Clear giỏ hàng
        await Cart.updateOne({ _id: cartId }, { products: [] });

        return res.json({
            message: "Đặt hàng COD thành công",
            orderId: order._id,
            paymentMethod: "cod"
        });

    } catch (err) {
        console.log("ORDER ERROR:", err);
        res.status(500).json({
            message: "Lỗi server",
            error: err.message
        });
    }
};
