const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const puppeteer = require("puppeteer");
const fs = require("fs");
const cors = require("cors"); // Aggiungi questa linea

const app = express();
app.use(cors()); // E questa linea
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

let unifiedData = {};
let buffer = {};

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    let parsedMessage = JSON.parse(message);
    let key = parsedMessage.broker + ":" + parsedMessage.symbol;

    // Memorizza i dati in arrivo nel buffer anziché elaborarli immediatamente
    buffer[key] = {
      ...parsedMessage,
      updatedAt: new Date().toISOString(),
    };
  });
});

// Elabora i dati del buffer ogni secondo
setInterval(() => {
  unifiedData = { ...unifiedData, ...buffer };
  buffer = {}; // Pulisci il buffer
}, 1000);

app.get("/data", (req, res) => {
  res.json(unifiedData); // Restituisci i dati ricevuti come JSON
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

  // Calcola gli indicatori per ogni asset
  // Calcola gli indicatori per ogni asset
  for (let asset in assetsMap) {
    const assetData = assetsMap[asset];
    if (assetData.length > 1) {
      const [broker1Data, broker2Data] = assetData;
      const spread1 = broker1Data.bid - broker1Data.ask;
      const spread2 = broker2Data.bid - broker2Data.ask;

      // calcola prezzo medio per ogni broker
      const averagePrice1 = (broker1Data.bid + broker1Data.ask) / 2;
      const averagePrice2 = (broker2Data.bid + broker2Data.ask) / 2;

      // calcola spread medio
      const averageSpread1 = (broker1Data.bid - broker1Data.ask) / 2;
      const averageSpread2 = (broker2Data.bid - broker2Data.ask) / 2;

      const hedge_Ratio = broker1Data.bid / broker2Data.bid;

      // calcola hedge ratio pesato
      const weightedHedgeRatio =
        (averagePrice1 - averageSpread1) / (averagePrice2 - averageSpread2);

      results.push({
        asset,
        broker_1: broker1Data.broker,
        broker_1_Bid: broker1Data.bid,
        broker_1_Ask: broker1Data.ask,
        broker_1_Spread: spread1,
        broker_2: broker2Data.broker,
        broker_2_Bid: broker2Data.bid,
        broker_2_Ask: broker2Data.ask,
        broker_2_Spread: spread2,
        hedge_Ratio,
        weighted_Hedge_Ratio: weightedHedgeRatio,
      });
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

const updateFrequency = 5000; // Milliseconds. Modify this value to adjust the update frequency
const assets = ["btc", "eth", "xrp", "ltc", "bch", "eos", "BTCUSD", "ETHUSD"]; // Insert the desired assets here

async function fetchDataEtoro(page, asset) {
  const brokerName = "Etoro";
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(2000);
  await page.waitForSelector(
    ".buy-sell-indicators, .mobile-instrument-name-fullname",
    { timeout: 60000 }
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

      return {
        symbol: element.textContent.trim(),
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
    timeout: 60000,
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

      return {
        symbol: element.textContent.trim(),
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

async function scrapeAsset(asset) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/google-chrome",
  });
  const page = await browser.newPage();

  if (["btc", "eth", "xrp", "ltc", "bch", "eos"].includes(asset)) {
    await page.goto(`https://www.etoro.com/it/markets/${asset}/chart`);
    await fetchDataEtoro(page, asset);
  }

  if (["BTCUSD", "ETHUSD"].includes(asset)) {
    await page.goto(`https://www.plus500.com/it/Instruments/${asset}`);
    await fetchDataPlus500(page, asset);
  }
}

async function scrapeAllAssets(assets) {
  for (let asset of assets) {
    await scrapeAsset(asset);
  }
}

scrapeAllAssets(assets);
