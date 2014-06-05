var mongoose = require('top-models').mongoose,
    Customer = mongoose.model('Customer'),
    Order = mongoose.model('Order'),
    OrderStatus = mongoose.models.Order.OrderStatus;

//require('./config/database')(config);
var httphelper = require("../../utils/HttpHelper"),
    auth = require('../../config/middlewares/authorization');

var _ = require('lodash'),
    async = require('async');


var validator = require("validator");

var convertSignedCookies = function (object) {
    if (!object) {
        return {};
    }

    var parseTime = 0;
    while ((typeof object === 'string') && (parseTime < 3)) {
        try {
            object = JSON.parse(object);
        }
        catch (ex) {
            console.log(ex);
        }
        parseTime++;
    }

    return object;
};

var syncShoppingCart = function (req, res) {
    var cookieShoppingCart = req.signedCookies.shoppingcart;
    var resultCart;
    if (req.isAuthUserCustomer()) {
        console.log("is authenticated");
        if (cookieShoppingCart) {
            cookieShoppingCart = convertSignedCookies(cookieShoppingCart);
            req.user.cookieToCart(cookieShoppingCart);
            res.clearCookie("shoppingcart");
        }
        resultCart = req.user.shoppingcart;
    } else {
        cookieShoppingCart = convertSignedCookies(cookieShoppingCart);
        resultCart = [];
        _.forIn(cookieShoppingCart, function (v, k) {
            resultCart.push(v);
        });
    }
    return resultCart;
};


var shoppingCookieTime = 60 * 60 * 24 * 30 * 1000;

exports.getShoppingCart = function (req, res) {
    return httphelper.JSONResponse(res, syncShoppingCart(req, res));
};

exports.newAddress = function (req, res) {
    var customer = req.user;
    if (!("shippingAddress" in customer)) {
        customer.shippingAddress = [];
    }

    var address = JSON.parse(JSON.stringify(req.body));
    customer.shippingAddress.push(address);
    customer.save(function (err) {
        if (err) {
            return httphelper.errorResponse(res);
        } else {
            return httphelper.JSONResponse(res, {"result": "success"});
        }
    });
};


exports.register = function (req, res) {
    return res.render("customer/register", {
        customer: new Customer()
    });
};

exports.create = function (req, res, next) {
    var customer = new Customer(req.body);
    customer.save(function (err) {
        if (err) {
            console.log(err);
            return res.render('customer/register', {
                customer: customer
            });
        }

        // manually login the user once successfully signed up
        req.logIn(customer, function (err) {
            console.log(err);
            if (err) {
                return next(err);
            }
            auth.authCallback(req, res);
        });
    });
};

exports.customer = function (req, res, next, id) {
    Customer.findOne({ _id: id }).exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('Failed to load User ' + id));
        }
        req.customer = user;
        next();
    });
};

exports.login = function (req, res) {
    return res.render("customer/login");
};

exports.profile = function (req, res) {
    return res.render("customer/profile");
};

exports.logout = function (req, res) {
    req.logout();
    res.redirect('/customer/login');
};

exports.home = function (req, res) {
    return res.render("customer/home", {showcart: true});
};

exports.pay = function (req, res) {
    return res.render("customer/pay", {"order": req.order});
};

