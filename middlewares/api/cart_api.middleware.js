const Cart = require("../../models/models.carts");

module.exports.cartId = async (req, res, next) => {
    try {
        const expiresCookie = 365 * 24 * 60 * 60 * 1000; // 1 năm
        let cart;

        // 1️⃣ Lấy cart từ cookie
        if (!req.cookies.cartId) {
            // Nếu chưa có cookie → tạo cart ẩn danh
            cart = new Cart({ user_id: null, products: [] });
            await cart.save();

            res.cookie("cartId", cart.id, {
                httpOnly: true,
                sameSite: "lax",
                maxAge: expiresCookie
            });
        } else {
            // Nếu có cookie → kiểm tra cart có tồn tại không
            cart = await Cart.findById(req.cookies.cartId);

            if (!cart) {
                // Cart bị xóa → tạo cart mới
                cart = new Cart({ user_id: null, products: [] });
                await cart.save();

                res.cookie("cartId", cart.id, {
                    httpOnly: true,
                    sameSite: "lax",
                    maxAge: expiresCookie
                });
            }
        }

        //  Nếu user đã login
        if (req.user) {
            // Kiểm tra user đã có cart chưa
            let cartUser = await Cart.findOne({ user_id: req.user._id });

            if (cartUser) {
                // Nếu đã có cart → dùng cart của user
                req.cart = cartUser;
            } else {
                // Nếu chưa có cart → gán cart ẩn danh hiện tại cho user
                if (cart && !cart.user_id) {
                    cart.user_id = req.user._id;
                    await cart.save();
                }
                req.cart = cart;
            }
        } else {
            // Người chưa login → gán cart từ cookie
            req.cart = cart;
        }

        //  Tính tổng số lượng tạm thời
        if (req.cart) {
            req.cart.totalQuantity = req.cart.products.reduce(
                (sum, item) => sum + item.quantity,
                0
            );
        }

        next();
    } catch (error) {
        console.log("Lỗi middleware cartId:", error);
        next(error);
    }
};
