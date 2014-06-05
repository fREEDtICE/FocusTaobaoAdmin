/**
 * Module dependencies.
 */

var express = require('express'),
    http = require('http'),
    path = require('path'),
//    io = require('socket.io'),
    session = require('express-session'),
    winston = require('winston'),
    helmet = require('helmet'),
    taobao = require('taobao');

var RedisStore = require('connect-redis')(session);
//        sesion_mongo = require('connect-mongo')(express);
var swig = require('swig');
var pkg = require('../package.json');
//var langMng = require("../app/models/LangDictManager");
var env = process.env.NODE_ENV || 'development';

module.exports = function (app, config, passport) {

    app.set('showStackError', true)

    // 设定端口
    app.set('port', process.env.PORT || 8000);

    // 设置视图模板, 使用swig
    app.engine('html', swig.renderFile);
    app.set('view engine', 'html');
    app.set('views', config.root + "/app/views");

    // 配置swig
    require("./template")(app, swig);

    app.use(express.favicon());

    // 配置日志
    // Use winston on production
    var log;
    if (env !== 'development') {
        log = {
            stream: {
                write: function (message, encoding) {
                    winston.info(message);
                }
            }
        }
    } else {
        log = 'dev';
    }
    // Don't log during tests
    if (env !== 'test') {
        app.use(express.logger(log))
    }
//    app.use(express.logger('dev'));
    app.use(express.urlencoded());
    app.use(express.json());

    // Helmet安全加固
    app.use(helmet.xframe());
    app.use(helmet.iexss());
    app.use(helmet.contentTypeOptions());
    app.use(helmet.cacheControl());

    app.use(express.methodOverride());

    // 开启压缩
    app.use(express.compress({
        filter: function (req, res) {
            return /json|text|javascript|css/.test(res.getHeader('Content-Type'))
        },
        level: 9
    }));

    // 静态文件配置
    app.use(express.static(config.root + '/public'));

    // cookie和session
    app.use(express.cookieParser(config.session.secret));
    app.use(express.session({
        secret: config.session.secret,
        store: new RedisStore({
            db: 'sessions',
            host: "localhost",
            port: 6379,
            ttl: 60 * 30
        }),
        cookie: { httpOnly: true }
    }));
    // FIXME 去掉cookie过期csrf才能正常工作,具体原因不明,待查
//    maxAge: 1000 * 30 * 60, expires: new Date(Date.now() + 1000 * 30 * 60),

    // 配置淘宝API
    taobao.config({
        app_key: config.taobao.app_key,
        app_secret: config.taobao.app_secret
    });

    // 初始化单例
    var singletons = require('../app/init')(app, config);


    // 启用CSRF插件, 防止CSRF攻击
    app.use(express.csrf());
    app.use(function (req, res, next) {
        res.locals.csrftoken = req.csrfToken();
        next();
    });

    // 初始化passport
    app.use(passport.initialize());
    app.use(passport.session());

    // Param验证中间件
    app.param(function (name, fn) {
        if (fn instanceof RegExp) {
            return function (req, res, next, val) {
                var captures;
                if (captures = fn.exec(String(val))) {
                    req.params[name] = captures;
                    next();
                } else {
                    next('route');
                }
            }
        }
    });

//app.set('socket.io', io.listen(8100));

    // 配置多语言管理
    app.use(function (req, res, next) {
        // 只有Get方法需要多语言支持
        if (req.method !== "GET") {
            return next();
        }

        // 获取当前语言设置, 按以下优先顺序返回:
        // 1.用户设置的偏好语言
        // 2.用户浏览器的首选语言
        // 3.默认: 英语
        function getLang(req) {
            return (req.cookies.fav_lang) || (req.acceptedLanguages && req.acceptedLanguages.length > 0 ?
                req.acceptedLanguages[0] : "en");
        };

        res.locals.langs = (function () {
            var lang = getLang(req);
            return singletons.LangManager.getDict(lang) || singletons.LangManager.getDict("en");
        })(req);
        next();
    });

    // 如果用户已经鉴权成功, 把用户信息放置到res本地缓存中
    app.use(function (req, res, next) {
        if (req.isAuthenticated() && req.user) {
            res.locals.user = req.user;
            req.locals.role = req.isAuthUserCustomer() ? 'customer' : req.user.role;
        }
        next();
    });


    // 路由配置
    require('./routes')(app, passport);

    // 出错时的500配置
    app.use(function (err, req, res, next) {
        // treat as 404
        if (err.message
            && (~err.message.indexOf('not found')
                || (~err.message.indexOf('Cast to ObjectId failed')))) {
            return next();
        }

        // log it
        // send emails if you want
        console.error(err.stack)

        // error page
        res.status(500).render('500', { error: err.stack })
    });

    // 找不到网页的404配置
    app.use(function (req, res, next) {
        res.status(404);

        // respond with html page
        if (req.accepts('html')) {
            res.render('404', { url: req.url });
            return;
        }

        // respond with json
        if (req.accepts('json')) {
            res.send({ error: 'Not found' });
            return;
        }

        // default to plain-text. send()
        res.type('txt').send('Not found');
    });


// development only
    if ('development' == app.get('env')) {
        app.use(express.errorHandler());
    }
    ;
}