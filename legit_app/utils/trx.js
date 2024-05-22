const WebpayPlus = require("transbank-sdk").WebpayPlus;
const { Options, IntegrationApiKeys, Environment, IntegrationCommerceCodes } = require("transbank-sdk");

if (process.env.NODE_ENV === "production") {
  tx = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
} else {
  if (!global.__tx__) {
    global.__tx__ = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, Environment.Integration));
  }
  tx = global.__tx__;
}

// if (!global.__tx__) {
//     const environment = process.env.NODE_ENV === "production" ? Environment.Production : Environment.Integration;
//     global.__tx__ = new WebpayPlus.Transaction(new Options(IntegrationCommerceCodes.WEBPAY_PLUS, IntegrationApiKeys.WEBPAY, environment));
// }

module.exports = global.__tx__;