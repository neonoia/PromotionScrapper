var request = require('request-promise');
var cheerio = require('cheerio');
var Promise = require('bluebird');
var fs = require('fs');

var baseUrl = "https://m.bnizona.com/index.php/category/index/promo";

function listCategory(url) {
	return request(url)
		.then(function(result) {
			var category = [];
			var $ = cheerio.load(result);

			$('.menu').find('li').each(function(idx, elem) {
				category.push({
					'link': $(elem).find('a').attr('href'),
					'title': $(elem).find('a').text()
				});
			});
			return category;
		})
		.catch(function(err) {
			return Promise.reject(err);
		});
}

function listPromo(category) {
	return request(category.link)
		.then(function(result) {
			var promoList = [];
			var $ = cheerio.load(result);

			$('.list2').find('li').each(function(idx, elem) {
				var detail = $(elem).find('a');
				promoList.push({
					'link' : $(detail).attr('href'),
					'thumbnail' : $(detail).find('img').attr('src'),
					'merchantName' : $(detail).children('.merchant-name').text(),
					'promoTitle' : $(detail).children('.promo-title').text(),
					'validUntil' : $(detail).children('.valid-until').text()
				});				
            });	
			return promoList;
		})
		.catch(function(err) {
			return Promise.reject(err);
		});
}

function getAllPromo(url) {
	return listCategory(url)
		.then(function(category) {
			return Promise.map(category.title, listPromo);
		})
		.catch(function(err) {
			return Promise.reject(err);
		});
}

function mainScraper(baseUrl) {
    getAllPromo(baseUrl).then(function (result) {
        var json = JSON.stringify(result);
        fs.writeFile('result.json', json, 'utf8', function (err) {
            if (err) {
                return console.log(err);
            }

            console.log("The file was saved!");
        }); 
    }).catch(function (err) {
        console.error(err);
        var errMsg = {
            'error': 'Error has been encountered, check log for further info.'
        }
        res.status(500).send(errMsg);
    });
}

mainScraper(baseUrl);
