var fs = require('fs');
var http = require('http');
var JSONStream = require('JSONStream');
var jsdom = require('jsdom');
var child_process = require('child_process');
var jquery = fs.readFileSync("./jquery.js", "utf-8");

jsdom.env({
    url: 'http://www.beeradvocate.com/beer/profile/147/',
    src: [jquery],
    done: function(error, window) {
        if (error) {
            console.error(error);
            return;
        }
        var selector = '#baContent > div:nth-child(7) > table > tbody';

        function sixChildren() {
            return window.$(this).children().length == 6;
        }

        function getData() {
            return {
                name: window.$(this).children().first().text(),
                url: window.$(this).children().first().find('a').attr('href'),
                revs: parseInt(window.$(this).find('td:nth-child(5) b').text().replace(/,/g, ''))
            };
        }
        var table = window.$('table').get(3);
        var data = window.$(table).find('tbody').children().filter(sixChildren).slice(1).map(getData).get();

        window = null;

        data.map(function(beer) {
            var beerId = parseInt(beer.url.split('/').slice(-2));
            fs.mkdirSync('./pages/'+beerId);
            for (var start = 0; start < beer.revs; start += 25) {
                child_process.execSync('wget http://www.beeradvocate.com'+beer.url+' -O ./pages/'+beerId+'/'+start+'.html');
            }
        })
    }
});
