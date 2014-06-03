var taobao = require("taobao"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    validator = require('validator'),
    mem = require("../datas/MemManager"),
    redis = require("redis"),
    crypto = require('crypto'),
    httphelper = require("../../utils/HttpHelper");


var default_cfg = {
    key: "default",
    timeSegment: 60 * 1000,
    segLimit: 200,
    redisExpires: 60 * 10,
    memcachedRefreshTime: 60 * 60
};

function TOPExecutor(cfg) {
    this.cfg = cfg ? cfg : JSON.parse(JSON.stringify(default_cfg));
    this.mem = mem.getMem(this.cfg.key ? this.cfg.key : default_cfg.key);
    this.redis = redis.createClient();
    this.segLimit = this.cfg.segLimit ? this.cfg.segLimit : default_cfg.segLimit;
    this.timeSegment = this.cfg.timeSegment ? this.cfg.timeSegment : default_cfg.timeSegment;
    this.lastCallTime = Date.now();
    this.callCount = 0;
    this.redisExpires = "number" === typeof cfg.redisExpires ? cfg.redisExpires : default_cfg.redisExpires;
    this.memcachedRefreshTime = "number" === typeof cfg.memcachedRefreshTime ? cfg.memcachedRefreshTime : default_cfg.memcachedRefreshTime;
};

TOPExecutor.prototype.__refreshCallLimit = function () {
    this.lastCallTime = Date.now();
    this.callCount = 0;
};

TOPExecutor.prototype.__isCallOverLimited = function () {
    var now = Date.now(), diff = now - this.lastCallTime;
    if (diff > this.timeSegment) {
        this.__refreshCallLimit();
        return false;
    } else {
        return this.callCount >= this.segLimit;
    }
};

TOPExecutor.prototype.query = function (params, callback) {
    var me = this;

    var key = assembleKeys(params);

    console.log("key is : %s", key);

    function stringKey(obj) {
        if ("string" === typeof obj) {
            return obj;
        } else if ("object" === typeof obj) {
            try {
                return JSON.stringify(obj);
            } catch (e) {
                return validator.toString(obj);
            }
        } else if (obj) {
            return validator.toString(obj);
        }
    }

    function assembleKeys(params) {
        var array = [];
        if (params instanceof Array) {
            array.concat(params);
        } else if ("string" === typeof params) {
            array.push(params);
        }
        else if (params instanceof Object) {
            for (var key in params) {
                if (params.hasOwnProperty(key)) {
                    array.push("_" + stringKey(key) + ":" + stringKey(params[key]) + "_");
                }
            }
        } else if (params) {
            array.push(params);
        }

        array.sort();
        var strkey = array.join("").replace(/\s+/g, "");
        return crypto.createHash('md5').update(strkey).digest('hex');
    };

    function searchMem(cb) {
        me.mem.get(key, function (err, data) {
            console.log(key);
            console.log("search mem data %s", JSON.stringify(data));
            cb(err, data);
        });
    };

    function updateCacheTime() {
        me.mem.touch(key, me.memcachedRefreshTime);
        me.redis.expire(key, me.redisExpires);
    };

    function searchRedis(cb) {
        me.redis.get(key, function (err, reply) {
            console.log("search redis err %s", err);
            console.log("search redis data %s", reply);
            cb(err, reply);
        });
    };

    function queryTaobaoData(cb) {
        taobao.core.call(params, function (data) {
            console.log(typeof data);
            console.log("query taobao data %s", data);
            if (!data || data.error_response) {
                console.log("!data" + (!data));
                console.log("!data" + (data.error_response))
                return cb("call failed.");
            }

            if ("string" === typeof data) {
                try {
                    data = JSON.parse(data);
                } catch (ex) {
                    console.log(ex);
                }
            }

            storeData(data, cb);
        });
    };

    function storeData(data, cb) {
        me.mem.set(key, data, me.memcachedRefreshTime, function (err) {
            console.log("storeMemData time is %s, key is %s", me.memcachedRefreshTime, key);
            console.log(err);
        });

        me.redis.set(key, data, redis.print);

        me.redis.expire(key, 60 * 10);

        cb(null, data);
    };


    function chooseStoreByTimeLimit(data, cb) {
        if (data) {
            console.log("chooseStoreByTimeLimit data:%s", data);
            cb(null, data);
        } else {
            me.callCount = me.callCount + 1;
            if (me.__isCallOverLimited()) {
                searchRedis(cb);
            } else {
                queryTaobaoData(cb);
            }
        }
    };

    var callback = 'function' === typeof arguments[arguments.length - 1] ? arguments[arguments.length - 1] : new Function();
    async.waterfall([
        searchMem, chooseStoreByTimeLimit
    ], function (err, result) {
        if (!err && result) {
            updateCacheTime();
        }
        console.log("top call back, err %s, result %s", err, result);
        callback(err, result);
    });
};


module.exports = exports = TOPExecutor;