// bid = prezzo di acquisto
// ask = prezzo di vendita

const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const puppeteer = require("puppeteer");
const fs = require("fs");
const cors = require("cors");

const app = express();
process.setMaxListeners(20);
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

let unifiedData = {};
let buffer = {};

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    let parsedMessage = JSON.parse(message);
    let key = parsedMessage.broker + ":" + parsedMessage.symbol;

    buffer[key] = {
      ...parsedMessage,
      updatedAt: new Date().toISOString(),
    };
  });
});

setInterval(() => {
  unifiedData = { ...unifiedData, ...buffer };
  buffer = {};
}, 1000);

app.get("/data", (req, res) => {
  res.json(unifiedData);
});

app.get("/calculate", (req, res) => {
  const assetsMap = {};

  // Organizza i dati per asset e broker
  for (let key in unifiedData) {
    const { symbol, bid, ask, broker } = unifiedData[key];
    if (!assetsMap[symbol]) {
      assetsMap[symbol] = [];
    }
    assetsMap[symbol].push({
      broker,
      bid,
      ask,
    });
  }

  const results = [];

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
          const hedge_Ratio = broker1Data.bid / broker2Data.bid;

          // Calcola il valore del pip in base alla tipologia dell'asset
          let pipValue1, pipValue2, lotValue1, lotValue2;
          let usdEur = 0;

          if (asset.includes("JPY")) {
            // Valuta indiretta
            pipValue1 = 0.01 / broker1Data.bid;
            pipValue2 = 0.01 / broker2Data.bid;
          } else if (asset === "XAUUSD") {
            // Oro
            pipValue1 = 0.01 / broker1Data.bid;
            pipValue2 = 0.01 / broker2Data.bid;
          } else if (asset === "SP500") {
            // Indice S&P 500
            pipValue1 = 0.1 / broker1Data.bid;
            pipValue2 = 0.1 / broker2Data.bid;
          } else {
            // Valuta diretta
            pipValue1 = 0.0001 / broker1Data.bid;
            pipValue2 = 0.0001 / broker2Data.bid;
          }

          let valore_lotto_broker1 = broker1Data.bid * 100000;
          let valore_lotto_broker2 = broker2Data.bid * 100000;

          if (assetsMap["EURUSD"]) {
            const eurUsdData = assetsMap["EURUSD"];
            let totalBid = 0;
            for (let i = 0; i < eurUsdData.length; i++) {
              totalBid += eurUsdData[i].bid;
            }
            usdEur = 1 / (totalBid / eurUsdData.length);
          }

          let test = 0;
          if (asset.includes("JPY")) {
            test = usdEur;
            valore_lotto_broker1 = test * 100000;
            valore_lotto_broker2 = test * 100000;
          }

          // calcola il valore del pip per lotto, mini lotto e micro lotto
          let pipValuePerStandardLot1 = pipValue1 * 100000;
          let pipValuePerStandardLot2 = pipValue2 * 100000;

          const spreadInPips1 = spread1 / (pipValue1 * broker1Data.bid);
          const spreadInPips2 = spread2 / (pipValue2 * broker2Data.bid);

          const coefficiente_broker1 = spreadInPips1 * pipValuePerStandardLot1;
          const coefficiente_broker2 = spreadInPips2 * pipValuePerStandardLot2;

          results.push({
            asset,
            broker_1: broker1Data.broker,
            broker_1_Bid: broker1Data.bid,
            broker_1_Ask: broker1Data.ask,
            broker_1_Spread: spread1,
            broker_1_Spread_InPips: spreadInPips1,
            broker_1_PipValue_PerStandardLot: pipValuePerStandardLot1,
            broker_1_coefficiente: coefficiente_broker1,
            broker_1_valore_lotto: valore_lotto_broker1,
            broker_2: broker2Data.broker,
            broker_2_Bid: broker2Data.bid,
            broker_2_Ask: broker2Data.ask,
            broker_2_Spread: spread2,
            broker_2_Spread_InPips: spreadInPips2,
            broker_2_PipValue_PerStandardLot: pipValuePerStandardLot2,
            broker_2_coefficiente: coefficiente_broker2,
            broker_2_valore_lotto: valore_lotto_broker2,
            hedge_Ratio,
            test,
          });
        }
      }
    }
  }
  res.json(results);
});

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

