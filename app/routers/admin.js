var async = require("async"),
    fs = require("fs"),
    validator = require("validator"),
    mkdirp = require("mkdirp"),
    path = require("path");


var Admin = require("../models/Admin").model,
    HttpHelper = require("../../utils/HttpHelper"),
    constants = require("../datas/Constants"),
    status = require("../datas/ResponseStatusCode").ResponseStatusCode,
    VerifyCodeHelper = require("../../utils/VerifyCodeHelper"),
    EncryptHelper = require("../../utils/EncryptHelper");

module.exports = exports = function (app) {
    app.get("/super/login", function (req, res, next) {
        if (req.session.super) {
            return res.location("/super/main");
        } else {
            return res.render("admin_login");
        }
    });


    app.get('/tools/verify', function (req, res) {
        var reportCode = validator.toInt(req.query.reportCode),
            random = validator.toFloat(req.query.random);

        if (!reportCode || !random || reportCode != 105) {
            return res.render('404', {});
        }

        VerifyCodeHelper.generateVerifyCode(req, res, function (err, vcode, buf) {
            if (err) {
                return HttpHelper.JSONResponse(res, {errorCode: status.system_err});
            }
            req.session.verifycode = vcode.toLowerCase();
            res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': Buffer.byteLength(buf) });
            res.end(buf);
        });
    });

    app.get("/super/setup", function (req, res, next) {
        return res.render("admin_setup");
    });

    app.get("/super/main", function (req, res, next) {
        return res.render("admin_main", req.session.super);
    });


    app.post('/super/login', function (req, res, next) {
        var token = validator.toString(req.body.token),
            pwd = validator.toString(req.body.pwd);


        console.log("token = %s, pwd = %s", token, pwd);

        if (!token || !pwd) {
            return HttpHelper.errorResponse(res);
        }

        async.waterfall([
            function (callback) {
                Admin.findOne({token: token}, function (err, data) {
                    callback(err, data);
                });
            },
            function (user, callback) {
                if (!user) {
                    return callback('user not exists');
                }
                EncryptHelper.validatePassword(pwd, user.salt, user.pwd, function (err, result) {
                    callback(err, user, result);
                })
            },
            function (user, match, callback) {
                if (!match) {
                    return callback('wrong password');
                }

                if (match) {
                    EncryptHelper.generateLoginToken(user, HttpHelper.getClientIP(req), function (err, result) {
                        callback(err, {token: result, user: {token: user.token, _id: user._id, roles: user.roles}});
                    });
                }
            },
            function (user, callback) {
                async.each(constants.getAdminLocalFolders(), function (p, callback) {
                        var local = path.join(p, user.token);
                        fs.exists(local, function (exists) {
                            if (!exists) {
                                mkdirp(local, function (err) {
                                    callback(err, user);
                                });
                            }
                        });
                    },
                    function (err, result) {
//                        if (err) {
//                            console.log(err);
//                        }
                        callback(err, user);
                    });
            }
        ], function (err, result) {
            if (err) {
                var errorCode = 1;
                switch (err) {
                    case 'user not exists':
                        errorCode = status.acc_not_exists;
                        break;
                    case 'wrong password':
                        errorCode = status.wrong_password;
                        break;
                    default:
                        errorCode = status.system_err;
                }
                return HttpHelper.JSONResponse(res, {errorCode: errorCode});
            } else{
                res.location('/super/main');
                req.session.super = result;
                res.end();
            }
//            res.cookie('ut', result.token, { signed: true, maxAge: 60 * 1000 * 10 });
//            return HttpHelper.JSONResponse(res, {result: 'success'});
        });
    });


    app.post('/super/add', function (req, res) {
        var token = req.body.token,
            pwd = req.body.pwd,
            type = req.body.adt,
            verify = req.body.verify;

        if (!verify) {
            return HttpHelper.JSONResponse(res, {errorCode: status.need_verify});
        }


        verify = verify.toLowerCase();

        if (verify != req.session.verifycode) {
            return HttpHelper.JSONResponse(res, {errorCode: status.verify_not_match});
        }

        async.waterfall([
            function (callback) {
                Admin.findOne({token: token}, function (err, data) {
                    callback(err, data);
                });
            },
            function (user, callback) {
                if (user) {
                    return callback('user exists');
                }
                EncryptHelper.generatePassword(pwd, function (err, salt, key) {
                    callback(err, salt, key);
                });
            },
            function (salt, key, callback) {
                var user = new Admin({
                    token: token,
                    pwd: key,
                    salt: salt,
                    roles: [type],
                    status: 1,
                    lastLogin: null
                });

                user.save(function (err) {
                    callback(err);
                });
            }
        ], function (err, callback) {
            if (err) {
                var errorCode = 1;
                switch (err) {
                    case 'user exists':
                        errorCode = status.acc_been_reg;
                        break;
                    default:
                        errorCode = status.system_err;
                }

                return HttpHelper.errorResponse(req, {errorCode: errorCode});
            }
            res.location('/super/login');
            return HttpHelper.JSONResponse(res, {result: 'success'});
        });

//        Admin.findOne({token: token}, function (err, data) {
//            if (err) {
//                return HttpHelper.JSONResponse(res, {errorCode: 1});
//            }
//
//            if (data) {
//                return HttpHelper.JSONResponse(res, {errorCode: 2});
//            }
//
//            EncryptHelper.generatePassword(pwd, function (err, salt, key) {
//                if (err) {
//                    return HttpHelper.JSONResponse(res, {errorCode: 1});
//                }
//
//                var user = new Admin({
//                    token: token,
//                    pwd: key,
//                    salt: salt,
//                    roles: ['admin']
//                });
//
//                user.save(function (err) {
//                    if (err) {
//                        return HttpHelper.JSONResponse(res, {errorCode: 1});
//                    }
//
//
//                    return HttpHelper.JSONResponse(res, {result: 'success'});
//                });
//            });
//        });
    });
};