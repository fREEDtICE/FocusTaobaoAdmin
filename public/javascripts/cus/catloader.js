!(function (taobao, $) {
    "use strict";


    taobao.initCatLoader = function (selector) {
        selector = selector ? selector : "#div_cat";
        var $body = $(document.body), $content = $("div#div_content"), isLocked = false, currentSelect;
        var navItems = $(selector).find("a");
        navItems.each(function () {
            function clearActiveEffect(navItems) {
                navItems.each(function () {
                    var me = $(this);
                    me.removeClass('active');
                });
            };

            function getProducts(url) {
                $.ajax({
                    url: url,
//                    url: "tpi/tbk/list?cid=" + cid + "&cols=3",
                    success: function (data) {
                        $content.append(data);
                        var pageLinks = $content.find("ul.pagination").find("a");
                        if (pageLinks && pageLinks.length) {
                            pageLinks.each(function () {
                                var me = $(this),
                                    pageUrl = me.data("url");
                                me.click(function (e) {
                                    getProducts(pageUrl);
                                    return true;
                                });
                            });
                        }
                        isLocked = false;
                    },
                    error: function (req, msg, err) {
                        isLocked = false;
                    },
                    beforeSend: function (req) {
                        $content.empty();
                        isLocked = true;
                    }
                });
            }

            var me = $(this);
            var cid = me.data("cid");
            me.click(function (e) {
                if (isLocked && me !== currentSelect) {
                    return false;
                }
                clearActiveEffect(navItems);
                currentSelect = me;
                me.addClass("active");
                getProducts("/tpi/tbk/list/" + cid + "?pageno=1");
            }).mouseenter(function (e) {
                    me.addClass("active");
                }).mouseout(function (e) {
                    if (currentSelect !== me) {
                        me.removeClass("active");
                    }
                });
        });
    };

    window.focusTaobao || (window.focusTaobao = taobao);

    return taobao;
}(window.focusTaobao || {}, window.jQuery));