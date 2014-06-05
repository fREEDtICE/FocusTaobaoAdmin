var async = require("async"),
    path = require("path"),
    redis = require("redis"),
    client = redis.createClient(),
    fs = require("fs");

var LangDictFile = require("top-models").models.LangDict,
    LangDictItemModel = LangDictFile.itemModel,
    LangDictModel = LangDictFile.langModel;

var cutil = require("../../utils/CommonUtils");

module.exports = exports = (function () {
    this.redisCache = {};
    this.redisCache.langs = {};
    this.redisCache.keys = {};
    var me = this;

    (function () {
        var jf = path.join(__dirname, "..", "/langs/DefaultLangDict.json"),
            redis_key = "lang_mng";

        function getRedisCache(callback) {
            client.get(redis_key, function (err, reply) {
                if (err) {
                    callback(err);
                } else {
                    if (reply) {
                        try {
                            me.redisCache = JSON.parse(reply);
                        } catch (ex) {
                            console.log(ex);
                            me.redisCache = reply;
                        }
                        callback(null, true);
                    } else {
                        callback(null, false);
                    }
                }
            });
        };


        function lazyInit(isCacheExists, callback) {
            if (isCacheExists) {
                callback(null);
            } else {
                loadDBLangs(callback);
            }
        }

        function loadDefaultLang(callback) {
            async.waterfall([
                function (cb) {
                    fs.exists(jf, function (exists) {
                        cb(null, exists);
                    });
                },
                function (exists, cb) {
                    if (!exists) {
                        return cb("default lang file not exists!");
                    }

                    fs.readFile(jf, {"encoding": "utf8"}, function (err, data) {
                        if (err) {
                            return cb(err);
                        }
                        var ds = data ? data.toString() : null;
                        try {
                            cb(null, JSON.parse(ds));
                        } catch (e) {
                            cb(e);
                        }
                    });
                }
            ], function (err, data) {
                if (err) {
                    callback(err);
                } else {
                    mergeLangs(data, callback);
                }
            });
        };

        function loadDBLangs(cb) {
            LangDictModel.find(null, function (err, data) {
                if (err) {
                    cb(err);
                }

                var i = data && data.length ? data.length : 0;
                while (i--) {
                    var d = data[i], dl = d.langs;
                    var j = dl && dl.length ? dl.length : 0;
                    while (j--) {
                        var lang = dl[j].langId,
                            langObj = me.redisCache.langs[lang];
                        if (!langObj) {
                            langObj = {};
                            me.redisCache.langs[lang] = langObj;
                        }

                        langObj[d.key] = dl[j].langValue;
                        me.redisCache.keys[d.key] = d.key;
                    }
                }
                loadDefaultLang(cb);
            });
        };

        function mergeLangs(file, cb) {
            if (file && file instanceof Array) {
                async.each(file, function (item, icb) {
                    if (item.key && !me.redisCache.keys[item.key]) {
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
                            var lang = ji.langId,
                                langObj = me.redisCache.langs[lang];
                            if (!langObj) {
                                langObj = {};
                                me.redisCache.langs[lang] = langObj;
                            }
                            langObj[item.key] = ji.langValue;
                            lang_dict.langs.push(lang_dict_item);
                        }

                        lang_dict.save(function (err) {
                            icb(err);
                        });
                    } else {
                        icb();
                    }
                }, function (err) {
                    client.set(redis_key, JSON.stringify(me.redisCache), function (err, data) {
                        cb(err);
                    });
                });
            } else {
                cb("internal error");
            }
        };

        async.waterfall([
            getRedisCache, lazyInit
        ], function (err) {
            if (err) {
                console.log(err);
                return new Error(err);
            }
        });
    }());

    return {
        getDict: function (lang) {
            return me.redisCache.langs[lang];
        },

        addDict: function (key, cb) {
            var dict = me.redisCache.langs[key];
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
}());