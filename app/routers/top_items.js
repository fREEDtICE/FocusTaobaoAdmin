var tpi = require("./TOPExecutor"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    crypto = require('crypto'),
    validator = require('validator'),
    app_cfg = require("../../app_config"),
    topConstants = require("../datas/TOPConstants"),
    httphelper = require("../../utils/HttpHelper");


var OrderExports = require("../models/Order"),
    Order = OrderExports.model,
    OrderItem = OrderExports.itemModel;

module.exports = function (app) {
    var caller = new tpi({
        "key": "items",
        "memcachedRefreshTime": 60 * 30
    });
//    app.get("/cat/list/:cid", function (req, res, next) {
//        var cid = req.params.cid;
//        if (!cid || !validator.isNumeric(cid)) {
//            return httphelper.errorResponse(res);
//        }
//    });
//
    app.post("/tpi/item/alimama/convert", function (req, res, next) {
        var iid = validator.toInt(req.body.num_iid);
        if (!validator.isNumeric(iid)) {
            return httphelper.errorResponse(res);
        }

        var app_key = app_cfg.taobao_api.app_key,
            secret = app_cfg.taobao_api.app_secret,
            timestamp = new Date().getTime(),
            sign = secret + "app_key" + app_key + "timestamp" + timestamp + secret;
        console.log(sign);


        var signed = crypto.createHmac('md5', secret).update(sign).digest("hex").toUpperCase();
        console.log(signed);
        res.cookie("timestamp", timestamp);
        res.cookie("sign", signed);

        httphelper.JSONResponse(res, {"result": "success"});
    });

    app.get("/tpi/item/a/:numid", function (req, res, next) {
        var iid = validator.toInt(req.params.numid);
        if (!validator.isNumeric(iid)) {
            return httphelper.errorResponse(res);
        }

        var app_key = app_cfg.taobao_api.app_key,
            secret = app_cfg.taobao_api.app_secret,
            timestamp = new Date().getTime(),
            sign = secret + "app_key" + app_key + "timestamp" + timestamp + secret;
        console.log(sign);
        var signed = crypto.createHmac('md5', secret).update(sign).digest("hex").toUpperCase();
        res.cookie("timestamp", timestamp);
        res.cookie("sign", signed);
        caller.query({
            method: "taobao.item.get",
            num_iid: iid,
            fields: "title,detail_url"
        }, function (err, result) {
            var data = {numiid: iid};
            if (result && result.item_get_response && result.item_get_response.item) {
                data.url = result.item_get_response.item.detail_url;
                data.title = result.item_get_response.item.title;
            }
            console.log(data);
            res.render("taobaoke_convert", data);
        });
    });


    app.get("/tpi/item/details/:numid", function (req, res, next) {
        var id = validator.toInt(req.params.numid);

        if (!validator.isNumeric(id)) {
            return httphelper.errorResponse(res);
        }
        caller.query({
            method: "taobao.item.get",
            num_iid: id,
            fields: "desc,detail_url,num_iid,title,nick,type,cid,seller_cids,props,input_pids,input_str,pic_url,num,valid_thru,list_time,delist_time,stuff_status,location,price,post_fee,express_fee,ems_fee,has_discount,freight_payer,has_invoice,has_warranty,has_showcase,modified,increment,approve_status,postage_id,product_id,auction_point,property_alias,item_img,prop_img,sku,video,outer_id,is_virtual"
//            fields: "detail_url,click_url, num_iid, title, nick, type, desc, skus, props_name, created, item_imgs, prop_imgs, is_lightning_consignment, is_fenxiao, auction_point, " +
//                "property_alias, template_id, after_sale_id, is_xinpin, sub_stock, inner_shop_auction_template_id, outer_shop_auction_template_id, food_security, " +
//                "features, locality_life, desc_module_info, item_weight, item_size, with_hold_quantity, paimai_info, sell_point, valid_thru, outer_id, auto_fill," +
//                "custom_made_type_id, wireless_desc, barcode, global_stock_type, global_stock_country, cid, seller_cids, props, input_pids, input_str, pic_url, " +
//                "num, list_time, delist_time, stuff_status, location, price, post_fee, express_fee, ems_fee, has_discount, freight_payer, has_invoice, has_warranty," +
//                "has_showcase, modified, increment, approve_status, postage_id, product_id, is_virtual, is_taobao, is_ex, is_timing, videos, is_3D," +
//                "one_station, second_kill, violation, wap_desc, wap_detail_url, cod_postage_id, sell_promise"
//            method: "taobao.taobaoke.items.detail.get",
//            pid: 45630204,
//            num_iids: [id],
//            fields: "click_url,shop_click_url,seller_credit_score,num_iid,title,nick, detail_url,click_url, product_id, type, desc, skus, props_name, created, item_imgs, prop_imgs"
        }, function (err, data) {
            if (err || !data.item_get_response || !data.item_get_response.item) {
                return res.render("404");
            } else {
                var resultItem = {"item": data.item_get_response.item}, item = resultItem.item;
                if (item.property_alias && item.property_alias !== "") {
                    var props = {}, ps = property_alias.split(";"), i = ps.length;
                    while (i--) {
                        var p = ps[i],
                            pieces = p.split(":"),
                            pid = pieces[0],
                            vid = pieces[1],
                            name = pieces[pieces.length - 1];

                        var prop_family = props[pid];
                        if (!prop_family) {
                            prop_family = {};
                            props[pid] = prop_family;
                        }

                        if (!prop_family[vid]) {
                            var pitem = {};
                            pitem.name = name;
                            prop_family[vid] = pitem;
                        }
                    }

                    if (item.prop_imgs) {
                        var prop_imgs = item.prop_imgs.prop_img,
                            i = prop_imgs.length;
                        while (i--) {
                            var prop_img = prop_imgs[i],
                                properties = prop_img.properties.split(":"),
                                pid = properties[0],
                                vid = properties[1];
                            if (props[pid][vid]) {
                                props[pid][vid].prop_img = prop_img;
                            }
                        }
                    }

                    if (item.skus) {
                        var skus = item.skus.sku,
                            i = skus.length;
                        while (i--) {
                            var sku = skus[i],
                                pstr = sku.properties,
                                parr = pstr.split(";"),
                                j = parr.length;
                            while (j--) {
                                var pieces = parr[j].split(":"),
                                    pid = pieces[0],
                                    vid = pieces[1],
                                    pname = pieces[2],
                                    vname = pieces[3];

                                if (props[pid]) {
                                    props[pid].pname = pname;
                                }
                            }
                        }
                    }

                    result.props = props;

                    console.log(props);
                }
//                if (item.skus) {
//                    var skus = item.skus.sku,
//                        i = skus.length;
//                    var prop = {};
//                    while (i--) {
//                        var sku = skus[i];
//                        prop[sku.properties] = {};
//                        prop[sku.properties].sku = sku;
//                    }
//
//                    console.log(prop);
//
//                    if (item.prop_imgs) {
//                        var prop_imgs = item.prop_imgs.prop_img,
//                            i = prop_imgs.length;
//                        while (i--) {
//                            var prop_img = prop_imgs[i];
//                            if (prop[prop_img.properties]) {
//                                prop[prop_img.properties].prop_img = prop_img;
//                            }
//                        }
//                    }
//
//
//                    if (item.property_alias) {
//                        var paliass = item.property_alias.split(";"), i = paliass.length;
//                        while (i--) {
//                            var alias = paliass[i],
//                                key = alias.substring(0, alias.lastIndexOf(":")),
//                                value = alias.substr(alias.lastIndexOf(":") + 1);
//
//                            console.log(key);
//                            console.log(value);
//
//                            if (prop[key]) {
//                                prop[key].name = value;
//                            }
//                        }
//
//                        console.log(prop);
//                    }
//                    resultItem.prop = prop;
//                }
                return res.render("item_details", resultItem);
            }
        });
    });
//
//    app.get("/tpi/product/details/:cid/:pid", function (req, res, next) {
//        var cid = req.params.cid, pid = req.params.pid;
//        if (!(validator.isNumeric(cid) && validator.isNumeric(pid))) {
//            return httphelper.errorResponse(res);
//        }
//        cacheWaterfall("taobao.product.get." + pid, {
//            method: "taobao.product.get",
//            fields: "product_id, outer_id, created, tsc, cid, cat_name, props, props_str, binds_str, sale_props_str, product_imgs, name, binds, sale_props, " +
//                "price, desc, pic_url, modified, product_prop_imgs, status, vertical_market, customer_props, property_alias",
//            product_id: pid
//        }, function (err, result) {
//            if (err || !result.product_get_response || !result.product_get_response.product) {
//                return res.render('404');
//            }
////            return res.render("product_details", {product: result.product_get_response.product});
//            return res.render("product_details", { product: result.product_get_response.product });
//        });
//    });

    app.get("/tpi/tbk/list/:cid", function (req, res, next) {
        var cid = validator.toInt(req.params.cid);
        if (!validator.isNumeric(cid)) {
            httphelper.errorResponse(res);
        }

        var page_no = parseInt(req.query.pageno) || 1,
            page_size = topConstants.pageSize,
            columns = topConstants.validateCols(req.query.cols);

        caller.query({
            method: 'taobao.tbk.items.get',
            fields: 'num_iid,seller_id,nick,title,price,volume,pic_url,item_url,shop_url',
            "cid": cid,
            "page_no": page_no,
            "page_size": page_size
        }, function (err, data) {
            if (err || !data.tbk_items_get_response || !data.tbk_items_get_response.tbk_items) {
                return res.render("404");
            } else {
                return res.render("item_list", {
                    "columns": columns,
                    "colWidth": 12 / columns,
                    "total": 1,
                    "pageNo": page_no,
                    "pageSize": page_size,
                    "cid": cid,
                    "items": data.tbk_items_get_response.tbk_items.tbk_item
                });
            }
        });

//        taobao.core.call({
//            method: 'taobao.tbk.items.get',
//            fields: 'num_iid,seller_id,nick,title,volume,pic_url,item_url,shop_url',
//            sandbox: true,
//            "cid": cid,
//            "page_no": page_no,
//            "page_size": page_size
//        }, function (data) {
//            console.log(data);
//            if (!data || !data.tbk_items_get_response || !data.tbk_items_get_response.tbk_items) {
//                return res.render('404.html');
//            }
//            res.render('taobaoke_item_list', {
//                columns: columns,
//                colWidth: 12 / columns,
//                pageNo: page_no,
//                pageSize: page_size,
//                products: data.tbk_items_get_response.tbk_items.tbk_item,
//                total: data.tbk_items_get_response.total_results
//            });
//        });
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


    app.get("/tpi/convert", function (req, res, next) {
        var iid = validator.toInt(req.query.num_iid);
        if (!validator.isNumeric(iid)) {
            return httphelper.errorResponse(res);
        }

        var app_key = app_cfg.taobao_api.app_key,
            secret = app_cfg.taobao_api.app_secret,
            timestamp = new Date().getTime(),
            sign = secret + "app_key" + app_key + "timestamp" + timestamp + secret;
        console.log(sign);


        var signed = crypto.createHmac('md5', secret).update(sign).digest("hex").toUpperCase();
        console.log(signed);
        res.cookie("timestamp", timestamp);
        res.cookie("sign", signed);
        res.render("taobaoke_convert", {numiid: iid});
    });
};