// calcolaValori.js
module.exports = function calcolaValori(
  asset,
  eurUsdBid,
  eurUsdAsk,
  eurGbp,
  eurJpyBid,
  eurJpyAsk,
  eurAud,
  eurNzd,
  eurCadBid,
  eurCadAsk,
  usdEur,
  broker1Data,
  broker2Data,
  lotto_std
) {
  let leverage,
    pipValue1,
    pipValue2,
    valore_lotto_broker1,
    valore_lotto_broker2,
    broker_1_valore_spread_long,
    broker_1_valore_spread_short,
    broker_2_valore_spread_long,
    broker_2_valore_spread_short;

  const spread1 = Math.abs(broker1Data.bid - broker1Data.ask);
  const spread2 = Math.abs(broker2Data.bid - broker2Data.ask);
  const prezzoMedio = (broker1Data.bid + broker2Data.bid) / 2;

  switch (asset) {
    case "GBPUSD":
      //ok
      leverage = 30;
      lotto_std = 100000;
      /* blocco standard */
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurUsdBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurUsdAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurUsdBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurUsdAsk;
      /* fine blocco stndard */
      pipValue1 = (0.0001 * lotto_std) / eurUsdBid;
      pipValue2 = (0.0001 * lotto_std) / eurUsdBid;
      valore_lotto_broker1 = (eurGbp * lotto_std) / leverage;
      valore_lotto_broker2 = (eurGbp * lotto_std) / leverage;
      break;
    case "USDJPY":
      //ok
      leverage = 30;
      lotto_std = 100000;
      /* blocco standard */
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurJpyBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurJpyAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurJpyBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurJpyAsk;
      /* fine blocco stndard */
      pipValue1 = (0.01 * lotto_std) / eurJpyBid;
      pipValue2 = (0.01 * lotto_std) / eurJpyBid;
      valore_lotto_broker1 = (usdEur * lotto_std) / leverage;
      valore_lotto_broker2 = (usdEur * lotto_std) / leverage;
      break;
    case "AUDUSD":
      //ok
      leverage = 20;
      lotto_std = 100000;
      /* blocco standard */
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurUsdBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurUsdAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurUsdBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurUsdAsk;
      /* fine blocco stndard */
      pipValue1 = (0.0001 * lotto_std) / eurUsdBid;
      pipValue2 = (0.0001 * lotto_std) / eurUsdBid;
      valore_lotto_broker1 = (eurAud * lotto_std) / leverage;
      valore_lotto_broker2 = (eurAud * lotto_std) / leverage;

      break;
    case "NZDUSD":
      // ok
      leverage = 20;
      lotto_std = 100000;
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurUsdBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurUsdAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurUsdBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurUsdAsk;
      pipValue1 = (0.0001 * lotto_std) / eurUsdBid;
      pipValue2 = (0.0001 * lotto_std) / eurUsdBid;
      valore_lotto_broker1 = (eurNzd * lotto_std) / leverage / eurUsdBid;
      valore_lotto_broker2 = (eurNzd * lotto_std) / leverage / eurUsdBid;

      break;
    case "USDCAD":
      //ok
      leverage = 30;
      lotto_std = 100000;
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurCadBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurCadAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurCadBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurCadAsk;
      pipValue1 = (0.0001 * lotto_std) / eurCadBid;
      pipValue2 = (0.0001 * lotto_std) / eurCadBid;
      valore_lotto_broker1 = (usdEur * lotto_std) / leverage;
      valore_lotto_broker2 = (usdEur * lotto_std) / leverage;

      break;
    case "EURCHF":
      leverage = 30;
      lotto_std = 100000;
      broker_1_valore_spread_long = spread1 * lotto_std;
      broker_1_valore_spread_short = spread1 * lotto_std;
      broker_2_valore_spread_long = spread2 * lotto_std;
      broker_2_valore_spread_short = spread2 * lotto_std;
      pipValue1 = (0.0001 * lotto_std) / broker1Data.bid;
      pipValue2 = (0.0001 * lotto_std) / broker2Data.bid;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;

      break;
    case "EURJPY":
      //ok
      leverage = 30;
      lotto_std = 100000;
      broker_1_valore_spread_long = (spread1 * lotto_std) / broker1Data.bid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / broker1Data.ask;
      broker_2_valore_spread_long = (spread2 * lotto_std) / broker2Data.bid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / broker2Data.ask;
      pipValue1 = (0.01 * lotto_std) / broker1Data.bid / broker1Data.bid;
      pipValue2 = (0.01 * lotto_std) / broker2Data.bid / broker2Data.bid;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;
      break;

    case "EURUSD":
      //ok
      leverage = 30;
      lotto_std = 100000;
      /* blocco standard */
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurUsdBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurUsdAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurUsdBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurUsdAsk;
      /* fine blocco stndard */
      pipValue1 = (0.0001 / broker1Data.bid) * lotto_std;
      pipValue2 = (0.0001 / broker2Data.bid) * lotto_std;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;

      break;

    case "EURCAD":
      //ok
      leverage = 30;
      lotto_std = 100000;
      broker_1_valore_spread_long = spread1 * lotto_std;
      broker_1_valore_spread_short = spread1 * lotto_std;
      broker_2_valore_spread_long = spread2 * lotto_std;
      broker_2_valore_spread_short = spread2 * lotto_std;
      pipValue1 = (0.0001 / broker1Data.bid) * lotto_std;
      pipValue2 = (0.0001 / broker2Data.bid) * lotto_std;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;

      break;
    case "NATGAS":
      // no
      leverage = 10;
      lotto_std = 10000;
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurUsdBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurUsdAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurUsdBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurUsdAsk;
      pipValue1 = (0.001 * lotto_std) / eurUsdBid;
      pipValue2 = (0.001 * lotto_std) / eurUsdBid;
      valore_lotto_broker1 =
        ((lotto_std / leverage) * broker1Data.bid) / eurUsdBid;
      valore_lotto_broker2 =
        ((lotto_std / leverage) * broker1Data.bid) / eurUsdBid;
      break;

    case "EURNZD":
      leverage = 30;
      lotto_std = 100000;
      broker_1_valore_spread_long = spread1 * lotto_std;
      broker_1_valore_spread_short = spread1 * lotto_std;
      broker_2_valore_spread_long = spread2 * lotto_std;
      broker_2_valore_spread_short = spread2 * lotto_std;
      pipValue1 = (0.0001 * lotto_std) / broker1Data.bid;
      pipValue2 = (0.0001 * lotto_std) / broker2Data.bid;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;
      break;

    case "EURGBP":
      leverage = 30;
      lotto_std = 100000;
      broker_1_valore_spread_long = spread1 * lotto_std;
      broker_1_valore_spread_short = spread1 * lotto_std;
      broker_2_valore_spread_long = spread2 * lotto_std;
      broker_2_valore_spread_short = spread2 * lotto_std;
      pipValue1 = (0.0001 * lotto_std) / broker1Data.bid;
      pipValue2 = (0.0001 * lotto_std) / broker2Data.bid;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;
      break;

    case "EURAUD":
      leverage = 20;
      lotto_std = 100000;
      broker_1_valore_spread_long = spread1 * lotto_std;
      broker_1_valore_spread_short = spread1 * lotto_std;
      broker_2_valore_spread_long = spread2 * lotto_std;
      broker_2_valore_spread_short = spread2 * lotto_std;
      pipValue1 = (0.0001 * lotto_std) / broker1Data.bid;
      pipValue2 = (0.0001 * lotto_std) / broker2Data.bid;
      valore_lotto_broker1 = lotto_std / leverage;
      valore_lotto_broker2 = lotto_std / leverage;
      break;

    case "CRUDEOIL":
      leverage = 10;
      lotto_std = 100;
      broker_1_valore_spread_long = (spread1 * lotto_std) / eurUsdBid;
      broker_1_valore_spread_short = (spread1 * lotto_std) / eurUsdAsk;
      broker_2_valore_spread_long = (spread2 * lotto_std) / eurUsdBid;
      broker_2_valore_spread_short = (spread2 * lotto_std) / eurUsdAsk;
      pipValue1 = (0.01 * lotto_std) / eurUsdBid;
      pipValue2 = (0.01 * lotto_std) / eurUsdBid;
      valore_lotto_broker1 = (10 * broker1Data.bid) / eurUsdBid;
      valore_lotto_broker2 = (10 * broker2Data.bid) / eurUsdBid;
      break;

    default:
      console.log("Asset non supportato: " + asset);
  }

  return {
    leverage,
    lotto_std,
    pipValue1,
    pipValue2,
    valore_lotto_broker1,
    valore_lotto_broker2,
    broker_1_valore_spread_long,
    broker_1_valore_spread_short,
    broker_2_valore_spread_long,
    broker_2_valore_spread_short,
  };
};
