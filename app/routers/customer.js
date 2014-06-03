var taobao = require("taobao"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    validator = require('validator'),
    catMag = require("../models/CategoryManager"),
    mem = require("../datas/MemManager").getMem("taopaoapi"),
    httphelper = require("../../utils/HttpHelper");


var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var Customer = require("../models/Customer"),
    OrderExports = require("../models/Order"),
    Order = OrderExports.model,
    OrderItem = OrderExports.itemModel;

module.exports = function (app) {
    var shoppingCookieTime = 60 * 60 * 24 * 1000;

    function customerAuth(req, res, next) {
        console.log(req.session.cus);
        if (!req.session.cus) {
            req.session.backurl = req.url;
            return res.redirect("/cus/login");
        } else {
            res.locals.cus = req.session.cus;
            next();
        }
    };

//    app.post("/cus/shoppingcart/add/:cid/:pid", function (req, res, next) {
//        console.log(req.body);
//        var cid = validator.toInt(req.params.cid),
//            pid = validator.toInt(req.params.pid),
//            price = validator.toFloat(req.body.price),
//            name = validator.escape(validator.trim(req.body.name)),
//            img = validator.toString(req.body.img_url);
//        if (!validator.isNumeric(cid) || !validator.isNumeric(pid) || !validator.isFloat(price) || !validator.isURL(img) || !name) {
//            return httphelper.errorResponse(res);
//        }
//
//        var order = req.session.shoppingcart;
//        if (!order) {
//            order = {};
//            req.session.shoppingcart = order;
//        }
//
//        if (order[pid]) {
//            order[pid].quality = order[pid].quality + 1;
//        } else {
//            order[pid] = {
//                cid: cid,
//                productId: pid,
//                price: price,
//                quality: 1,
//                img_url: img,
//                name: name
//            };
//        }
//
//
//        res.cookie('shoppingcart', JSON.stringify(order), { maxAge: Date.now() + shoppingCookieTime, signed: true });
//
//        return httphelper.JSONResponse(res, {status: "success"});
//    });


    app.post("/cus/shoppingcart/add/item/:numiid", function (req, res, next) {
        var numiid = validator.toInt(req.params.numiid),
            price = validator.toFloat(req.body.price);
        if (!validator.isNumeric(numiid) || !validator.isFloat(price)) {
            console.log("err");
            return httphelper.errorResponse(res);
        }

        var order = req.session.shoppingcart;
        if (!order) {
            order = {};
            req.session.shoppingcart = order;
        }

        if (order[numiid]) {
            order[numiid].quantity = order[numiid].quantity + 1;
        } else {
            req.body.quantity = 1;
//            order[numiid] = JSON.stringify(req.body);
            order[numiid] = req.body;
        }


        console.log("order is:" + JSON.stringify(order));

        console.log("session is:" + JSON.stringify(req.session.shoppingcart));

        res.cookie('shoppingcart', JSON.stringify(order), { maxAge: Date.now() + shoppingCookieTime, signed: true });

        return httphelper.JSONResponse(res, {status: "success"});
    });

    app.get("/cus/showcart", function (req, res, next) {
        console.log(req.session.shoppingcart);
        res.render("cus_showcart", {"items": req.session.shoppingcart});
    });

    app.get("/cus/checkout", [customerAuth], function (req, res, next) {
        res.render("cus_checkout", {"items": req.session.shoppingcart});
    });

    app.get("/cus/login", function (req, res, next) {
        res.render("cus_login");
    });

    app.get("/cus/orders", [customerAuth], function (req, res, next) {
        res.render("cus_orders");
    });

    app.post("/cus/login", function (req, res, next) {
        console.log(req.body);
        req.session.cus = req.body.username;
        res.redirect(req.session.backurl || '/');
    });

    app.post("/cus/orders/new", [customerAuth], function (req, res, next) {
        var items = req.body.item_info, i = items.length;
        var order = new Order({
//            cusId: new ObjectId,
            items: []
        });

        while (i--) {
            try {
                var postItem = JSON.parse(items[i]);
                var orderItem = {
                    "productId": parseInt(postItem.num_iid),
                    "price": parseFloat(postItem.price),
                    "quantity": parseInt(postItem.quantity),
                    "taobaoInfo": postItem
                };
                console.log(orderItem);

                order.items.push(orderItem);
            } catch (ex) {
                console.log(ex);
            }
        }

        order.save(function (err) {
            console.log(err);
        });

        req.session.shoppingcart = null;
        res.clearCookie('shoppingcart');

        return res.redirect("/cus/orders");
    });
};
