const { get } = require('./helpers');
const cheerio = require('cheerio');
const { template } = require('lodash');

function scrape(url, callback) {
    const pom = new Promise(function(resolve, reject) {
        get(url, function(data) {
            const $ = cheerio.load(data);

            const chapters = [];
            $('select')
                .first()
                .find('option')
                .each((i, op) => {
                    chapters.push({
                        name: $(op).text(),
                        link: $(op).val(),
                    });
                });

            const pages = [];
            $('.img_container img').each((i, op) => {
                pages.push($(op).attr('src'));
            });

            callback && callback({ chapters, pages });
            resolve({ chapters, pages });
        });
    });
    return pom;
}

module.exports = {
    scrape,
};
