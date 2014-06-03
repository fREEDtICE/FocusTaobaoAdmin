module.exports = (function () {

    function eq(i, v) {
        return i === v;
    };

    function arrayIndex(arr, v, fn) {
        var i = arr.length;
        fn = "function" === typeof fn ? fn : eq;
        while (i--) {
            if (fn(arr[i], v)) {
                return true;
            }
        }
        return false;
    };

    var items = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPRSTUVWXYZ23456789'.split('');

    return {
        inArray: function (array, value, fn) {
            if (!value || !array instanceof Array) {
                return false;
            }

            if (!fn && typeof Array.prototype.indexOf === 'function') {
                return ~array.indexOf(value);
            } else {
                return arrayIndex(array, value, fn);
            }
        },

        searchArray: function (array, conditionFn) {
            if (!("function" === typeof conditionFn) || !array instanceof Array) {
                return;
            }

            var i = array.length;
            while (i--) {
                if (conditionFn(array[i])) {
                    return array[i];
                }
            }
        },

        echoStr: function (length) {
            var start = 0, max = length || 32;
            var echostr = '';
            var rnd = Math.random();
            for (; start < max; start = start + 1) {
                var item = items[Math.round(rnd * (items.length - 1))];
                echostr = echostr + item;
            }

            return echostr;
        }
    }
})
    ();