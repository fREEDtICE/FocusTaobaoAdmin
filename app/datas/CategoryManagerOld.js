var MemManager = require("../datas/MemManager"),
    async = require("async"),
    Category = require("./Category"),
    Cat = Category.model,
    taobao = require("taobao");

module.exports = exports = function () {
    this.mem = MemManager.getMem("catmanager");
    this.cats = {};
    var that = this;


    function init(callback) {
        async.waterfall([
            function (cb) {
                Category.queryAllCats(function (err, data) {
                    console.log("queryAllCats");
                    cb(err, data);
                })
            },

            function (data, cb) {
                if (!data || data.length === 0) {
                    taobao.core.call("taobao.itemcats.get.all", {
                        method: 'taobao.itemcats.get',
                        fields: 'cid,features,parent_cid,name,is_parent,status, sort_order',
                        "parent_cid": "0"
                    }, function (data) {
                        if (data && data.itemcats_get_response && data.itemcats_get_response.item_cats) {
                            async.each(data.itemcats_get_response.item_cats.item_cat, function (item, cb) {
                                var cat = new Cat({
                                    key: "cat_name_" + item.parent_cid + "_" + item.cid,
                                    status: 1,
                                    taobaoInfo: item
                                });

                                cat.save(function (err) {
                                    cb(err);
                                });
                            }, function (err) {
                                return cb(err);
                            });
                        } else {
                            return cb(new Error("fetch cats failed"));
                        }
                    });
                } else {
                    cb(null);
                }
            }
        ], function (err) {
            console.log("init cat data. %s", err);
            if ("function" === typeof callback) {
                callback(err);
            }
        });
    }

    function fetchData(callback) {
        async.waterfall([
            function (cb) {
                console.log("queryConfirmedCats");
                Category.queryConfirmedCats(function (err, data) {
                    cb(err, data);
                });
            },

            function (data, cb) {
                storeData(data, cb);
                console.log("setShownCategories");

            }
        ], function (err, data) {
            console.log("fetch cat data. %s", err);
            if ("function" === typeof callback) {
                callback(err, data);
            }
        });
    };


    function storeData(data, cb) {
        that.mem.set("shown_categories", data, function (err) {
            return cb(err, data);
        });
    };

    async.waterfall([
        init, fetchData
    ], function (err) {
        console.log("first init cat data. %s", err);
    });

    return {
        getCats: function (cb) {
            return that.mem.get("shown_categories", function (err, data) {
                if (err || !data) {
                    async.waterfall([
                        fetchData, storeData
                    ], function (err, data) {
                        cb(err, data);
                    })
                } else {
                    cb(null, data);
                }
            });
        }
    };
};