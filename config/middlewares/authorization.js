/*
 *  User authorization routing middleware
 */


var mongoose = require('top-models').mongoose,
    Customer = mongoose.model('Customer'),
    _ = require("lodash"),
    Roles = require('top-models').models.Admin.Roles,
    Admin = mongoose.model('Admin');

var makeAuthorization = function (prop, paramid) {
    console.log("make auth, prop %s, param %s", prop, paramid);
    return function (req, res, next) {
        if (req[prop].id != req.user.id) {
            var routePath = req.route.path.replace(paramid, req[prop].id);
            return res.redirect(routePath);
        }
        next();
    };
};

var makeRoleAuthorization = function (role) {
    return function (req, res, next) {
        if ("role" in req.admin && req.admin.role === role) {
            next();
        } else {
            return res.render('admin/not_auth');
        }
    };
};

var refreshLoginTime = function (req) {
    var user = req.user;
    if ("lastLogin" in user) {
        user.lastLogin = Date.now();
        user.save(function (err) {
        });
    }
};

var redirectTo = function (req, res, homepage) {
    var redirectTo = req.session.returnTo ? req.session.returnTo : homepage;
    delete req.session.returnTo;
    res.redirect(redirectTo);
};


exports.authCallback = function (req, res) {
    refreshLoginTime(req);
    redirectTo(req, res, '/');
};


exports.adminAuthCallback = function (req, res) {
    refreshLoginTime(req);
    redirectTo(req, res, '/super/' + req.user._id.toString() + '/workspace');
};

exports.customer = {
    hasAuthorization: makeAuthorization("customer", ":customerId"),
    requiresLogin: function (req, res, next) {
        if (req.isAuthUserCustomer()) {
            return next();
        }
        if (req.method === 'GET') {
            req.session.returnTo = req.originalUrl;
        }
        res.redirect('/customer/login');
    }
};

exports.admin = {
    hasAuthorization: makeAuthorization("admin", ":adminId"),
    requiresLogin: function (req, res, next) {
        if (req.isAuthUserAdmin()) {
            return next();
        }
        if (req.method === "GET") {
            req.session.returnTo = req.originalUrl;
        }
        res.redirect("/super/login");
    }
};

_.forEach(Roles, function (role) {
    var capitalizedRole = role.substring(0, 1).toUpperCase() + role.substring(1),
        functionName = 'is' + capitalizedRole;
    exports.admin[functionName] = makeRoleAuthorization(role);
});