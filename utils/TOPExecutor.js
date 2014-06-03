var taobao = require("taobao"),
    path = require("path"),
    swig = require("swig"),
    async = require("async"),
    validator = require('validator'),
    mem = require("../app/datas/MemManager"),
    redis = require("redis"),
    crypto = require('crypto');


var default_cfg = {
    key: "default",
    timeSegment: 60 * 1000,
    segLimit: 200,
    redisExpires: 60 * 10,
    memcachedRefreshTime: 60 * 60
};

var start = process.hrtime();

var elapsed_time = function (note) {
    var precision = 3; // 3 decimal places
    var elapsed = process.hrtime(start)[1] / 1000000; // divide by a million to get nano to milli
    console.log(process.hrtime(start)[0] + " s, " + elapsed.toFixed(precision) + " ms - " + note); // print message + time
    start = process.hrtime(); // reset the timer
};


var md5 = function (strkey) {
    return crypto.createHash('md5').update(strkey).digest('hex');
};

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
};


var assembleParaKeys = function (params) {
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
    return md5(array.join("").replace(/\s+/g, ""));
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

TOPExecutor.prototype.get = function (k, params, callback) {
    var key;
    if (typeof k === "string") {
        key = md5(k);
    } else if (typeof k === "object") {
        key = assembleParaKeys(params);
    }

    this.mem.get(key, callback);
};


TOPExecutor.prototype.save = function (k, params) {
    var key;
    if (typeof k === "string") {
        key = md5(k);
    } else if (typeof k === "object") {
        key = assembleParaKeys(params);
    }

    this.redis.save(key);
};

TOPExecutor.prototype.query = function (k, params, callback) {
    var me = this;
    callback = 'function' === typeof arguments[arguments.length - 1] ? arguments[arguments.length - 1] : new Function();
    var key;
    if (typeof k === "string") {
        key = md5(k);
    } else if (typeof k === "object") {
//        callback = params;
        params = k;
        key = assembleParaKeys(params);
    }

    function searchMem(cb) {
        elapsed_time("search mem");
        me.mem.get(key, function (err, data) {
            console.log(key);
            console.log("search mem err %s", JSON.stringify(err));
            console.log("search mem data %s", JSON.stringify(data));
            elapsed_time("search mem result");
            cb(err, data);
        });
    };

    function updateCacheTime(result) {
        me.mem.touch(key, me.memcachedRefreshTime);
        me.redis.incr(key, function (err, reply) {
            console.log(reply);
            console.log(reply > 0);
            if (err) {

            } else if (reply > 100) {
                me.redis.set(key, result);
            }
        });
        elapsed_time("update cache time");
    };

    function searchRedis(cb) {
        elapsed_time("start redis search");
        me.redis.get(key, function (err, reply) {
            console.log("search redis err %s", err);
            console.log("search redis data %s", reply);
            elapsed_time("redis search fin");
            cb(err, reply);
        });
    };

    function queryTaobaoData(cb) {
        elapsed_time("start taobao");
        taobao.core.call(params, function (data) {

            console.log("query taobao data");
            try {
                console.log(JSON.stringify(data));
            }
            catch (ex) {
                console.log(data);
            }
            if (!data || data.error_response) {
                console.log("!data" + (data.error_response));
                return cb("call failed.");
            }

            if ("string" === typeof data) {
                try {
                    data = JSON.parse(data);
                    console.log(JSON.stringify(data));
                } catch (ex) {
                    console.log(ex);
                }
            }
            elapsed_time("fin taobao");
            storeData(data, cb);
        });
    };

    function storeData(data, cb) {
        elapsed_time("start store data");
        me.mem.set(key, data, me.memcachedRefreshTime, function (err) {
            console.log("storeMemData time is %s, key is %s", me.memcachedRefreshTime, key);
            console.log(err);
        });

        me.redis.set(key, 1, redis.print);

        elapsed_time("end store data");
        cb(null, data);
    };


    function chooseStoreByTimeLimit(data, cb) {
        elapsed_time("start choose store");
        if (data) {
            console.log("chooseStoreByTimeLimit data:%s", data);
            elapsed_time("end choose store");
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

    async.waterfall([
        searchMem, chooseStoreByTimeLimit
    ], function (err, result) {
        if (!err && result) {
            updateCacheTime(result);
        }
        console.log("top call back, err %s, result %s", err, result);
        console.log(callback);
        callback(err, result);
        elapsed_time("end query");
    });
};


module.exports = exports = TOPExecutor;