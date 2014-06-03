!(function (taobao, $) {
    'use strict';

    var mask_css = "style='position:fixed;width:100%;height:100%;'"

    function ScreenMask() {
        this.init();
    };

    ScreenMask.prototype.init = function () {
        $(document).ready(function () {
            var body = $('body'),
                maskDiv = $('<div id="mask" class=""></div>');

        });
    };


    taobao.screenMask = new ScreenMask();

    window.focusTaobao = taobao;

    return taobao;
}(window.focusTaobao || {}, window.jQuery));