var util = require("../utils/CommonUtils");

module.exports = function (app, swig) {
//    swig.setFilter('basicmath', function (a, b, opt) {
//        if (arguments.length < 3) {
//            return a;
//        }
//
//        if (isNaN(a) || isNaN(b) || a === "" || b === "") {
//            return "invalid args";
//        }
//
//        if (!/[\+\-\*\/%]/.test(opt)) {
//            return "invalid operator";
//        }
//
//        return new Function('a', 'b', 'opt', 'return a opt b;')(a, b, opt);
//    });

    swig.setFilter("contains", function (input) {
        var arr = arguments[0];
        if (arguments.length > 1) {
            input = arguments[1];
        }
        return util.inArray(arr, input);
    });

    swig.setFilter("inlinestr", function (input) {
        if ("string" === typeof input) {
            return input.replace(/\n\t/g, "");
        }

        return input;
    });

    var isDev = 'development' === process.env.NODE_ENV;
    // 设置swig缓存,开发模式下关闭
    app.set('view cache', isDev);
    swig.setDefaults({ cache: isDev });
};
