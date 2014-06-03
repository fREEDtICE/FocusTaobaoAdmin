var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    Admin = mongoose.model('Admin'),
    Customer = mongoose.model("Customer");

var _ = require("lodash");

module.exports = function (passport, config) {
    // require('./initializer')

    passport.serializeUser(function (user, done) {
        done(null, {id: user.id, model: user.constructor.modelName});
    });

    passport.deserializeUser(function (id, done) {
        if (!"model" in id) {
            return done("invalid deserialize id object " + JSON.stringify(id));
        }
        switch (id.model) {
            case Customer.modelName:
                Customer.findOne({_id: id.id}, function (err, customer) {
                    done(err, customer);
                });
                break;

            case Admin.modelName:
                Admin.findOne({_id: id.id}, function (err, customer) {
                    done(err, customer);
                });
                break;

            default:
                done("unknown model " + id.model);
        }
    });
    // use local strategy
    passport.use("admin", new LocalStrategy({
            usernameField: 'token',
            passwordField: 'password'
        },
        function (token, pwd, done) {
            Admin.findOne({ token: token }, function (err, admin) {
                if (err) {
                    return done(err);
                }
                if (!admin) {
                    return done(null, false, { message: 'Unknown administrator' });
                }
                if (!admin.authenticate(pwd)) {
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, admin);
            })
        }
    ));

    passport.use("customer", new LocalStrategy({
            usernameField: 'email',
            passwordField: 'password'
        },
        function (email, pwd, done) {
            console.log("pass local customer, email = %s, pwd = %s", email, pwd);
            Customer.findOne({ email: email }, function (err, cus) {
                if (err) {
                    console.log(err);
                    return done(err);
                }
                if (!cus) {
                    console.log("Unknown customer");
                    return done(null, false, { message: 'Unknown customer' });
                }
                if (!cus.authenticate(pwd)) {
                    console.log("Invalid password");
                    return done(null, false, { message: 'Invalid password' });
                }
                return done(null, cus);
            })
        }
    ));

    var http = require('http')
        , req = http.IncomingMessage.prototype;

    req.isAuthUserCustomer = function () {
        return this.isAuthenticated() && this.user.constructor.modelName === Customer.modelName;
    };

    req.isAuthUserAdmin = function () {
        return this.isAuthenticated() && this.user.constructor.modelName === Admin.modelName;
    };

    !(function () {
        _.forEach(Admin.Roles, function (role) {
            var capitalizedRole = role.substring(0, 1).toUpperCase() + role.substring(1),
                functionName = 'is' + capitalizedRole;
            req[functionName] = function () {
                return this.isAuthUserAdmin() && this.user.role === role;
            }
        });
    }());
}
