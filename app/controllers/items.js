var httphelper = require("../../utils/HttpHelper"),
    tpi = require("../../utils/TOPExecutor"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    crypto = require('crypto'),
    topConstants = require("../datas/TOPConstants"),
    validator = require("validator");

var caller = new tpi({
    "key": "items",
    "memcachedRefreshTime": 60 * 30
});

var shoppingCookieTime = 60 * 60 * 24 * 30 * 1000;

exports.addToShoppingcart = function (req, res) {
    var numiid = validator.toInt(req.params.itemid), sku_id = validator.toInt(req.params.skuid);
    if (!validator.isNumeric(numiid) || !validator.isNumeric(sku_id)) {
        return httphelper.errorResponse(res);
    }

    var quantity = validator.toInt(req.body.q), price = validator.toFloat(req.body.p);
    if (!validator.isInt(quantity) || !validator.isFloat(price)) {
        return httphelper.errorResponse(res);
    }

    var shoppingcart = req.signedCookies.shoppingcart || {};
    var parseTime = 0;
    while ((typeof shoppingcart === 'string') && (parseTime < 3)) {
        try {
            shoppingcart = JSON.parse(shoppingcart);
        }
        catch (ex) {
            console.log(ex);
        }
        parseTime++;
    }
//    !validator.isJSON(req.body.sku) || !validator.isJSON(req.body.sel_prop) ||
    var selectedProps, sku, sid, item, img;
    try {
        selectedProps = JSON.parse(JSON.stringify(req.body.sel_prop));
        sku = JSON.parse(JSON.stringify(req.body.sku));
        item = JSON.parse(JSON.stringify(req.body.iteminfo));
        sid = parseInt(sku.id);
        img = req.body.i || item.img_url;
    } catch (ex) {
        console.log(ex);
    }


    if (!validator.isURL(item.detail_url)) {
        return httphelper.errorResponse(res);
    }

    if (sid !== sku_id) {
        console.log("sku id not match: 1 %s, 2 %s", sku.sku_id, sku_id);
        return httphelper.errorResponse(res);
    }

    console.log("sku id " + sid);

    if (req.isAuthUserCustomer()) {
        var shopItem = {
            "title": item.title,
            "skuid": sid,
            "numiid": numiid,
            "img": img,
            "detail_url": item.detail_url,
            "sku_price": sku.price,
            "price": price,
            "props": sku.props,
            "prom_price": sku.prom_price,
            "sel_prop": selectedProps,
            "quantity": quantity
        };
        req.user.addItemToShoppingCart(shopItem);
        return httphelper.JSONResponse(res, shopItem);
    } else {
        var result;
        if (sku.id in shoppingcart) {
            console.log("alreay in cart");
            result = JSON.parse(JSON.stringify(shoppingcart[sku.id]));
            result.quantity = quantity;
            shoppingcart[sku.id].quantity = shoppingcart[sku.id].quantity + quantity;
        } else {
            result = {
                "title": item.title,
                "skuid": sid,
                "numiid": numiid,
                "img": img,
                "detail_url": item.detail_url,
                "sku_price": parseFloat(sku.price),
                "price": price,
                "props": sku.props,
                "prom_price": parseFloat(sku.prom_price),
                "sel_prop": selectedProps,
                "quantity": quantity
            };
            console.log("new in cart");
            shoppingcart[sku.id] = result;
        }

        res.cookie('shoppingcart', JSON.stringify(shoppingcart), { expires: new Date(Date.now() + shoppingCookieTime), httpOnly: true, maxAge: shoppingCookieTime, signed: true });

        return httphelper.JSONResponse(res, result);
    }
};

exports.detail = function (req, res) {
    var id = validator.toInt(req.params.itemid);
    if (!validator.isNumeric(id)) {
        return httphelper.errorResponse(res);
    }


    var buildProperty = function (item) {
        var result = {
            props: {

            },
            skus: {

            }
        };
        if (item.skus && item.skus.sku.length) {
            for (var i = 0, max = item.skus.sku.length; i < max; i++) {
                var sku = item.skus.sku[i];
                result.skus[sku.properties] = sku;
                if (sku.properties_name) {
                    var properties = sku.properties_name.split(";");
                    var j = properties.length;
                    while (j--) {
                        var p = properties[j].split(":");
                        var cid = p[0], pid = p[1], cname = p[2], pname = p[3];
                        if (!result.props[cid]) {
                            result.props[cid] = {
                                "cid": cid,
                                "cname": cname,
                                props: {}
                            };
                        }

//                        result.props[cid].props.push({"pid": pid, "pname": pname});
                        result.props[cid].props[pid] = {"pid": pid, "pname": pname};
                    }
                }
            }
        }

        if (item.prop_imgs && item.prop_imgs.prop_img.length) {
            var imgs = item.prop_imgs.prop_img;
            for (var i = 0, max = imgs.length; i < max; i++) {
                var pimg = imgs[i],
                    prop = pimg.properties,
                    splits = prop.split(":"),
                    cid = splits[0],
                    pid = splits[1],
                    url = pimg.url;

                if (pid in result.props[cid].props) {
                    result.props[cid].props[pid].img_url = url;
                }
            }
        }

        if (item.property_alias) {
            var aliases = item.property_alias.split(";");
            for (var i = 0, max = aliases.length; i < max; i++) {
                var splits = aliases[i].split(":"),
                    cid = splits[0],
                    pid = splits[1],
                    alias = splits[2];

                if (pid in result.props[cid].props) {
                    console.log("find alias " + alias);
                    result.props[cid].props[pid].alias = alias;
                }
            }
        }

        return result;
    }

    async.parallel({
        promotion: function (cb) {
            caller.query({
                method: "taobao.ump.promotion.get",
                item_id: id
            }, function (err, data) {
                if (err) {
                    return cb(err || "no data");
                } else {
                    return cb(null, data);
                }
            });
        },
        detail: function (cb) {
            caller.query("item.get." + id, {
                method: "taobao.item.get",
                num_iid: id,
                fields: "desc,detail_url,num_iid,title,nick,type,cid,seller_cids,props,input_pids,input_str,pic_url," +
                    "num,list_time,delist_time,location,price,post_fee,express_fee,ems_fee,has_discount," +
                    "freight_payer,has_invoice,has_warranty,has_showcase,modified,increment,approve_status,product_id," +
                    "auction_point,property_alias,item_img,prop_img,sku,outer_id,is_virtual"
            }, function (err, data) {
                if (err || !data.item_get_response || !data.item_get_response.item) {
                    return cb(err || "no data");
                } else {
                    var resultItem = {"item": data.item_get_response.item}, item = resultItem.item;
                    resultItem.properties = buildProperty(item);
                    cb(null, resultItem);
                }
            });
        }
    }, function (err, result) {
        if (err) {
            return res.status(404);
        } else {
            var vdata = {};
            if (result.promotion && "promotions" in result.promotion.ump_promotion_get_response) {
                var itemProms = result.promotion.ump_promotion_get_response.promotions.promotion_in_item,
                    shopProms = result.promotion.ump_promotion_get_response.promotions.promotion_in_shop;

                if ("promotion_in_item" in itemProms) {
                    var pomps = itemProms.promotion_in_item;

                    for (var i = 0, max = pomps.length; i < max; i++) {
                        var pomp = pomps[i];
                        if (pomp.end_time) {
                            vdata.item_promotion = pomp;
                            break;
                        }
                    }
                }
                if ("promotion_in_shop" in shopProms) {
                    vdata.shop_promotion = shopProms.promotion_in_shop;
                }

//                vdata.promotions = result.promotion.ump_promotion_get_response.promotions;
            }
            vdata.item = result.detail.item;
            vdata.properties = result.detail.properties;
            vdata.showcart = true;
            return res.render("items/detail", vdata);
        }
    });
};