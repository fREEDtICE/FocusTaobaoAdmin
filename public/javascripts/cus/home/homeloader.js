(function ($) {
    var input = $("input#url-input"), btn = $("button#btn-url");

    input.data("last_url", input.val());

    input.bind("propertychange keyup input paste", function (event) {
        var v = input.val();
        if (input.data('last_url') != v) {
            input.data('last_url', v);
        }
        if (v) {
            btn.removeClass("disabled");
        } else {
            btn.addClass("disabled");
        }
    });

    btn.click(function (e) {
        var url = input.val();
        if (!url) {

        }

        var id_str = "id="
        var id_splice = url.substring(url.indexOf(id_str) + id_str.length);
        var id;
        try {
            id = parseInt(id_splice);
        } catch (ex) {
        }

        if (!isNaN(id)) {
            window.open("/items/d/" + id);
        }
    });
})(window.jQuery);