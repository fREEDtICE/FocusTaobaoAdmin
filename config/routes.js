/*!
 * Module dependencies.
 */

var async = require('async'),
    _ = require('lodash');

/**
 * Controllers
 */

var customers = require('../app/controllers/customers'),
    items = require('../app/controllers/items'),
    admins = require('../app/controllers/admins'),
    orders = require('../app/controllers/orders'),
    auth = require('./middlewares/authorization');

/**
 * Route middlewares
 */

var customerAuth = [auth.customer.requiresLogin, auth.customer.hasAuthorization],
    adminAuth = [auth.admin.requiresLogin, auth.admin.hasAuthorization],
    superAuth = _.clone(adminAuth);

superAuth.push(auth.admin.isSuper);

console.log(superAuth);

/**
 * Expose routes
 */

module.exports = function (app, passport) {
    app.get('/', customers.home);
    app.get('/items/d/:itemid', items.detail);
    app.post('/items/s/a/:itemid/:skuid', items.addToShoppingcart);
    app.get("/customer/order", auth.customer.requiresLogin, customers.makeOrder);
    app.post("/customer/order/new", auth.customer.requiresLogin, customers.newOrder);
    app.post("/customer/address/new", auth.customer.requiresLogin, customers.newAddress);
    app.get('/customer/:customerId/:orderId/pay', customerAuth, customers.pay);
    app.post('/customer/:customerId/:orderId/pay', customerAuth, customers.doPayment);
    app.get("/customer/showcart", customers.showcart);
    app.get("/customer/register", customers.register);
    app.get("/customer/login", customers.login);
    app.get("/customer/logout", customers.logout);
    app.get("/customer/:customerId/profile", customerAuth, customers.profile);
    app.get("/customer/:customerId/myorder", customerAuth, customers.myorder);
    app.post("/customer/login",
        passport.authenticate('customer', {
            failureRedirect: '/customer/login'
        }),
        auth.authCallback);
    app.post("/customer/register", customers.create);
    app.get("/customer/get-shoppingcart", customers.getShoppingCart);
    app.post("/customer/adjust-cart", customers.adjustCartItemQuantity);
    app.post("/customer/remove-cart-item", customers.removeCartItem);

    app.param('customerId', customers.customer);
    app.param('orderId', orders.order);

    app.get("/super/login", admins.login);
    app.post("/super/login",
        passport.authenticate('admin', {
            failureRedirect: '/admin/login'
        }),
        auth.adminAuthCallback);
    app.get("/super/:adminId/workspace", adminAuth, admins.workspace);

    app.get("/super/:adminId/usermng", superAuth, admins.userMng);

    app.get("/super/:adminId/authmng", superAuth, admins.authMng);

    app.post("/super/new", superAuth, admins.createAdmin);

    app.param('adminId', admins.admin);
}
