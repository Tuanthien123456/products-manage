const axios = require("axios");
const crypto = require("crypto");

module.exports.createPayment = async ({ amount, orderId, orderInfo, returnUrl, notifyUrl }) => {
  const partnerCode = "YOUR_PARTNER_CODE";
  const accessKey = "YOUR_ACCESS_KEY";
  const secretKey = "YOUR_SECRET_KEY";
  const requestId = Date.now().toString();
  const requestType = "captureWallet";

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&requestId=${requestId}&requestType=${requestType}&notifyUrl=${notifyUrl}&returnUrl=${returnUrl}`;
  const signature = crypto.createHmac("sha256", secretKey).update(rawSignature).digest("hex");

  const data = {
    partnerCode,
    accessKey,
    requestId,
    amount,
    orderId,
    orderInfo,
    returnUrl,
    notifyUrl,
    requestType,
    signature
  };

  const response = await axios.post("https://test-payment.momo.vn/v2/gateway/api/create", data);
  return response.data;
};
