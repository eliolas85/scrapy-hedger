const calcolaValori = require("./calcolaValori");
const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const puppeteer = require("puppeteer");
const fs = require("fs");
const cors = require("cors");

/* creare un midleware */
function calculateInverseAverageBid(assetName, assetsMap) {
  // Controlla se l'asset esiste nella mappa degli assets.
  if (assetsMap[assetName]) {
    // Ottieni i dati dell'asset.
    const assetData = assetsMap[assetName];
    // Inizializza una variabile per la somma totale delle offerte.
    let totalBid = 0;
    // Itera attraverso tutti i dati dell'asset.
    for (let i = 0; i < assetData.length; i++) {
      // Aggiungi l'offerta corrente al totale.
      totalBid += assetData[i].bid;
    }
    // Calcola e restituisci l'inverso della media delle offerte.
    return 1 / (totalBid / assetData.length);
  } else {
    // Se l'asset non esiste nella mappa degli assets, stampa un messaggio di errore e restituisci null.
    console.error(`Asset ${assetName} non trovato nella mappa degli assets.`);
    return null;
  }
}

const app = express();
process.setMaxListeners(100);
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
}, 1000); // 5 minuti in millisecondi);

app.get("/data", (req, res) => {
  res.json(unifiedData);
});

app.get("/calculate", (req, res) => {
  const assetsMap = {};
  // Definisci una mappa di simboli originali ai nuovi simboli
  const symbolMap = {
    "NatGas.r": "NATGAS",
    "SpotCrude.r": "CRUDEOIL",
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
  let eurUsdBid_1 = 0;
  let eurUsdBid_2 = 0;
  let eurCadBid_1 = 0;
  let eurCadBid_2 = 0;
  let eurJpyBid_1 = 0;
  let eurJpyBid_2 = 0;

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
            eurUsdBid_1 = broker1Data.bid;
            eurUsdBid_2 = broker2Data.bid;
          }
          // Salva il bid di EURCAD
          if (asset.includes("EURCAD")) {
            eurCadBid_1 = broker1Data.bid;
            eurCadBid_2 = broker2Data.bid;
          }

          if (asset.includes("EURJPY")) {
            eurJpyBid_1 = broker1Data.bid;
            eurJpyBid_2 = broker2Data.bid;
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
            pipValue1,
            pipValue2,
            valore_lotto_broker1,
            valore_lotto_broker2,
          } = calcolaValori(
            asset,
            eurUsdBid_1,
            eurUsdBid_2,
            eurGbp,
            eurJpyBid_1,
            eurJpyBid_2,
            eurAud,
            eurNzd,
            eurCadBid_1,
            eurCadBid_2,
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
            broker_1_valore_del_pip: pipValue1,
            broker_1_valore_lotto: valore_lotto_broker1,

            broker_2_nome: broker2Data.broker,
            broker_2_Bid: broker2Data.bid,
            broker_2_spread: spread2,
            boroker_2_valore_del_pip: pipValue2,
            broker_2_valore_lotto: valore_lotto_broker2,
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

const updateFrequency = 5 * 60 * 1000; // 5 minuti in millisecondi;
const etoroAssets = [
  "EURUSD", //ok
  "NZDUSD", //ok
  "GBPUSD", //ok
  "EURNZD", //ok
  "EURGBP", //ok
  "EURAUD", //no
  "AUDUSD", //ok
  "NATGAS", //ok
  "USDJPY", //ok
  "EURCAD", //ok
  "USDCAD", //ok
  "EURCHF", //ok
  "EURJPY", //ok
  "OIL", //ok
];
const plus500Assets = [
  "EURUSD",
  "NZDUSD",
  "GBPUSD",
  "EURNZD",
  "EURGBP",
  "EURAUD",
  "AUDUSD",
  "NG",
  "USDJPY",
  "EURCAD",
  "USDCAD",
  "EURCHF",
  "EURJPY",
  "CL",
];

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
      symbol = symbol.replace("Natural Gas", "NATGAS");
      symbol = symbol.replace("Oil", "CRUDEOIL");

      return {
        symbol,
        bid,
        ask,
        spread: Math.abs(bid - ask),
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
    timeout: 12000,
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
      symbol = symbol.replace("Gas Naturale", "NATGAS");
      symbol = symbol.replace("CL", "CRUDEOIL");

      return {
        symbol,
        bid,
        ask,
        spread: Math.abs(bid - ask),
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

async function scrapeAllAssetsInSeries(etoroAssets, plus500Assets) {
  for (let asset of etoroAssets) {
    await scrapeAssetEtoro(asset);
  }

  for (let asset of plus500Assets) {
    await scrapeAssetPlus500(asset);
  }
}

async function scrapeAssetEtoro(asset) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setCacheEnabled(false); // Aggiungi questa riga per disabilitare la cache.

  if (etoroAssets.includes(asset)) {
    await page.goto(`https://www.etoro.com/it/markets/${asset}/chart`);
    return fetchDataEtoro(page, asset);
  }
}

async function scrapeAssetPlus500(asset) {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.setCacheEnabled(false); // Aggiungi questa riga per disabilitare la cache.

  if (plus500Assets.includes(asset)) {
    await page.goto(`https://www.plus500.com/it/Instruments/${asset}`);
    return fetchDataPlus500(page, asset);
  }
}

scrapeAllAssetsInSeries(etoroAssets, plus500Assets);
