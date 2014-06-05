var async = require("async"),
    path = require("path"),
    fs = require("fs");

var LangDictFile = require("./LangDict"),
    LangDictItemModel = LangDictFile.itemModel,
    LangDictModel = LangDictFile.langModel;

module.exports = exports = function () {
    this.langs = {};

    var me = this;

    (function () {
        function initDefaultLang(filepath, callback) {
            async.waterfall([
                function (cb) {
                    fs.exists(filepath, function (exists) {
                        cb(null, exists);
                    });
                },
                function (exists, cb) {
                    if (!exists) {
                        return console.log("default lang file not exists!");
                    }

                    fs.readFile(filepath, {"encoding": "utf8"}, function (err, data) {
                        var ds = data ? data.toString() : null;
                        cb(err, ds);
                    });
                }, function (ds, cb) {
                    try {
                        var lang_arr = JSON.parse(ds);
                        async.each(lang_arr, function (item, icb) {
                            var lang_dict = new LangDictModel({
                                key: item.key,
                                langs: []
                            });

                            var i = item.langs && item.langs.length ? item.langs.length : 0;
                            while (i--) {
                                var ji = item.langs[i];
                                var lang_dict_item = new LangDictItemModel({
                                    langId: ji.langId,
                                    langValue: ji.value

                                });
                                lang_dict.langs.push(lang_dict_item);
                            }

                            me[item.key] = lang_dict;

                            lang_dict.save(function (err) {
                                icb(err);
                            });
                        }, function (err) {
                            cb(err);
                        });
                    } catch (e) {
                        cb(e);
                    }
                }
            ], function (err) {
                callback(err);
            });
        };

        async.waterfall([
            function (cb) {
                LangDictModel.find(null, function (err, data) {
                    cb(err, data);
                });
            },
            function (data, cb) {
                if (!data || data.length === 0) {
                    var jf = path.join(__dirname, "..", "/datas/DefaultLangDict.json");
                    initDefaultLang(jf, cb);
                } else {
                    var i = data.length;
                    while (i--) {
                        me.langs[data[i].key] = data[i];
                    }
                    cb();
                }
            }
        ], function (err) {
            if (err) {
                console.log(err);
                return new Error(err);
            }
        });
    }());

    return {
        getDict: function (key) {
            return me.langs[key];
        },

        getLang: function (key, lang) {
            var dict = me.langs[key];
            if (dict) {
                return dict.getLangLabel(lang);
            } else {
                return undefined;
            }
        },

        addDict: function (key, cb) {
            var dict = me.langs[key];
            if (dict) {
                console.log("add Dict failed. key already exsits! key = %s", key);
                return cb("key already exsits!");
            } else {
                dict = new LangDictModel({key: key, langs: []});
                dict.save(function (err) {
                    cb(err);
                });
            }
        },

        addLang: function (key, lang, value, cb) {
            var dict = me.langs[key];

            if (!dict) {
                console.log("add Dict failed. key not exsits! key = %s", key);
                return cb("key not exsits!");
            } else {
                var dict_item = new LangDictItemModel({
                    langId: lang,
                    langValue: value

                });
                dict.langs.push(dict_item);
                dict.save(function (err) {
                    cb(err);
                });
            }
        }
    }
};