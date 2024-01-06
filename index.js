const fs = require("fs");
const puppeteer = require("puppeteer");
const { Parser } = require("json2csv");

// function to launch puppeteer
async function scrapeOnFlipkartMobiles() {
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    const url =
      "https://www.flipkart.com/search?q=iphone&otracker=search&otracker1=search&marketplace=FLIPKART&as-show=on&as=off";
    await page.goto(url, { waitUntil: "domcontentloaded" });

    await page.waitForSelector("div._1AtVbE");

    const mobiles = await page.evaluate(() => {
      const mobileList = [];
      // product name, price, ratings, and any other relevant attributes.

      document.querySelectorAll("div._1AtVbE").forEach((item) => {
        // html elements
        const productNameElement = item.querySelector("div._4rR01T");
        const priceElement = item.querySelector("div._30jeq3");
        const ratingsElement = item.querySelector("div._3LWZlK");
        const specificationElement = item.querySelector("div.fMghEO");

        // html elements' values and avoid space by trimming the text
        const productName = productNameElement? productNameElement.innerText.trim(): "";
        const price = priceElement ? priceElement.innerText.trim() : "";
        const ratings = ratingsElement ? ratingsElement.innerText.trim() : "";
        const specification = specificationElement ? specificationElement.innerText.trim() : "";

        // to avoid null and empty values
        if (productName && price && ratings && specification) {
          mobileList.push({
            Name: productName,
            Price: price,
            Ratings: ratings,
            Specification: specification,
          });
        }
      });
      return mobileList;
    });

    // Close the browser
    await browser.close();

    // here make a new csv from the data

    try {
      const parser = new Parser({ fields: ["Name", "Price", "Ratings", "Specification"] });
      const csv = parser.parse(mobiles);

      fs.writeFileSync("flipkart_phones.csv", csv, "utf8");
    } catch (err) {
      console.error(err);
    }
  } catch (error) {
    console.log(error);
    await browser.close();
  }
}
scrapeOnFlipkartMobiles();
