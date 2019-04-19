const http = require('http');

function get(url, callback) {
    http
        .get(url, resp => {
            let data = '';

            // A chunk of data has been recieved.
            resp.on('data', chunk => {
                data += chunk;
            });

            // The whole response has been received. Print out the result.
            resp.on('end', () => {
                callback(data);
            });
        })
        .on('error', err => {
            console.log('Error: ' + err.message);
        });
}

module.exports = { get };
