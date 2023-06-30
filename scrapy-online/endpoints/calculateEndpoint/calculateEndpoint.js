const calcolaValori = require("./calcolaValori");
const calculateInverseAverageBid = require("../../funzioni/functions");

function calculateAssets(unifiedData) {
  const assetsMap = {};
  // Definisci una mappa di simboli originali ai nuovi simboli
  const symbolMap = {
    /*     oldSymbol2: "newSymbol2", */
  };

  // Organizza i dati per asset e broker
  for (let key in unifiedData) {
    let { symbol, bid, ask, broker } = unifiedData[key];

    // Modifica il simbolo se esiste una mappatura per esso
    if (symbolMap[symbol]) {
      symbol = symbolMap[symbol];
    }

    if (!assetsMap[symbol]) {
      assetsMap[symbol] = [];
    }

    assetsMap[symbol].push({
      broker,
      bid,
      ask,
      spread: Math.abs(bid - ask),
    });
  }

  const results = [];
  let eurUsdBid = 0;
  let eurUsdAsk = 0;
  let eurCadBid = 0;
  let eurCadAsk = 0;
  let eurJpyBid = 0;
  let eurJpyAsk = 0;

  // mappo gli asset per accedere ai valori specifici
  for (let asset in assetsMap) {
    const assetData = assetsMap[asset];
    if (assetData.length > 1) {
      for (let i = 0; i < assetData.length; i++) {
        const broker1Data = assetData[i];

        for (let j = 0; j < assetData.length; j++) {
          if (i === j) continue; // Evita di confrontare lo stesso broker con se stesso
          const broker2Data = assetData[j];
          // Salva il bid di EURUSD
          if (asset.includes("EURUSD")) {
            eurUsdBid = broker1Data.bid;
            eurUsdAsk = broker1Data.ask;
          }
          // Salva il bid di EURCAD
          if (asset.includes("EURCAD")) {
            eurCadBid = broker1Data.bid;
            eurCadAsk = broker2Data.bid;
          }

          if (asset.includes("EURJPY")) {
            eurJpyBid = broker1Data.bid;
            eurJpyAsk = broker1Data.ask;
          }
        }
      }
    }
  }

  for (let asset in assetsMap) {
    const assetData = assetsMap[asset];
    if (assetData.length > 1) {
      for (let i = 0; i < assetData.length; i++) {
        const broker1Data = assetData[i];

        for (let j = 0; j < assetData.length; j++) {
          if (i === j) continue; // Evita di confrontare lo stesso broker con se stesso
          const broker2Data = assetData[j];
          const spread1 = Math.abs(broker1Data.bid - broker1Data.ask);
          const spread2 = Math.abs(broker2Data.bid - broker2Data.ask);

          // Calcola il valore del pip in base alla tipologia dell'asset

          let usdEur = 0;
          let eurNzd = 0;
          let gbpEur = 0;
          let eurAud = 0;
          let natGasUsd = 0;
          let eurCad = 0;

          // Assume che questi siano calcolati o recuperati da qualche parte:
          eurGbp = calculateInverseAverageBid("EURGBP", assetsMap);
          usdEur = calculateInverseAverageBid("EURUSD", assetsMap);
          eurAud = calculateInverseAverageBid("EURAUD", assetsMap);
          eurNzd = calculateInverseAverageBid("EURNZD", assetsMap);
          eurCad = calculateInverseAverageBid("EURCAD", assetsMap);
          eurChf = calculateInverseAverageBid("EURCHF", assetsMap);
          eurJpy = calculateInverseAverageBid("EURJPY", assetsMap);

          // Usiamo un'istruzione switch per gestire tutte le diverse coppie di valute:

          let {
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
          } = calcolaValori(
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
            broker2Data
          );

          let assetId = results.length + 1;
          results.push({
            asset,
            assetId,
            leva_margine: leverage,
            broker_1_nome: broker1Data.broker,
            broker_1_Bid: broker1Data.bid,
            broker_1_spread: spread1,
            broker_1_valore_spread_long,
            broker_1_valore_spread_short,
            broker_1_valore_del_pip: pipValue1,
            broker_1_valore_lotto: valore_lotto_broker1,

            broker_2_nome: broker2Data.broker,
            broker_2_Bid: broker2Data.bid,
            broker_2_spread: spread2,
            broker_2_valore_spread_long,
            broker_2_valore_spread_short,
            boroker_2_valore_del_pip: pipValue2,
            broker_2_valore_lotto: valore_lotto_broker2,
          });
        }
      }
    }
  }
  return results;
}

module.exports = calculateAssets;
