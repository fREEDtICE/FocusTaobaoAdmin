var topModels = require('top-models'),
    mongoose = topModels.mongoose;

var async = require("async"),
    _ = require("lodash"),
    validator = require("validator"),
    path = require("path");


var app = require('../../app').expressApp,
    Admin = mongoose.model("Admin"),
    Order = mongoose.model('Order'),
    Notification = mongoose.model("Notification"),
    httpHelper = require("../../utils/HttpHelper");

var DataBuilder = {
    'super': {
        'buildWorkspace': function (req, res) {
            return {};
        }
    },
    'admin': {
        'buildWorkspace': function (req, res) {
            return {};
        }
    },
    'buyer': {
        'buildWorkspace': function (req, res) {
            return {};
        }
    },
    'logistic': {
        'buildWorkspace': function (req, res) {
            return {};
        }
    },
    'customer_service': {
        'buildWorkspace': function (req, res) {
            return {};
        }
    }
};

exports.login = function (req, res) {
    return res.render("admin/login");
};

exports.createAdmin = function (req, res) {
    var admin = new Admin(req.body);
    console.log(admin);
    admin.save(function (err) {

    });
};


exports.admin = function (req, res, next, id) {
    Admin.findOne({ _id: id }).exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('Failed to load User ' + id));
        }
        req.admin = user;
        next();
    });
};

exports.workspace = function (req, res) {
    var role = req.admin.role;

    return res.render("admin/" + role + "/workspace", DataBuilder[role].buildWorkspace(req, res));
};

exports.userMng = function (req, res) {
    Admin.find({'role': {$ne: 'super'}}, {'hpwd': 0, 'salt': 0}, function (err, data) {
        if (err) {
            return res.render('500');
        } else {
            return res.render('admin/super/user_mng', {users: data, roles: topModels.models.Admin.Roles});
        }
    });
};

exports.authMng = function (req, res, next) {
    var sysRoutes = app.routes;
    var routes = {};
    _.forIn(sysRoutes, function (v, k) {
        if (!(k in routes)) {
            routes[k] = [];
            console.log('init key %s', k);
        }
        var array = routes[k];

        _.forEach(v, function (item) {
            if ('path' in item) {
                var path = item.path;
                if (~path.indexOf('super')) {
                    array.push(path);
                }
            }
        });
    });

    return res.render('admin/super/auth_mng', {routes: routes, roles: topModels.models.Admin.Roles});
};

