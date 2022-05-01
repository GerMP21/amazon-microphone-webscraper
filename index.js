const puppeteer = require("puppeteer");
const fs = require("fs");

async function scrape(url, fileName) {
    //Create a new browser instance
    const browser = await puppeteer.launch();

    //Create a new page
    const page = await browser.newPage();

    //Set navigation timeout to 0 seconds
    await page.setDefaultNavigationTimeout(0);

    //Navigate to the desired website
    await page.goto("https://www.amazon.com/", { waitUntil: "networkidle2" });

    //Type the search query
    await page.type("#twotabsearchtextbox", "microphone");

    //Click on the search button
    await page.click("#nav-search-submit-button");

    //Wait for the page to load
    await page.waitForSelector(
    'div[class="s-result-list s-search-results sg-row"]'
    );

    //Get all the divs from the articles
    let divs = await page.$$(
    'div[class="s-result-list s-search-results sg-row"] > div'
    );
    if (divs.length <= 2) {
    divs = await page.$$(
        'div[class="s-main-slot s-result-list s-search-results sg-row"] > div'
    );
    }

    const articles = [];

    //Iterate over the divs and build the articles array
    for (const div of divs) {
        try {
            const title = await div.$eval("span[class=a-size-base a-color-base a-text-normal", (element) => element.innerText);
            const url = await div.$eval("a", (element) => element.href);
            let price = await div.$eval("span[class='a-price-whole']", (element) => element.innerText);
            const decimals = await div.$eval("span[class='a-price-fraction']", (element) => element.innerText);

            price = price.replace("\n", "") + decimals;

            const article = {
            title,
            url,
            price,
            };

            articles.push(article);
        } catch (err) {
            // this occurs if any of the tags (h2, img, span) was not found
            console.log("error: ", err);
        }
    }
    
    fs.writeFile('microphones.json', JSON.stringify(articles), (err) => {
        if (err) throw err;
    });
}

scrape();