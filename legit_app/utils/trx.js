const WebpayPlus = require("transbank-sdk").WebpayPlus;
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require("transbank-sdk");

// @ts-ignore

const tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));

// if (process.env.NODE_ENV === "production") {
//   tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
// } else {
//   if (!global.__tx__) {
//     global.__tx__ = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
//   }
//   tx = global.__tx__;
// }
console.log("La transaccion", tx);
console.log("El typeof de la transacccion", tx.constructor.name);
module.exports = tx;