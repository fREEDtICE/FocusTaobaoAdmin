/**
 * Module dependencies.
 */

//var cluster = require('cluster');

//if (cluster.isMaster) {
//    // Count the machine's CPUs
//    var cpuCount = require('os').cpus().length;
//
//    // Create a worker for each CPU
//    for (var i = 0; i < cpuCount; i += 1) {
//        cluster.fork();
//    }
////
//    cluster.on('listening', function (worker) {
//        console.log('Worker ' + worker.id + ' listening :)');
//    });
//    cluster.on('exit', function (worker) {
//        // Replace the dead worker,
//        // we're not sentimental
//        console.log('Worker ' + worker.id + ' died :(');
//        cluster.fork();
//
//    });
//} else if (cluster.isWorker) {
var fs = require('fs'),
    express = require('express'),
    http = require('http'),
    passport = require('passport');


var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];


require('./config/database')(config);

var models_path = __dirname + '/app/models';
fs.readdirSync(models_path).forEach(function (file) {
    if (~file.indexOf('.js')) {
        require(models_path + '/' + file);
    }
});

// bootstrap passport config
require('./config/passport')(passport, config);
var app = express();

exports.expressApp = app;

// Bootstrap routes
//require('./config/routes')(app, passport);

// express settings
require('./config/express')(app, config, passport);


