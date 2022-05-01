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
    'div'
    );

    //Get all the divs from the articles
    let divs = await page.$$('div[class="a-section a-spacing-base"] > div');
    if (divs.length <= 2) {
    divs = await page.$$('div[class="sg-col-4-of-12 s-result-item s-asin sg-col-4-of-16 AdHolder sg-col s-widget-spacing-small sg-col-4-of-20"] > div');
    }

    const articles = [];

    //Iterate over the divs and build the articles array
    for (const div of divs) {
        try {
            const title = await div.$eval('h2', (element) => element.innerText);
            const url = await div.$eval("a[class='a-link-normal s-underline-text s-underline-link-text s-link-style a-text-normal']", (element) => element.href);
            let price = await div.$eval("span[class='a-price-whole']", (element) => element.innerText);
            const decimals = await div.$eval("span[class='a-price-fraction']", (element) => element.innerText);

            price = price.replace("\n", "") + decimals;

            const article = {
            title,
            url,
            price,
            };

            articles.push(article);
            //console.log(article);
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