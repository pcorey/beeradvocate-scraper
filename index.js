// var mongo = require('mongodb').MongoClient;
//var mtrace = require('mtrace');
var fs = require('fs');
var http = require('http');
var JSONStream = require('JSONStream');
var jsdom = require('jsdom');
var jquery = fs.readFileSync("./jquery.js", "utf-8");

function processPage(url, start) {
    jsdom.env({
        url: 'http://www.beeradvocate.com'+url+'?start='+start,
        src: [jquery],
        done: function(error, window) {
            if (error) {
                console.error(error);
                return;
            }
            function parseRating() {
                var ratingsText = window.$(this).find('#rating_fullview_content_2 > .muted').first().text();
                var ratings = ratingsText ? ratingsText.split(' | ').map(function(s){return s.split(': ')[1]}) : [null, null, null, null, null];
                var result = {
                    user: parseInt(window.$(this).find('.username').attr('href').split('.')[1].slice(0, -1) || 0),
                    norm: parseFloat(window.$(this).find('.BAscore_norm').text() || 0),
                    look: parseFloat(ratings[0] || 0),
                    smell: parseFloat(ratings[1] || 0),
                    taste: parseFloat(ratings[2] || 0),
                    feel: parseFloat(ratings[3] || 0),
                    overall: parseFloat(ratings[4] || 0)
                };
                return result;
            }

            var containers = window.$('#rating_fullview_container');
            containers.map(parseRating).get().map(function (rating) {
                rating.beer = parseInt(url.split('/').slice(-2));
                console.log(JSON.stringify(rating)+',');
            });
            var length = containers.length;
            containers = null;
            if (length > 0 && start < 250) {
                // var mem = process.memoryUsage();
                // console.log('* '+mem.heapUsed+'/'+mem.heapTotal);
                window = null;
                processPage(url, start + 25);
            }
        }
    });
}

function processBeer(beer) {
    processPage(beer.url, 0);
    // var mem = process.memoryUsage();
    // console.log('~ '+mem.heapUsed+'/'+mem.heapTotal);
}

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
                url: window.$(this).children().first().find('a').attr('href')
            };
        }
        var table = window.$('table').get(3);
        var data = window.$(table).find('tbody').children().filter(sixChildren).slice(1).map(getData).get();

        window = null;

        data.map(processBeer);
    }
});

// if (mtrace.mtrace()) {
//     console.log('Saving mtrace to '+mtrace.mtrace());
// }