//    var express = require('express'),
//        http = require('http'),
//        path = require('path'),
////    io = require('socket.io'),
//        session = require('express-session'),
//        helmet = require('helmet'),
//        taobao = require('taobao');
//
//    var app = express();
//
//    var app_config = require('./app_config');
////
//    var mongoose = require('mongoose'),
////        sesion_mongo = require('connect-mongo')(express);
//        RedisStore = require('connect-redis')(session);
//
//    var swig = require('swig');
//
//    var routers = require('./routers/main'),
//        langMng = require("./models/LangDictManager"),
//        MemMng = require("./datas/MemManager"),
//        util = require("./utils/CommonUtils");
//
//// all environments
//    app.set('port', process.env.PORT || 8000);
//    app.engine('html', swig.renderFile);
//    app.set('view engine', 'html');
//    app.set('views', path.join(__dirname, 'views'));
////app.set('view engine', 'jade');
//
//    app.set('view cache', false);
//// To disable Swig's cache, do the following:
//    swig.setDefaults({ cache: false });
//
//    app.use(express.compress({
//        filter: function (req, res) {
//            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
//        },
//        level: 9
//    }));
//
//    app.use(express.favicon());
//    app.use(express.logger('dev'));
//    app.use(express.json());
//    app.use(express.urlencoded());
//
//    app.use(helmet.xframe());
//    app.use(helmet.iexss());
//    app.use(helmet.contentTypeOptions());
//    app.use(helmet.cacheControl());
//    app.use(express.methodOverride());
//    app.use(express.cookieParser(app_config.session_config.cookie_secret));
//    app.use(express.session({
//        secret: app_config.session_config.cookie_secret,
//        store: new RedisStore({
//            db: 'focustaobao',
//            host: "localhost",
//            port: 6379,
//            ttl: 60 * 10
//        }),
//        cookie: { maxAge: 60 * 1000 * 30, expires: new Date(Date.now() + 60 * 1000 * 30), httpOnly: true }
//    }));
//
//    var connect = function () {
//        mongoose.connect(app_config.mongodb_uri, app_config.mongodb_options);
//    }
//    connect();
//
//// Error handler
//    mongoose.connection.on('error', function (err) {
//        console.log(err);
//    })
//
//// Reconnect when closed
//    mongoose.connection.on('disconnected', function () {
//        connect();
//    })
//
////    mongoose.connect(app_config.mongodb_uri, app_config.mongodb_login_info);
//
//    taobao.config({
//        app_key: app_config.taobao_api.app_key,
//        app_secret: app_config.taobao_api.app_secret
//    });
//
//    app.use(express.static(path.join(__dirname, 'public')));
//
//    app.use(express.csrf({
//        value: function (req) {
////            var v = rc.get(req.session._csrfSecret);
////            console.log("sync get --->" + v);
////            rc.get(req.session._csrfSecret, function (err, reply) {
////                console.log(req.session._csrfSecret);
////                console.log(err);
////                console.log(reply);
////                return reply;
////            });
//            return req.session.__csrf;
//        }
//    }));
//    app.use(function (req, res, next) {
//        var csrftoken = req.csrfToken();
//        res.locals.csrftoken = csrftoken;
//        req.session.__csrf = csrftoken;
////        if (req.session._csrfSecret) {
////            var token = req.csrfToken();
////            rc.set(req.session._csrfSecret, token, function (err, reply) {
////                next();
////            });
////        }
////        res.locals.csrftoken = req.csrfToken();
//        next();
//    });
//
//    app.param(function (name, fn) {
//        if (fn instanceof RegExp) {
//            return function (req, res, next, val) {
//                var captures;
//                if (captures = fn.exec(String(val))) {
//                    req.params[name] = captures;
//                    next();
//                } else {
//                    next('route');
//                }
//            }
//        }
//    });
//
//    swig.setFilter('basicmath', function (a, b, opt) {
//        if (arguments.length < 3) {
//            return a;
//        }
//
//        if (isNaN(a) || isNaN(b) || a === "" || b === "") {
//            return "invalid args";
//        }
//
//        if (!/[\+\-\*\/%]/.test(opt)) {
//            return "invalid operator";
//        }
//
//        return new Function('a', 'b', 'opt', 'return a opt b;')(a, b, opt);
//    });
//
//    swig.setFilter("contains", function (input) {
//        var arr = arguments[0];
//        if (arguments.length > 1) {
//            input = arguments[1];
//        }
//        return util.inArray(arr, input);
//    });
//
//    swig.setFilter("inlinestr", function (input) {
//        if ("string" === typeof input) {
//            return input.replace(/\n\t/g, "");
//        }
//
//        return input;
//    });
//
////app.set('socket.io', io.listen(8100));
//
//    MemMng.init(app_config.memcache_cfg.host, app_config.memcache_cfg.option);
//
////app.set('lang_mng', langMng);
//
//    app.use(function (req, res, next) {
//        if (req.method !== "GET") {
//            return next();
//        }
//
//        console.log(req.accepted);
//
//        function getLang(req) {
//            return (req.cookies.fav_lang) || (req.acceptedLanguages && req.acceptedLanguages.length > 0 ?
//                req.acceptedLanguages[0] : "en");
//        };
//
//        res.locals.langs = (function () {
//            var lang = getLang(req);
////        var langDict = langMng.getDict(lang) || langMng.getDict("en");
//            return langMng.getDict(lang) || langMng.getDict("en");
//        })(req);
//        next();
//    });
//
//    routers(app);
//
//    app.use(function (err, req, res, next) {
//        console.log("err handler, err  ===> " + err);
//        if (err) {
//            return res.send(500);
//        }
//
//        console.log("404");
//
//        res.status(404);
//
//        // respond with html page
//        if (req.accepts('html')) {
//            res.render('404', { url: req.url });
//            return;
//        }
//
//        // respond with json
//        if (req.accepts('json')) {
//            res.send({ error: 'Not found' });
//            return;
//        }
//
//        // default to plain-text. send()
//        res.type('txt').send('Not found');
//    });

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function () {
    // chan
    if (process.getgid && process.setgid) {
        console.log('Current gid: ' + process.getgid());
        try {
            process.setgid(config.security.runtime.gid);
            console.log('New gid: ' + process.getgid());
        }
        catch (err) {
            console.log('Failed to set gid: ' + err);
        }
    }

    if (process.getuid && process.setuid) {
        console.log('Current gid: ' + process.getuid());
        try {
            process.setuid(config.security.runtime.uid);
            console.log('New gid: ' + process.getuid());
        }
        catch (err) {
            console.log('Failed to set uid: ' + err);
        }
    }


    console.log('Express server listening on port ' + app.get('port'));
});
//    console.log(app.routes);
//}