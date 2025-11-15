const Cart = require("../../models/models.carts");
const Orders = require("../../models/models.order");
const Product = require("../../models/models.products");
const productsHelper = require("../../helpers/products");
const momoHelper = require("../../helpers/momo");

module.exports.createOrder = async (req, res) => {
  const token = req.headers["authorization"];
  const cartId = req.headers["cartid"];
  const { fullName, phone, address, paymentMethod } = req.body;

  let cart;
  if (token) cart = await Cart.findOne({ user_id: token });
  else if (cartId) cart = await Cart.findById(cartId);

  if (!cart || cart.products.length === 0)
    return res.json({ code: 400, message: "Giỏ hàng trống" });

  // Tính tổng tiền
  let totalPrice = 0;
  for (const item of cart.products) {
    const productInfo = await Product.findById(item.product_id).select(
      "title price discountPercentage"
    );
    productInfo.priceNew = productsHelper.priceNewProduct(productInfo);
    item.price = productInfo.priceNew;
    totalPrice += item.price * item.quantity;
  }

  // Tạo order
  const order = new Orders({
    user_id: token || null,
    cart_id: cart._id,
    userInfo: { fullName, phone, address },
    products: cart.products.map((p) => ({
      product_id: p.product_id,
      price: p.price,
      discountPercentage: p.discountPercentage,
      quantity: p.quantity
    })),
    totalPrice,
    paymentMethod: paymentMethod || "cod",
    paymentStatus: paymentMethod === "momo" ? "pending" : "paid"
  });
  await order.save();

  // Nếu thanh toán MoMo
  if (paymentMethod === "momo") {
    const momoResponse = await momoHelper.createPayment({
      amount: totalPrice,
      orderId: order._id.toString(),
      orderInfo: `Thanh toán đơn hàng ${order._id}`,
      returnUrl: "http://localhost:3000/payment-return",
      notifyUrl: "http://your-server.com/api/payment/momo-notify"
    });

    order.paymentData = {
      transactionId: momoResponse.transId,
      payUrl: momoResponse.payUrl,
      response: momoResponse
    };
    await order.save();

    return res.json({
      code: 200,
      message: "Order tạo thành công, chuyển đến MoMo để thanh toán",
      order,
      payUrl: momoResponse.payUrl
    });
  }

  // Nếu COD
  res.json({
    code: 200,
    message: "Order tạo thành công",
    order
  });
};