//mongo.connect('mongodb://localhost:27017/beeradvocate', function(err, db) {




    // var window = require('jsdom').jsdom().parentWindow;
    // var $ = require('jquery')(window),
    // XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

    // $.support.cors = true;
    // $.ajaxSettings.xhr = function() {
    //    return new XMLHttpRequest();
    // };

    // // var ratings = db.collection('ratings');
    // var response = $.ajax('http://www.beeradvocate.com/beer/profile/147/',{async: false}).responseText;
    // var stone = $.parseHTML(response);
    // var selector = '#baContent > div:nth-child(7) > table > tbody';

    // function sixChildren() {
    //     return $(this).children().length == 6;
    // }

    // function getData() {
    //     return {
    //         name: $(this).children().first().text(),
    //         url: $(this).children().first().find('a').attr('href')
    //     };
    // }

    // var table = $($(stone).find('table').get(3));
    // var data = table.find('tbody').children().filter(sixChildren).slice(1).map(getData).get();

    // function parseRating() {
    //     var ratingsText = $(this).find('#rating_fullview_content_2 > .muted').first().text();
    //     var ratings = ratingsText ? ratingsText.split(' | ').map(function(s){return s.split(': ')[1]}) : [null, null, null, null, null];
    //     var result = {
    //         user: parseInt($(this).find('.username').attr('href').split('.')[1].slice(0, -1) || 0),
    //         norm: parseFloat($(this).find('.BAscore_norm').text() || 0),
    //         look: parseFloat(ratings[0] || 0),
    //         smell: parseFloat(ratings[1] || 0),
    //         taste: parseFloat(ratings[2] || 0),
    //         feel: parseFloat(ratings[3] || 0),
    //         overall: parseFloat(ratings[4] || 0)
    //     };
    //     return result;
    // }

    // function getRatingContainers(url, start, callback) {
    //     http.get({
    //         host: 'www.beeradvocate.com',
    //         path: url + '?start=' + start
    //     }, function(req) {
    //         var res = '';
    //         req.on('data', function(chunk) {
    //             res += chunk;
    //         });
    //         req.on('end', function() {
    //             var html = $($.parseHTML(res));
    //             var containers = html.find('#rating_fullview_container');
    //             containers.map(parseRating).get().map(function (rating) {
    //                 rating.beer = parseInt(url.split('/').slice(-2));
    //                 //console.log(JSON.stringify(rating)+',');
    //             });
    //             var length = containers.length;
    //             $(window.document).remove();
    //             html = null;
    //             containers = null;
    //             callback(length, url, start);
    //         });
    //     });
    // }

    // // function getRatingContainers(url) {
    // //     var start = 0;
    // //     do {
    // //         var containers = $($.parseHTML($.ajax(url+'?start='+start, {async: false}).responseText)).find('#rating_fullview_container');
    // //         containers.get().map(parseRating).map(function (rating) {
    // //             rating.beer = parseInt(url.split('/').slice(-2));
    // //             //console.log(JSON.stringify(rating)+',');
    // //             // ratings.insert(rating, function(err, db) {
    // //             //     if (err) {
    // //             //         console.error(err);
    // //             //     }
    // //             // });
    // //         });
    // //         start += 25;
    // //     } while(containers.length > 0);
    // // }

    // data.map(function(beer){
    //     getRatingContainers(beer.url, 0, function callback(length, url, start) {
    //         var mem = process.memoryUsage();
    //         console.log('~ '+mem.heapUsed+'/'+mem.heapTotal);
    //         if (length > 0) {
    //             var mem = process.memoryUsage();
    //             console.log('* '+mem.heapUsed+'/'+mem.heapTotal);
    //             getRatingContainers(url, start + 25, callback);
    //         }
    //     });
    // });
//});

// var $ = require('jquery')(require('jsdom').jsdom().parentWindow),
//     XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest;

// $.support.cors = true;
// $.ajaxSettings.xhr = function() {
//    return new XMLHttpRequest();
// };

// var response = $.ajax('http://www.beeradvocate.com/beer/profile/147/',{async: false}).responseText;
// var stone = $.parseHTML(response);
// var selector = '#baContent > div:nth-child(7) > table > tbody';
// function sixChildren() {return $(this).children().length == 6;}
// function getData() {var e = $(this); return {name: e.children().first().text(), url: e.children().first().find('a').attr('href')}; }
// var data = $($(stone).find('table').get(3)).find('tbody').children().filter(sixChildren).slice(1).map(getData).get();

// function getRatingContainers(url) {
//     var start = 0;
//     var all = [];
//     do {
//         var containers = $($.parseHTML($.ajax(url+'?start='+start, {async: false}).responseText)).find('#rating_fullview_container');
//         all = all.concat(containers.get());
//         start += 25;
//     } while(containers.length > 0);
//     return all;
// }

// function parseRating(container) {
//     container = $(container);
//     var ratingsText = container.find('#rating_fullview_content_2 > .muted').first().text();
//     var ratings = ratingsText ? ratingsText.split(' | ').map(function(s){return s.split(': ')[1]}) : [null, null, null, null, null];
//     return {
//         user: container.find('.username').attr('href').split('.')[1].slice(0, -1),
//         norm: container.find('.BAscore_norm').text(),
//         look: ratings[0],
//         smell: ratings[1],
//         taste: ratings[2],
//         feel: ratings[3],
//         overall: ratings[4]
//     }
// }

// var ratings = data.reduce(function(all,beer){
//    all[beer.name] = getRatingContainers('http://www.beeradvocate.com'+beer.url).map(parseRating); return all;
// }, {});

// var fs = require('fs');
// var JSONStream = require('JSONStream');

// var stringify = JSONStream.stringify();
// var out = fs.createWriteStream('/home/pcorey/scraper/out.json');
// stringify.pipe(out);
// stringify.write(ratings);
// stringify.end();
// out.end();
