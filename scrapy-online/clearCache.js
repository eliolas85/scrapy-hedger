const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Clear the browser cache.
  const client = await page.target().createCDPSession();
  await client.send("Network.clearBrowserCache");

  await browser.close();
})();
