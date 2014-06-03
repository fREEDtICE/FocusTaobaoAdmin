var crypto = require('crypto');


exports.verifySignature = function (data, alg) {
    if (!data) {
        return false;
    }

    var algorithm = alg ? alg : "sha1";

    var echostr = data.echostr,
        nonce = data.nonce,
        timestamp = data.timestamp,
        signature = data.signature;
    if (!echostr || !nonce || !timestamp || !signature) {
        console.log('verify signature failed. para not valid. time %s, nonce %s, echo %s, signature %s', timestamp, nonce, echostr, signature);
        return false;
    }

//    var timegap = Date.now() - timestamp;

//    if (timegap > 3000 || timegap < 0) {
//        console.log('overtime or timegap invalid');
//        return false;
//    }

    var array = new Array(3);
    array.push(echostr);
    array.push(nonce);
    array.push(timestamp);
    array.sort();
    var baseStr = array.join('');
    var hash = crypto.createHash(algorithm);
    hash.update(baseStr);
    var cryptoStr = hash.digest('hex');

    return cryptoStr === signature;
};

exports.verifyUrlSignature = function (req, res, keys, alg) {

};

exports.verifyPostSignature = function (req, res, keys, alg) {
    var keys = keys ? keys : {
        echostr: 'echostr',
        nonce: 'nonce',
        timestamp: 'timestamp',
        signature: 'signature'
    };

    keys.echostr || (keys.echostr = 'echostr');
    keys.nonce || (keys.nonce = 'nonce');
    keys.timestamp || (keys.timestamp = 'timestamp');
    keys.signature || (keys.signature = 'signature');

    var data = {
        timestamp: req.body[keys.timestamp],
        nonce: req.body[keys.nonce],
        echostr: req.body[keys.echostr],
        signature: req.body[keys.signature]
    };

    return exports.verifySignature(data, alg);
};

exports.makeUrlSignature = function (req, res) {
};