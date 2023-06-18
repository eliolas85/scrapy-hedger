const express = require("express");
const puppeteer = require("puppeteer");
const cors = require("cors");

const app = express();
app.use(cors());

let unifiedData = {};

app.get("/data", (req, res) => {
  res.json(unifiedData);
});

app.listen(process.env.PORT || 8080, function listening() {
  console.log(`Server listening on port ${process.env.PORT || 8080}`);
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
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    executablePath: process.env.GOOGLE_CHROME_BIN || null,
    headless: true,
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
