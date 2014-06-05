var httphelper = require("../../utils/HttpHelper"),
    auth = require('../../config/middlewares/authorization');

var _ = require('lodash'),
    async = require('async');

var mongoose = require('top-models').mongoose,
    Customer = mongoose.model('Customer'),
    Order = mongoose.model('Order');

exports.order = function (req, res, next, id) {
    Order.findOne({ _id: id }).exec(function (err, order) {
        if (err) {
            return next(err);
        }
        if (!order) {
            return next(new Error('Failed to load Order ' + id));
        }
        req.order = order;
        next();
    });
};