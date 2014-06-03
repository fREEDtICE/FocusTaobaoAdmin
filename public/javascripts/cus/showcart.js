(function (taobao, $) {
    "use strict";

    taobao.initShowcart = function () {
        var $minus = $("button[data-tag='quantity-minus']"),
            $plus = $("button[data-tag='quantity-plus']"),
            $quantities = $("input[data-tag='quantity']");

        $minus.each(function (index) {
            var qV = $($quantities[index]), plus = $($plus[index]), me = $(this);

            function checkStatus() {
                var q = parseInt(qV.val());
                if (q < 2) {
                    me.attr("disabled", "disabled");
                }
            };

            checkStatus();

            me.click(function () {
                qV.val(parseInt(qV.val()) - 1);
                checkStatus();
            });
        });

        $plus.each(function (index) {
            var qV = $($quantities[index]), m = $($minus[index]), me = $(this);

            me.click(function () {
                qV.val(parseInt(qV.val()) + 1);
                if (qV.val() > 1) {
                    m.removeAttr("disabled");
                }
            });
        });
    };

    window.focusTaobao || (window.focusTaobao = taobao);
    return taobao;
}(window.focusTaobao || {}, window.jQuery));