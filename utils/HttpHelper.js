var request = require("request"),
    fs = require("fs");

var HttpHelper = function () {
};

var ImgCache = {};

HttpHelper.getClientIP = function getIP(req) {
    var ip = req ? (req.header('x-forwarded-for') || req.connection.remoteAddress) : '';
    return ip;
}


HttpHelper.errorResponse = function (res, status) {
    var code = status || 404;
    res.writeHead(status || {});
    res.end();
};

HttpHelper.JSONResponse = function (res, data) {
    var jsonStr = JSON.stringify(data);
    res.writeHead(200, {
        'Content-Type': 'application/json;charset=utf-8',
        'Content-Encoding': 'utf-8',
        'charset': 'utf-8',
        'Content-Length': Buffer.byteLength(jsonStr)
    });
    res.end(jsonStr);
};

HttpHelper.downloadImage = function (path, url) {
    url = encodeURI(url);
    request({
        uri: url,
        method: "get",
        encoding: null
    }, function (err, response, body) {
        if (!err && response.statusCode === 404) {
            return console.log("img not exsists: %s, err: %s", url, err);
        }

        if (err || response.statusCode !== 200 || typeof body !== 'object') {
            console.log('err when downloading, will try again later!! err %s, body %s, url %s', err, body, url);
            ImgCache[url] = ImgCache[url] ? 1 : ImgCache[url]++;
            if (ImgCache[url] && ImgCache[url] <= 3) {
                return setTimeout(exports.downloadImage, 3000, path, url);
            }
        }

        if (response.headers['content-type'].indexOf('image') < 0) {
            console.log('not a img %s', url);
            ImgCache[url] = ImgCache[url] ? 1 : ImgCache[url]++;
            if (ImgCache[url] && ImgCache[url] <= 3) {
                return setTimeout(exports.downloadImage, 3000, path, url);
            }
        }

//        if (body.readUInt16BE(0) != 0xffd8 || body.readUInt16BE(body.length - 2) != 0xffd9) {
//            console.log('not a img %s', url);
//            return setTimeout(exports.downloadImage, 3000, path, url);
//        }

        fs.writeFile(path, body, function (err) {
            if (err) {
                console.log(err)
            }
            delete ImgCache[url];
        });
    });
};


module.exports = HttpHelper;
