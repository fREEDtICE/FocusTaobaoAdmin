var tpi = require("./TOPExecutor")({
        "key": "cats",
        "memcachedRefreshTime": 60 * 30
    }),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    validator = require('validator'),
    CatMng = require('../models/CategoryManager'),
    httphelper = require("../../utils/HttpHelper");


var OrderExports = require("../models/Order"),
    Order = OrderExports.model,
    OrderItem = OrderExports.itemModel;

module.exports = exports = function (app) {
    app.get('/', function (req, res, next) {
//        CatMng.getCats(function (err, data) {
//            if (err) {
//                return res.render('404');
//            }
//            else {
//                return res.render("cus_main", {cats: data});
//            }
//        });
        return res.render("cus_main", {"cats": CatMng.getCats()});
    });
}