const express = require('express'),
    chalk = require('chalk'),
    compression = require('compression'),
    bodyParser = require('body-parser'),
    morgan = require('morgan'),
    crypto = require('crypto'),
    fs = require('fs'),
    path = require('path'),
    cla = require('command-line-args'),
    { template } = require('lodash');

const { scrape } = require('./scrape');

const config = {
    port: '3000',
};

const app = express();
// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'w' });
app.use(morgan('combined', { stream: accessLogStream }));
app.use(morgan('common'));
app.use(compression());

//
// STATIC
//
app.use(
    '/static',
    express.static('static', {
        maxAge: 86400000,
        setHeaders: function(res, path, stat) {
            return crypto
                .createHash('sha256')
                .update(stat.mtime.getTime().toString(16) + '-' + stat.size.toString(16))
                .digest('hex');
        },
    })
);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.get('/', async function(req, res) {
    const tpl = template(fs.readFileSync('./index.html', 'utf8'), {
        interpolate: /{{([\s\S]+?)}}/g,
    });
    const url = req.query.url;
    let chapters = [];
    let pages = [];

    if (url) {
        await scrape(url).then(function(data) {
            chapters = chapters.concat(data.chapters);
            pages = pages.concat(data.pages);
        });
    }
    res.end(tpl({ url, chapters: JSON.stringify(chapters), pages: JSON.stringify(pages) }));
});

app.listen(config.port, function() {
    console.log(chalk.blue('Server up at http://localhost:' + config.port));
});