exports.newOrder = function (req, res) {
    var customer = req.user;
    var cart = customer.shoppingcart;
//    owner: {type: ObjectId, ref: Customer.schema, required: true},
//    items: [
//        {
//            skuid: Number,
//            detail_url: String,
//            title: String,
//            numiid: Number,
//            img: String,
//            sku_price: Number,
//            prom_price: Number,
//            price: Number,
//            props: String,
//            sel_prop: [
//                {
//                    cid: String,
//                    cname: String,
//                    id: String,
//                    name: String,
//                    alias: String
//                }
//            ],
//            status: {type: Number, required: true, default: ItemStatus.initialized},
//            quantity: Number
//        }
//    ],
//        commissionRate: {type: Number, default: 0.1},
//    money: {
//        paid: {type: Number, default: 0},
//        remain: {type: Number, default: 0}
//    },
//    status: {type: Number, required: true, default: 0},
//    shipAddress: {
//        zipCode: String,
//            addressee: {type: String, required: true},
//        addresseeContact: {type: String, required: true},
//        address: {type: String, required: true},
//        tag: String
//    }
    var newOrder = new Order({
        owner: customer._id,
        items: []
    });

    _.forEach(cart, function (item) {
        newOrder.items.push(item);
    });

    if ('tag' in req.body) {
        console.log(customer.shippingAddress);
        var shipping = _.find(customer.shippingAddress, {tag: req.body.tag});
        if (!shipping) {
            console.log("error! shipping tag not found!. tag is %s", req.body.tag);
            return httphelper.JSONResponse(res, {"result": "failed", "err": 1});
        }
        shipping.lastUseTime = Date.now();
        newOrder.shipAddress = shipping;
    } else {
        console.log("error! No shipping tag");
        return httphelper.JSONResponse(res, {"result": "failed", "err": 2});
    }

    customer.shoppingcart = [];

    async.parallel([
        function (cb) {
            customer.save(function (err) {
                return cb(err);
            });
        }, function (cb) {
            newOrder.save(function (err) {
                return cb(err);
            });
        }], function (err, result) {
        if (err) {
            return httphelper.JSONResponse(res, {"result": "failed", "err": 3});
        } else {
            return httphelper.JSONResponse(res, {"result": "success", "nextUrl": "/customer/" + customer._id + "/" + newOrder._id + "/pay"});
        }
    });
};

exports.appendToOldOrder = function (req, res) {

};


exports.doPayment = function (req, res) {
    var money = validator.toFloat(req.body.inputMoney);
    if (!validator.isFloat(money)) {
        // FIXME should go to error page.
        return httphelper.errorResponse(res);
    }

    var order = req.order;

    order.money.paid += money;
    order.status = OrderStatus.ItemPaid;


    order.save(function (err) {
        if (err) {
            return httphelper.errorResponse(res);
        } else {
            return res.render('customer/pay_success');
        }
    });
};


exports.showcart = function (req, res, next) {
    return res.render("customer/showcart", {"shoppingcart": syncShoppingCart(req, res)});
};

exports.makeOrder = function (req, res, next) {
    return res.render("customer/order", {"shoppingcart": syncShoppingCart(req, res)});
};

exports.myorder = function (req, res, next) {
    return res.render("customer/myorder");
};

exports.adjustCartItemQuantity = function (req, res, next) {
    var skuid = validator.toInt(req.body.skuid),
        quantity = validator.toInt(req.body.quantity);

    if (!validator.isInt(skuid) || !validator.isInt(quantity)) {
        return httphelper.errorResponse(res);
    }

    if (req.isAuthUserCustomer()) {
        req.user.adjustCartItemQuantity(skuid, quantity, function (err) {
            var result = err ? 'error' : 'success';
            return httphelper.JSONResponse(res, {"result": result});
        });
    } else {
        var result;
        var cookieShop = convertSignedCookies(req.signedCookies.shoppingcart);
        if (skuid in cookieShop) {
            cookieShop[skuid].quantity = quantity;
            res.cookie('shoppingcart', JSON.stringify(cookieShop), { expires: new Date(Date.now() + shoppingCookieTime), maxAge: shoppingCookieTime, httpOnly: true, signed: true });
            result = "success";
        } else {
            result = "not found";
        }
        return httphelper.JSONResponse(res, {"result": result});
    }
};

exports.removeCartItem = function (req, res, next) {
    var skuid = validator.toInt(req.body.skuid);


    if (!validator.isInt(skuid)) {
        return httphelper.errorResponse(res);
    }

    if (req.isAuthUserCustomer()) {
        req.user.removeCartItem(skuid, function (err) {
            var result = err ? 'error' : 'success';
            return httphelper.JSONResponse(res, {"result": result});
        });
    } else {
        var result;
        var cookieShop = convertSignedCookies(req.signedCookies.shoppingcart);
        if (skuid in cookieShop) {
            delete cookieShop[skuid];
            res.cookie('shoppingcart', JSON.stringify(cookieShop), { expires: new Date(Date.now() + shoppingCookieTime), maxAge: shoppingCookieTime, httpOnly: true, signed: true });
            result = "success";
        } else {
            result = "not found";
        }
        return httphelper.JSONResponse(res, {"result": result});
    }
};









