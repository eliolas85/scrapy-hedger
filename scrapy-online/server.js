const calculateAssets = require("./endpoints/calculateEndpoint/calculateEndpoint");
const http = require("http");
const express = require("express");
const WebSocket = require("ws");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
process.setMaxListeners(100);
app.use(cors());
const server = http.createServer(app);
const wss = new WebSocket.Server({ noServer: true });

let unifiedData = {};
let buffer = {};

// Mappa dei simboli originali ai nuovi simboli
const symbolMap = {
  "NatGas.r": "NATGAS",
  "SpotCrude.r": "CRUDEOIL",
  "EURUSD.r": "EURUSD",
  "GBPUSD.r": "GBPUSD",
  "NZDUSD.r": "NZDUSD",
  "EURNZD.r": "EURNZD",
  "EURGBP.r": "EURGBP",
  "EURAUD.r": "EURAUD",
  "AUDUSD.r": "AUDUSD",
  "USDJPY.r": "USDJPY",
  "EURCAD.r": "EURCAD",
  "USDCAD.r": "USDCAD",
  "EURCHF.r": "EURCHF",
  "EURJPY.r": "EURJPY",
  // Aggiungi altre coppie simbolo:nuovo valore qui
};

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    let parsedMessage = JSON.parse(message);

    // Se il simbolo è nella mappa, cambialo
    if (symbolMap.hasOwnProperty(parsedMessage.symbol)) {
      parsedMessage.symbol = symbolMap[parsedMessage.symbol];
    }

    let key = parsedMessage.broker + ":" + parsedMessage.symbol;

    console.log(parsedMessage.symbol);

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

//------------------------------------------------------------------------------
// scraper inizio
//------------------------------------------------------------------------------
const updateFrequency = 1000; // 5 minuti in millisecondi;
const etoroAssets = [
  "EURUSD",
  "NZDUSD",
  "GBPUSD",
  "EURNZD",
  "EURGBP",
  "EURAUD",
  "AUDUSD",
  "NATGAS",
  "USDJPY",
  "EURCAD",
  "USDCAD",
  "EURCHF",
  "EURJPY",
  "OIL",
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
      symbol = symbol.replace("Petrolio", "CRUDEOIL");

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
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/google-chrome",
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false); // Aggiungi questa riga per disabilitare la cache.

  if (etoroAssets.includes(asset)) {
    await page.goto(`https://www.etoro.com/it/markets/${asset}/chart`);
    return fetchDataEtoro(page, asset);
  }
}

async function scrapeAssetPlus500(asset) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
    executablePath: "/usr/bin/google-chrome",
  });
  const page = await browser.newPage();
  await page.setCacheEnabled(false); // Aggiungi questa riga per disabilitare la cache.

  if (plus500Assets.includes(asset)) {
    await page.goto(`https://www.plus500.com/it/Instruments/${asset}`);
    return fetchDataPlus500(page, asset);
  }
}

scrapeAllAssetsInSeries(etoroAssets, plus500Assets);

//------------------------------------------------------------------------------
// scraper fine
//------------------------------------------------------------------------------

//##############################################################################

//------------------------------------------------------------------------------
// Endpoints inizio
//------------------------------------------------------------------------------

app.get("/data", (req, res) => {
  res.json(unifiedData);
});

app.get("/calculate", (req, res) => {
  const results = calculateAssets(unifiedData);
  res.json(results);
});

//------------------------------------------------------------------------------
// Endpoints fine
//------------------------------------------------------------------------------

server.on("upgrade", function upgrade(request, socket, head) {
  wss.handleUpgrade(request, socket, head, function done(ws) {
    wss.emit("connection", ws, request);
  });
});

server.listen(8080, function listening() {
  console.log("Node.js server listening on port 8080");
});
