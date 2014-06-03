var crypto = require('crypto');

function generatePassword(toEncrypt, callback) {
    crypto.randomBytes(64, function (err, buf) {
        if (err) {
            throw err;
        }
        var salt = buf;
        crypto.pbkdf2(toEncrypt, salt, 1000, 128, function (err, key) {
            if (err) {
                return  callback(err);
            } else {
                return callback(null, salt, key.toString('base64'));
            }
        });
    });
};


function validatePassword(input, salt, verify, callback) {
    crypto.pbkdf2(input, salt, 1000, 128, function (err, key) {
        if (err) {
            return callback(err);
        } else {
            return callback(null, key.toString('base64') == verify);
        }
    });
};

function generateEmailConfirmLink(email, salt) {
    var hasher = crypto.createHash("md5");
    var seed = email + '' + Math.random() + new Date();
    hasher.update(seed);
    return hasher.digest('base64').replace(/\+/g, "_").replace(/\//g, "-").replace(/=/g, "");
};

function generateLoginToken(user, ip, callback) {
    crypto.randomBytes(64, function (err, buf) {
        if (err) {
            console.log("encry gen token err! " + err);
            return callback(err);
        }
        try {
            var shasum = crypto.createHash('sha1');
            var key = buf.toString('base64') + ip + user + new Date().getTime();
            shasum.update(key);
            return callback(null, shasum.digest('hex'));
        } catch (ex) {
            console.log("gen token exr! " + err);
            return callback(ex);
        }
    });
};

exports.generatePassword = generatePassword;
exports.validatePassword = validatePassword;
exports.generateEmailConfirmLink = generateEmailConfirmLink;
exports.generateLoginToken = generateLoginToken;
