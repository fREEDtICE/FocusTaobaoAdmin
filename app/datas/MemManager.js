var Memcached = require("memcached"),
    async = require("async"),
    config = require("../../config/config"),
    BloomFilter = require("bloomxx").RedisFilter;
//    BloomFilter = require("bloomfilter").BloomFilter;
var env = process.env.NODE_ENV || 'development';

module.exports = exports = (function (config) {
    this.defaultLoc = config.memcached.server;
    this.defaultConfig = config.memcached.config;
    this.mems = {};
    this.location = this.defaultLoc;
    this.config = JSON.parse(JSON.stringify(this.defaultConfig));


    var that = this;

    function BloomMem(bloomCfg) {
        bloomCfg = bloomCfg || {
//            bits: 512 * 32,
//            funcs: 16
            bits: 1024,
            hashes: 6
        };

        this.mem = new Memcached(that.location, that.config);
        bloomCfg.bits = bloomCfg.bits || 1024;
        bloomCfg.hashes = bloomCfg.hashes || 6;
//        var bits = (bloomCfg.bits ? bloomCfg.bits : 1024 * 4),
//            hashes = (bloomCfg.hashes ? bloomCfg.hashes : 6);
//        this.bloom = new BloomFilter(bits, funcs);
        this.bloom = new BloomFilter(bloomCfg);
        this.bloom.generateSeeds();
        this.lifetime = 60 * 60 * 24;
    };

    BloomMem.prototype.touch = function (key, time, cb) {
        var me = this,
            t = me.lifetime;
        if (typeof time === 'number') {
            t = time;
        } else if (typeof time === 'function') {
            cb = time;
        }
        me.mem.touch(key, t, cb);
    };

    BloomMem.prototype.has = function (key, cb) {
        this.bloom.has(key, cb);
    };


    BloomMem.prototype.set = function (key, value, cb) {
        var me = this;
        var lifetime = me.lifetime;
        if (arguments.length > 3) {
            lifetime = (typeof arguments[2] === "number") ? arguments[2] : me.lifetime;
            cb = arguments[arguments.length - 1];
        }

        me.bloom.add(key, function (err) {
            if (err) {
                return cb(err);
            }
            console.log("bloom add key %s", key);
            me.mem.set(key, value, lifetime, function (err) {
                console.log("bloom set key is %s, time is %s", key, lifetime);
                console.log(err);
                if ("function" === typeof cb) {
                    return cb(err);
                }
            });
        });
    };

    BloomMem.prototype.get = function (key, touch, cb) {
        var me = this,
            t = false;
        if (typeof touch === "function") {
            cb = touch;
        } else if (typeof touch === 'boolean') {
            t = touch;
        }
        me.bloom.has(key, function (err, has) {
            console.log("bloom test key %s ==> %s", key, has);
            if (has) {
                if (t) {
                    me.mem.touch(key, me.lifetime);
                }
                return me.mem.get(key, cb);
            } else {
                return cb(null, null);
            }
        });
//        if (this.bloom.has(key)) {
//            return this.mem.get(key, cb);
//        } else if (cb) {
//            return cb(null, null);
//        }
    };

    BloomMem.prototype.getOrCache = function (key, fn, callback) {
        var me = this, args = Array.prototype.slice.call(arguments);
//      key, fn, fn-params, cb
        function getInCache(cb) {
            me.get(key, function (err, data) {
                cb(err, data);
            });
        };

        function cacheIfNotExists(data, cb) {
            if (!data) {
//                var lifetime;
                var fn_args;
                if (args.length > 3) {
                    fn_args = args.slice(2, args.length - 1);
//                    lifetime = args[3];
                }
//                lifetime = (lifetime instanceof Number) ? lifetime : me.lifetime;


                var result;
                if ("function" === typeof fn) {
                    result = fn.apply(this, fn_args);
                }


                if (result) {
                    me.set(key, data, function (err) {
                        return cb(err, data)
                    });
                }
            } else {
                return cb(null, data);
            }
        };

        var exe_funcs = [];
        if (args.length < 1) {
            return new Error("invalid args, need key");
        }
        exe_funcs.push(getInCache);

        if (args.length > 2) {
            exe_funcs.push(cacheIfNotExists);
        }

        async.waterfall(exe_funcs, function (err, result) {
            callback = args[args.length - 1];
            if (callback instanceof Function) {
                callback(err, result);
            }
        });
    };


    return {
        init: function (loc, config) {
            that.location = loc || that.defaultLoc;
            that.config = config || JSON.parse(JSON.stringify(that.defaultConfig));
        },

        getMem: function (key) {
            var mem = that.mems[key];
            if (!mem) {
                mem = new BloomMem();
                that.mems[key] = mem;
            }
            return mem;
        }
    };
})
(config[env]);