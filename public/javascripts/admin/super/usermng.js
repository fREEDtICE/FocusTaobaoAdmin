!(function (taobao, $) {
    var init = function () {
        $('#btn-add-use').click(function () {
        });
    };

    $(document).ready(function () {
        init();
    });

    window.focusTaobao = taobao;
    return taobao;
}(window.focusTaobao || {}, window.jQuery))