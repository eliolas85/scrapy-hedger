// calcolaValori.js
module.exports = function calcolaValori(asset, eurUsdBid_1, eurUsdBid_2, eurGbp, eurJpyBid_1, eurJpyBid_2, eurAud, eurNzd, eurCadBid_1, eurCadBid_2, usdEur, broker1Data, broker2Data) {
    let leverage, pipValue1, pipValue2, valore_lotto_broker1, valore_lotto_broker2;
  
    switch (asset) {
        case "GBPUSD":
          //ok
          leverage = 30;
          pipValue1 = (0.0001 * 100000) / eurUsdBid_1;
          pipValue2 = (0.0001 * 100000) / eurUsdBid_2;
          valore_lotto_broker1 = (eurGbp * 100000) / leverage;
          valore_lotto_broker2 = (eurGbp * 100000) / leverage;
          break;
        case "USDJPY":
          //ok
          leverage = 30;
          pipValue1 = (0.01 * 100000) / eurJpyBid_1;
          pipValue2 = (0.01 * 100000) / eurJpyBid_2;
          valore_lotto_broker1 = (usdEur * 100000) / leverage;
          valore_lotto_broker2 = (usdEur * 100000) / leverage;
          break;
        case "AUDUSD":
          //ok
          leverage = 20;
          pipValue1 = (0.0001 * 100000) / eurUsdBid_1;
          pipValue2 = (0.0001 * 100000) / eurUsdBid_2;
          valore_lotto_broker1 = (eurAud * 100000) / leverage;
          valore_lotto_broker2 = (eurAud * 100000) / leverage;

          break;
        case "NZDUSD":
          // ok
          leverage = 20;
          pipValue1 = (0.0001 * 100000) / eurUsdBid_1;
          pipValue2 = (0.0001 * 100000) / eurUsdBid_2;
          valore_lotto_broker1 = (eurNzd * 100000) / leverage / eurUsdBid_1;
          valore_lotto_broker2 = (eurNzd * 100000) / leverage / eurUsdBid_2;

          break;
        case "USDCAD":
          //ok
          leverage = 30;
          pipValue1 = (0.0001 * 100000) / eurCadBid_1;
          pipValue2 = (0.0001 * 100000) / eurCadBid_2;
          valore_lotto_broker1 = (usdEur * 100000) / leverage;
          valore_lotto_broker2 = (usdEur * 100000) / leverage;

          break;
        case "EURCHF":
          leverage = 30;
          pipValue1 = (0.0001 * 100000) / broker1Data.bid;
          pipValue2 = (0.0001 * 100000) / broker2Data.bid;
          valore_lotto_broker1 = 100000 / leverage;
          valore_lotto_broker2 = 100000 / leverage;

          break;
        case "EURJPY":
          //ok
          leverage = 30;
          pipValue1 = (0.01 * 100000) / broker1Data.bid;
          pipValue2 = (0.01 * 100000) / broker2Data.bid;
          valore_lotto_broker1 = 100000 / leverage;
          valore_lotto_broker2 = 100000 / leverage;
          break;

        case "EURUSD":
          //ok
          leverage = 30;
          pipValue1 = (0.0001 / broker1Data.bid) * 100000;
          pipValue2 = (0.0001 / broker2Data.bid) * 100000;
          valore_lotto_broker1 = 100000 / leverage;
          valore_lotto_broker2 = 100000 / leverage;

          break;
        case "NATGAS":
          // no
          leverage = 10;
          pipValue1 = (0.001 * 10000) / eurUsdBid_1;
          pipValue2 = (0.001 * 10000) / eurUsdBid_2;
          valore_lotto_broker1 =
            ((10000 / leverage) * broker1Data.bid) / eurUsdBid_1;
          valore_lotto_broker2 =
            ((10000 / leverage) * broker1Data.bid) / eurUsdBid_1;
          break;

        case "EURNZD":
          leverage = 20;
          pipValue1 = (0.0001 * 100000) / broker1Data.bid;
          pipValue2 = (0.0001 * 100000) / broker2Data.bid;
          valore_lotto_broker1 = 100000 / leverage;
          valore_lotto_broker2 = 100000 / leverage;
          break;

        case "EURGBP":
          leverage = 30;
          pipValue1 = (0.0001 * 100000) / broker1Data.bid;
          pipValue2 = (0.0001 * 100000) / broker2Data.bid;
          valore_lotto_broker1 = 100000 / leverage;
          valore_lotto_broker2 = 100000 / leverage;
          break;

        case "EURAUD":
          leverage = 20;
          pipValue1 = (0.0001 * 100000) / broker1Data.bid;
          pipValue2 = (0.0001 * 100000) / broker2Data.bid;
          valore_lotto_broker1 = 100000 / leverage;
          valore_lotto_broker2 = 100000 / leverage;
          break;

        case "CRUDEOIL":
          leverage = 10;
          pipValue1 = (0.01 * 1000) / eurUsdBid_1;
          pipValue2 = (0.01 * 1000) / eurUsdBid_2;
          valore_lotto_broker1 = (10 * broker1Data.bid) / eurUsdBid_1;
          valore_lotto_broker2 = (10 * broker2Data.bid) / eurUsdBid_2;
          break;

        default:
          console.log("Asset non supportato: " + asset);
      }
    
    return { leverage, pipValue1, pipValue2, valore_lotto_broker1, valore_lotto_broker2 };
  }
  