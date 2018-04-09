// Hafizh Budiman, 2018
// Promotion Scrapper

var request = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var fs = require('fs');

var dict = {};

var scrape_url = "https://m.bnizona.com/index.php/category/index/promo";

function scrapeCategory(url){
    return request(url).then(function(html){
        category = [];
        var $ = cheerio.load(html);

        $('.menu').find('li').each(function (idx, elem) {
            var title = $(elem).find('a').text();
            category.push({
                'link': $(elem).find('a').attr('href'),
                'title': $(elem).find('a').text()
            });
            dict[title] = [];
        });
        return category;
    });
}

function scrapeDetail(category) {
    return request(category.link).then(function(html) {
        var $ = cheerio.load(html);

        $('.list2').find('li').each(function (idx, body) {
            var detail = $(body).find('a');
            var title = category.title;
            dict[title].push({
                'link': $(detail).attr('href'),
                'thumbnail': $(detail).find('img').attr('src'),
                'merchantName': $(detail).children('.merchant-name').text(),
                'promoTitle': $(detail).children('.promo-title').text(),
                'validUntil': $(detail).children('.valid-until').text()
            });
        });	
        return dict;
    });
}

function scrape(url) {
    return scrapeCategory(url).then(function(category) {
        return Promise.map(category, scrapeDetail);
    });
}

function main(url) {
    scrape(url).then(function(result) {
        var json = JSON.stringify(result);
        fs.writeFile('result.json', json, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("Promotions successfully saved to result.json.");
        }); 
    })
}

main(scrape_url);