!(function (taobao, $) {
    "use strict";


    taobao.initItemPage = function () {
        taobao.initItemCarousel();
        taobao.initShoppingCart();
        taobao.initItemProp();
    };

    taobao.initItemProp = function () {
        var $ul = $("ul#prop-list"),
            $lis = $ul.find("li"),
            $q = $("span#item-quantity"),
            $p = $("span#item-price"),
            $i = $("img#item-img");

        $lis.each(function () {
            var me = $(this);
            me.click(function () {
                $q.text(me.data("sku-quantity"));
                $p.text(me.data("sku-price"));
                var pro_url = me.find("img").attr("src");
                $i.attr("src", pro_url);
            });
        });
    };


    taobao.initShoppingCart = function (shopcart, hiddenValue, shopshow, list) {

        var cookie_shopping = $.cookie("shoppingcart");

        var shop = typeof shopcart === "string" ? shopcart : "#btn-add-to-shopping-cart",
            value = typeof hiddenValue === "string" ? hiddenValue : "#ipt-data-container";
        var $body = $(document.body), $shopbtn = $(shop), $vpt = $(value), $csrf = $("input[name='_csrf']");

        var shop_show = "string" === typeof shopshow ? shopshow : "#btn-shopping-cart",
            item_list = "string" === typeof list ? list : "#shortcart-list";

        var $shopShow = $(shop_show), $list = $(item_list);

        var numiid = $shopbtn.data("num_iid"),
            price = $shopbtn.data("price");

        function updateTotalPriceAndQuantity(price, quantity) {
            if ("number" === typeof price) {
                var priceHolder = $('span.total-money'),
                    priceOld = parseFloat(priceHolder.text()) ? parseFloat(priceHolder.text()) : 0;

                priceOld = priceOld + price;
                priceHolder.text(priceOld);
            }

            if ("number" === typeof quantity) {
                var quantityHolder = $('span.total-quantity'),
                    quantityOld = parseInt(quantityHolder.text()) ? parseInt(quantityHolder.text()) : 0;

                quantityOld = quantityOld + quantity;

                quantityHolder.text(quantityOld);
            }
        }

        if (cookie_shopping) {
            $('div#shopping-summary').removeClass('hidden').addClass('show');
            try {
                cookie_shopping = cookie_shopping.substring(cookie_shopping.indexOf('{'), cookie_shopping.lastIndexOf('}') + 1);
                cookie_shopping.replace("'", "\"");
                var cart = $.parseJSON(cookie_shopping);
                var totalPrice = 0, totalQuantity = 0;
                for (var key in cart) {
                    var p = cart[key];
                    totalQuantity = totalQuantity + parseInt(p.quantity);
                    totalPrice = totalPrice + (parseFloat(p.price) * parseInt(p.quantity));
                    var item = createCartItem(p);
                    if (item) {
                        $list.append(item);
                    }
                }

                updateTotalPriceAndQuantity(totalPrice, totalQuantity);
            } catch (ex) {
            }
        } else {
            $('div#go-shopping').removeClass('hidden').addClass('show');
        }

        $shopbtn.popover({
            html: true,
            placement: 'top',
            trigger: 'manual'
        });

        $shopbtn.on('shown.bs.popover', function () {
            $('#close-add-result').click(function (e) {
                $shopbtn.popover('hide');
            });
        });

        function findItemInCart(numiid) {
            var children = $list.children("li"), i = children.length;
            while (i--) {
                var item = $(children[i]);
                if (item.data('num_iid') === numiid) {
                    return item;
                }
            }
        };

        function getItemInfo() {
            var data = $shopbtn.data(),
                result = {};
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    result[key] = data[key];
                }
            }
            delete result["bs.button"];
            delete result["bs.popover"];
            delete result["content"];
            delete result["html"];
            delete result["resetText"];
            delete result["loadingtext"];
            result._csrf = $csrf.val();
            return result;
        };

        function createCartItem(item) {
            var li = $('<li class="media"></li>');
            for (var key in item) {
                var v = item[key];
                li.attr("data-" + key, v);
            }
            var a = $('<a class="pull-left"></a>');
            a.attr("href", "/tpi/item/details/" + item.num_iid);
            var img = $('<img class="media-object img-thumbnail" style="width: 150px; height:150px"/>');
            img.attr("src", item.img_url);

            a.append(img);
            li.append(a);

            var quantity = parseInt(item.quantity) ? item.quantity : 1;
            var media_div = $('<div class="media-body"></div>');
            $('<h5></h5>').text(item.title).appendTo(media_div);
            $('<span class="bright-point"></span>').text(item.price).append('<span> x </span>').append('<span class="quantity bright-point">' + quantity + '</span>').appendTo(media_div);
            media_div.appendTo(li);
            return li;
        };

        $shopbtn.click(function (e) {
            $shopbtn.button('loading');
            $.ajax({
                url: "/cus/shoppingcart/add/item/" + numiid,
                type: "POST",
                data: getItemInfo(),
                beforeSend: function () {
                },
                complete: function () {
                    $shopbtn.button('reset');
                },
                success: function (data, status) {
                    if ('success' === status) {
                        $('div#shopping-summary').removeClass('hidden');
                        $('div#go-shopping').addClass('hidden');
                        $shopbtn.popover('show');
                        var item = findItemInCart(numiid);
                        if (!item) {
                            item = createCartItem(getItemInfo());
                            if (item) {
                                $list.append(item);
                            }
                        } else {
                            var quantitySpan = item.find("span.quantity");
                            var value = parseInt(quantitySpan.text());
                            quantitySpan.text(value + 1);
                            updateTotalPriceAndQuantity(parseFloat(price), 1);
                        }
                    } else {
                    }
                },
                error: function (xmlreq, msg, err) {
                }
            });
        });
    };

    taobao.initItemCarousel = function (div, img) {
        var ds = typeof div === "string" ? div : "#item-carousel",
            di = typeof img === "string" ? img : "#item-img";
        var $body = $(document.body), $carousel = $(ds), $pimg = $(di);
        if (!$carousel) {
            return;
        }
        var carousel_items = $carousel.find("a.thumbnail");

        carousel_items.each(function () {
            var me = $(this), img = me.children("img");
            me.mouseenter(function (e) {
                $pimg.attr("src", img.attr("src"));
            });
        });
    };

    window.focusTaobao || (window.focusTaobao = taobao);

    return taobao;
}(window.focusTaobao || {}, window.jQuery));