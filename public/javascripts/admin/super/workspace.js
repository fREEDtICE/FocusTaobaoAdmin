!(function (top, $) {
    var init = function () {
        $('#orderTab a:first').tab('show')
    };

    window.focusTaobao = top;

    $(document).ready(function () {
        init();
    });
    return top;
}(window.focusTaobao || {}, window.jQuery));