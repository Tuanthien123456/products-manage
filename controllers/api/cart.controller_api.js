const Cart = require("../../models/models.carts");
const Product = require("../../models/models.products");
const productsHelper = require("../../helpers/products");

// Lấy giỏ hàng
module.exports.index = async (req, res) => {
  res.json({ code: 200, cart: req.cart });
};

// Thêm sản phẩm vào giỏ hàng
module.exports.addProduct = async (req, res) => {
  try {
    const product_id = req.params.productId;   // lấy từ route
    const { quantity } = req.body;            // số lượng từ body
    const cart = req.cart;                     // middleware đã gán

    // Kiểm tra sản phẩm đã có trong cart chưa
    const index = cart.products.findIndex(p => p.product_id == product_id);
    if (index >= 0) {
        cart.products[index].quantity += quantity;
    } else {
        cart.products.push({ product_id, quantity });
    }

    await cart.save();

    // Tính tổng số lượng tạm thời
    cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ code: 200, message: "Đã thêm vào giỏ hàng", cart });

  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Lỗi server" });
  }
};



// Xóa sản phẩm 
module.exports.delete = async (req, res) => {
  try {
    const product_id = req.params.productId; // lấy từ route
    const cart = req.cart;

    cart.products = cart.products.filter(p => p.product_id != product_id);
    await cart.save();

    // Tính tổng số lượng tạm thời
    cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0);

    res.json({ code: 200, message: "Đã xóa sản phẩm", cart });
  } catch (err) {
    console.log(err);
    res.status(500).json({ code: 500, message: "Lỗi server" });
  }
};