server.listen(8080, function listening() {
  console.log("Node.js server listening on port 8080");
});

const updateFrequency = 5000;
const assets = [
  "EURUSD",
  "GBPUSD",
  "USDJPY",
  "USDCHF",
  /*   
  "AUDUSD",
  "USDCAD",
  "NZDUSD",
  "EURGBP",
  "EURJPY",
  "GBPJPY",
  "EURCHF",
  "GBPCHF",
  "AUDJPY",
  "CADJPY",
  "NZDJPY",
  "AUDCAD",
  "AUDNZD",
  "EURAUD",
  "EURCAD",
  "GBPAUD",
  "GBPCAD",
  "GBPNZD",
  "EURNZD",
  "USDSGD",
  "USDHKD",
  "USDCNY",
  "USDINR",
  "USDMXN",
  "USDBRL",
  "USDRUB",
  "USDZAR", 
  */
];

const etoroAssets = assets;
const plus500Assets = assets;

async function fetchDataEtoro(page, asset) {
  const brokerName = "Etoro";
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(2000);
  await page.waitForSelector(
    ".buy-sell-indicators, .mobile-instrument-name-fullname",
    { timeout: 12000 }
  );

  const data = await page.evaluate((broker) => {
    const nameElements = Array.from(
      document.querySelectorAll(".mobile-instrument-name-fullname")
    );
    const priceElements = Array.from(
      document.querySelectorAll(".buy-sell-indicators")
    );

    return nameElements.map((element, index) => {
      const priceText = priceElements[index]?.textContent || "";
      const bid = parseFloat(priceText.match(/B\s*([\d.]+)/)?.[1] || 0);
      const ask = parseFloat(priceText.match(/S\s*([\d.]+)/)?.[1] || 0);
      let symbol = element.textContent.trim();
      symbol = symbol.replace("/", "");

      return {
        symbol,
        bid,
        ask,
        broker,
        updatedAt: new Date().toISOString(),
      };
    });
  }, brokerName);

  data.forEach((item) => {
    let key = item.broker + ":" + item.symbol;
    unifiedData[key] = item;
  });

  setTimeout(() => fetchDataEtoro(page, asset), updateFrequency);
}

async function fetchDataPlus500(page, asset) {
  const brokerName = "Plus500";
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(2000);
  await page.waitForSelector(".instrument-button, .inst-name, .title-price", {
    timeout: 6000,
  });

  const data = await page.evaluate((broker) => {
    const nameElements = Array.from(document.querySelectorAll(".inst-name"));
    const bidElements = Array.from(
      document.querySelectorAll(".button-sell strong")
    );
    const askElements = Array.from(
      document.querySelectorAll(".button-buy strong")
    );

    return nameElements.map((element, index) => {
      const ask = parseFloat(bidElements[index]?.textContent || 0);
      const bid = parseFloat(askElements[index]?.textContent || 0);
      let symbol = element.textContent.trim();
      symbol = symbol.replace("/", "");

      return {
        symbol,
        bid,
        ask,
        broker,
        updatedAt: new Date().toISOString(),
      };
    });
  }, brokerName);

  data.forEach((item) => {
    let key = item.broker + ":" + item.symbol;
    unifiedData[key] = item;
  });

  setTimeout(() => fetchDataPlus500(page, asset), updateFrequency);
}

async function scrapeAllAssets(etoroAssets, plus500Assets) {
  const promises = [];

  for (let asset of etoroAssets) {
    promises.push(scrapeAssetEtoro(asset));
  }

  for (let asset of plus500Assets) {
    promises.push(scrapeAssetPlus500(asset));
  }

  await Promise.all(promises);
}

async function scrapeAssetEtoro(asset) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  if (etoroAssets.includes(asset)) {
    await page.goto(`https://www.etoro.com/it/markets/${asset}/chart`);
    return fetchDataEtoro(page, asset);
  }
}

/* async function scrapeAssetPlus500(asset) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  if (plus500Assets.includes(asset)) {
    await page.goto(`https://www.plus500.com/it/Instruments/${asset}`);
    return fetchDataPlus500(page, asset);
  }
} */

scrapeAllAssets(etoroAssets);
