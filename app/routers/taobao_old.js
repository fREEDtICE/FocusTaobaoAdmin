var taobao = require("taobao"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    validator = require('validator'),
    catMag = require("../models/CategoryManager"),
    mem = require("../datas/MemManager").getMem("taopaoapi"),
    httphelper = require("../../utils/HttpHelper");


var OrderExports = require("../models/Order"),
    Order = OrderExports.model,
    OrderItem = OrderExports.itemModel;

module.exports = function (app) {
//    var productTmpl = swig.compileFile(path.join(__dirname, "../views/product_list.html"));

    function cacheWaterfall(key, params, callback) {
        var args = arguments;

        async.waterfall([
            function (cb) {
                mem.get(key, function (err, data) {
                    cb(err, data);
                });
            },

            function (data, cb) {
                if (!data) {
                    var lifetime;
                    if (args.length > 3) {
                        lifetime = args[2];
                    }
                    lifetime = (lifetime instanceof Number) ? lifetime : 60 * 60 * 24;
                    taobao.core.call(params, function (data) {
                        mem.set(key, data, lifetime, function (err) {
                            return cb(err, data)
                        });
                    });
                } else {
                    return cb(null, data);
                }
            }
        ], function (err, result) {
            callback = args[args.length - 1];
            if (callback instanceof Function) {
                callback(err, result);
            }
        });
    };

    app.get("/cat/list/:cid", function (req, res, next) {
        var cid = req.params.cid;
        if (!cid || !validator.isNumeric(cid)) {
            return httphelper.errorResponse(res);
        }
    });

    app.get("/tpi/item/details/:id", function (req, res, next) {
        var id = req.params.id, t;
        if (validator.isNumeric(id)) {
            t = "num_iid"
        } else if (typeof id === "string") {
            t = "track_iid";
        } else {
            return httphelper.errorResponse(res);
        }


        if (!(validator.isNumeric(id) || esca)) {

        }

        cacheWaterfall("taobao.item.get." + pid, {
            method: "taobao.product.get",
            fields: "product_id, outer_id, created, tsc, cid, cat_name, props, props_str, binds_str, sale_props_str, product_imgs, name, binds, sale_props, " +
                "price, desc, pic_url, modified, product_prop_imgs, status, vertical_market, customer_props, property_alias",
            product_id: pid
        }, function (err, result) {
            if (err || !result.product_get_response || !result.product_get_response.product) {
                return res.render('404');
            }
//            return res.render("product_details", {product: result.product_get_response.product});
            return res.render("product_details", { product: result.product_get_response.product });
        });
    });

    app.get("/tpi/product/details/:cid/:pid", function (req, res, next) {
        var cid = req.params.cid, pid = req.params.pid;
        if (!(validator.isNumeric(cid) && validator.isNumeric(pid))) {
            return httphelper.errorResponse(res);
        }
        cacheWaterfall("taobao.product.get." + pid, {
            method: "taobao.product.get",
            fields: "product_id, outer_id, created, tsc, cid, cat_name, props, props_str, binds_str, sale_props_str, product_imgs, name, binds, sale_props, " +
                "price, desc, pic_url, modified, product_prop_imgs, status, vertical_market, customer_props, property_alias",
            product_id: pid
        }, function (err, result) {
            if (err || !result.product_get_response || !result.product_get_response.product) {
                return res.render('404');
            }
//            return res.render("product_details", {product: result.product_get_response.product});
            return res.render("product_details", { product: result.product_get_response.product });
        });
    });


//    app.get("/tpi/auth/itemcat/get", function (req, res, next) {
//        cacheWaterfall("taobao.itemcats.authorize.get.all", {
//            method: 'taobao.itemcats.authorize.get',
//            fields: 'brand.vid, brand.name, item_cat.cid, item_cat.name, item_cat.status,item_cat.sort_order,item_cat.parent_cid,item_cat.is_parent, xinpin_item_cat.cid, ' +
//                'xinpin_item_cat.name, xinpin_item_cat.status, xinpin_item_cat.sort_order, xinpin_item_cat.parent_cid, xinpin_item_cat.is_parent'
//        }, function (err, result) {
//            if (err) {
//                return res.render('404.html');
//            } else {
//                return httphelper.JSONResponse(result);
//            }
//        });
//    });

    app.get('/', function (req, res, next) {
//        cacheWaterfall("taobao.itemcats.get.all", {
//            method: 'taobao.itemcats.get',
//            fields: 'cid,parent_cid,name,is_parent,status',
//            "parent_cid": "0"
//        }, function (err, result) {


        catMag.getCats(function (err, data) {
            if (err) {
                return res.render('404');
            }
            else {
                return res.render("cus_main", {cats: data});
            }
        });
//        });
    });

//    app.get("/tpi/tmall/discounts/search", function (req, res, next) {
//        var cat = req.query.cat;
//        if (!cat) {
//            httphelper.errorResponse(res);
//        }
//
//        var start = parseInt(req.query.start) || 1,
//            columns = parseInt(req.query.cols) || 3;
//        columns = columns > 0 && columns < 6 ? columns : 3;
//
//        taobao.core.call({
//            method: 'tmall.items.discount.search',
//            "cat": cat,
//            "start": start
//        }, function (data) {
//            console.log(data);
////            if (!data || !data.tbk_items_get_response || !data.tbk_items_get_response.tbk_items) {
//            return res.render('404');
////            }
////            res.render('taobaoke_item_list', {
////                columns: columns,
////                colWidth: 12 / columns,
////                pageNo: page_no,
////                pageSize: page_size,
////                products: data.tbk_items_get_response.tbk_items.tbk_item,
////                total: data.tbk_items_get_response.total_results
////            });
//        });
//    });


    app.get("/tpi/tbk/list/:cid", function (req, res, next) {
        var cid = req.params.cid;
        if (!cid || !validator.isNumeric(cid)) {
            httphelper.errorResponse(res);
        }

        var page_no = parseInt(req.query.pageno) || 1,
            page_size = parseInt(req.query.pagesize) || 50,
            columns = parseInt(req.query.cols) || 3;
        page_size = page_size > 100 ? 40 : page_size;
        columns = columns > 0 && columns < 6 ? columns : 3;

        taobao.core.call({
            method: 'taobao.tbk.items.get',
            fields: 'num_iid,seller_id,nick,title,volume,pic_url,item_url,shop_url',
            sandbox: true,
            "cid": cid,
            "page_no": page_no,
            "page_size": page_size
        }, function (data) {
            console.log(data);
            if (!data || !data.tbk_items_get_response || !data.tbk_items_get_response.tbk_items) {
                return res.render('404.html');
            }
            res.render('taobaoke_item_list', {
                columns: columns,
                colWidth: 12 / columns,
                pageNo: page_no,
                pageSize: page_size,
                products: data.tbk_items_get_response.tbk_items.tbk_item,
                total: data.tbk_items_get_response.total_results
            });
        });
    });


//    app.get("/tpi/items/tmall/selected/list", function (req, res, next) {
//        var cid = req.query.cid;
//        if (!cid || !validator.isNumeric(cid)) {
//            return httphelper.errorResponse(res);
//        }
//
//        cacheWaterfall("temai.tmall.com", {
//
//        }, function (err, result) {
//            if (err) {
//                return req.render("404");
//            }
//
//
//        });
//    });

    app.get("/tpi/product/list", function (req, res, next) {
        var cid = req.query.cid;
        if (!cid || !validator.isNumeric(cid)) {
            return httphelper.errorResponse(res);
        }

        var page_no = parseInt(req.query.pageno) || 1,
            page_size = 40,
//            page_size = parseInt(req.query.pagesize) || 48,
            columns = parseInt(req.query.cols) || 4;
//        page_size = page_size > 100 ? 50 : page_size;
        columns = (columns > 2 && columns < 8) ? columns : 4;

        var key = "tpi.product.list." + cid + "." + ((page_no - 1) * page_size) + "-" + (page_no * page_size);

        cacheWaterfall(key, {
            method: 'taobao.products.search',
            fields: 'product_id,name,pic_url,cid,props,price,tsc',
            "cid": cid,
            "page_no": page_no,
            "page_size": page_size
        }, function (err, result) {
            if (err || !result.tbk_items_get_response || !result.tbk_items_get_response.tbk_items) {
                return res.render('404');
            }
            console.log(result.tbk_items_get_response.tbk_items);
            console.log(result.tbk_items_get_response.total_results);
            return res.render("product_list", {
                columns: columns,
                colWidth: 12 / columns,
                pageNo: page_no,
                cid: cid,
                pageSize: page_size,
                products: result.products_search_response.products.product,
                total: result.products_search_response.total_results
            });
        });
    });
};