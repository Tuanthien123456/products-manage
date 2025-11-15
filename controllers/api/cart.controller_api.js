const Cart = require("../../models/models.carts");
const Product = require("../../models/models.products");
const productsHelper = require("../../helpers/products");

// Lấy giỏ hàng
module.exports.index = async (req, res) => {
  const token = req.headers["authorization"]; // token của user
  const cartId = req.headers["cartid"]; // cart tạm từ frontend

  let cart;

  if (token) {
    // Lấy cart của user
    let userCart = await Cart.findOne({ user_id: token });
    let tempCart = null;

    if (cartId) {
      tempCart = await Cart.findById(cartId);
    }

    if (userCart && tempCart) {
      // Merge cart tạm vào cart user
      tempCart.products.forEach(tempItem => {
        const existItem = userCart.products.find(p => p.product_id == tempItem.product_id);
        if (existItem) {
          existItem.quantity += tempItem.quantity; // cộng dồn số lượng
        } else {
          userCart.products.push(tempItem);
        }
      });
      await userCart.save();
      await Cart.findByIdAndDelete(cartId); // xóa cart tạm
      cart = userCart;
    } else if (userCart) {
      cart = userCart;
    } else if (tempCart) {
      tempCart.user_id = token;
      await tempCart.save();
      cart = tempCart;
    } else {
      cart = new Cart({ user_id: token, products: [] });
      await cart.save();
    }

  } else if (cartId) {
    // Người dùng chưa login nhưng có cart tạm
    cart = await Cart.findById(cartId);
    if (!cart) {
      cart = new Cart({ products: [] });
      await cart.save();
    }
  } else {
    // Người dùng chưa login và chưa có cart
    cart = new Cart({ products: [] });
    await cart.save();
  }

  // Tính giá mới và tổng tiền
  for (const item of cart.products) {
    const productInfo = await Product.findById(item.product_id)
        .select("title thumbnail slug price discountPercentage");
    productInfo.priceNew = productsHelper.priceNewProduct(productInfo);
    item.productInfo = productInfo;
    item.totalPrice = productInfo.priceNew * item.quantity;
}

    cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice, 0);

  res.json({
    code: 200,
    message: "Lấy giỏ hàng thành công",
    cart,
    cartId: cart._id // frontend lưu cartId nếu chưa login
  });
};

// Thêm sản phẩm vào giỏ hàng
module.exports.addProduct = async (req, res) => {
  const token = req.headers["authorization"];
  const cartId = req.headers["cartid"];
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity) || 1;

  let cart;

  if (token) {
    cart = await Cart.findOne({ user_id: token });
    if (!cart) {
      cart = new Cart({ user_id: token, products: [] });
      await cart.save();
    }
  } else if (cartId) {
    cart = await Cart.findById(cartId);
    if (!cart) {
      cart = new Cart({ products: [] });
      await cart.save();
    }
  } else {
    cart = new Cart({ products: [] });
    await cart.save();
  }

  const existProduct = cart.products.find((p) => p.product_id == productId);

  if (existProduct) {
    existProduct.quantity += quantity;
  } else {
    cart.products.push({ product_id: productId, quantity });
  }

  await cart.save();

  res.json({
    code: 200,
    message: "Đã thêm sản phẩm vào giỏ hàng",
    cart,
    cartId: cart._id,
  });
};

// Cập nhật số lượng sản phẩm
module.exports.updateProduct = async (req, res) => {
  const token = req.headers["authorization"];
  const cartId = req.headers["cartid"];
  const productId = req.params.productId;
  const quantity = parseInt(req.body.quantity);

  let cart;
  if (token) cart = await Cart.findOne({ user_id: token });
  else if (cartId) cart = await Cart.findById(cartId);

  if (!cart) return res.json({ code: 400, message: "Cart không tồn tại" });

  const item = cart.products.find((p) => p.product_id == productId);
  if (!item) return res.json({ code: 400, message: "Sản phẩm không tồn tại" });

  item.quantity = quantity;
  await cart.save();

  res.json({ code: 200, message: "Cập nhật số lượng thành công", cart });
};

// Xóa sản phẩm
module.exports.deleteProduct = async (req, res) => {
  const token = req.headers["authorization"];
  const cartId = req.headers["cartid"];
  const productId = req.params.productId;

  let cart;
  if (token) cart = await Cart.findOne({ user_id: token });
  else if (cartId) cart = await Cart.findById(cartId);

  if (!cart) return res.json({ code: 400, message: "Cart không tồn tại" });

  cart.products = cart.products.filter((p) => p.product_id != productId);
  await cart.save();

  res.json({ code: 200, message: "Xóa sản phẩm thành công", cart });
};