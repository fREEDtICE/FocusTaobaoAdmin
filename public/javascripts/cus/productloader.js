!(function (taobao, $) {
    "use strict";


    taobao.initProductPage = function () {
        taobao.initProductCarousel();
        taobao.initShoppingCart();
    };


    taobao.initShoppingCart = function (shopcart, hiddenValue, shopshow, list) {

        var cookie_shopping = $.cookie("shoppingcart");

        var shop = typeof shopcart === "string" ? shopcart : "#btn-add-to-shopping-cart",
            value = typeof hiddenValue === "string" ? hiddenValue : "#ipt-data-container";
        var $body = $(document.body), $shopbtn = $(shop), $vpt = $(value), $csrf = $("input[name='_csrf']");

        var shop_show = "string" === typeof shopshow ? shopshow : "#btn-shopping-cart",
            item_list = "string" === typeof list ? list : "#shortcart-list";

        var $shopShow = $(shop_show), $list = $(item_list);

        var pid = $shopbtn.data("pid"),
            cid = $shopbtn.data("cid"),
            img_url = $shopbtn.data("img-url"),
            p_name = $shopbtn.data("pname"),
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
                var cart = $.parseJSON(cookie_shopping);
                var totalPrice = 0, totalQuantity = 0;
                for (var key in cart) {
                    var p = cart[key], pf = {
                        pid: p.productId,
                        cid: p.cid,
                        price: parseFloat(p.price),
                        quantity: parseInt(p.quality),
                        img_url: p.img_url,
                        p_name: p.name
                    };

                    totalQuantity = totalQuantity + pf.quantity;
                    totalPrice = totalPrice + (pf.price * pf.quantity);
                    var item = createCartItem(pf);
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

        function findProductInCart(pid) {
            var children = $list.children("li"), i = children.length;
            while (i--) {
                var item = $(children[i]);
                if (item.data('pid') == pid) {
                    return item;
                }
            }
        }

        function createCartItem(product) {
            var li = $('<li class="media"></li>');
            li.attr("data-pid", product.pid);
            li.attr('alt', p_name);
            var a = $('<a class="pull-left"></a>');
            a.attr("href", "/tpi/product/details/" + product.cid + "/" + product.pid);
            var img = $('<img class="media-object img-thumbnail" style="width: 150px; height:150px"/>');
            img.attr("src", product.img_url);
            a.append(img);
            li.append(a);

            var quantity = parseInt(product.quantity) ? product.quantity : 1;
            var media_div = $('<div class="media-body"></div>');
            $('<h5></h5>').text(product.p_name).appendTo(media_div);
            $('<span class="bright-point"></span>').text(product.price).append('<span> x </span>').append('<span class="quantity bright-point">' + quantity + '</span>').appendTo(media_div);
            media_div.appendTo(li);
            return li;
        };

        $shopbtn.click(function (e) {
            $shopbtn.button('loading');
            $.ajax({
                url: "/cus/shoppingcart/add/" + cid + "/" + pid,
                type: "POST",
                data: {
                    name: p_name,
                    price: price,
                    img_url: img_url,
                    _csrf: $csrf.val()
                },
                beforeSend: function () {
                },
                complete: function () {
                    $shopbtn.button('reset');
                },
                success: function (data, status) {
                    if ('success' === status) {
                        $('div#shopping-summary').removeClass('hide');
                        $('div#go-shopping').addClass('hide');
                        $shopbtn.popover('show');
                        var item = findProductInCart(pid);
                        if (!item) {
                            item = createCartItem({
                                pid: pid,
                                cid: cid,
                                img_url: img_url,
                                p_name: p_name,
                                price: price
                            });
                            if (item) {
                                $list.append(item);
                            }
                        } else {
                            var quantitySpan = item.find("span.quantity");
                            var value = parseInt(quantitySpan.text());
                            quantitySpan.text(value + 1);
                            updateTotalPriceAndQuantity(parseFloat(price), 1);
                        }
                    }
                },
                error: function (xmlreq, msg, err) {

                }
            });
        });
    };

    taobao.initProductCarousel = function (div, img) {
        var ds = typeof div === "string" ? div : "#product-carousel",
            di = typeof img === "string" ? img : "#product-img";
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