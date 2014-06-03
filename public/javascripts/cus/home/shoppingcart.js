!(function (f, $) {
    var $list = $("#shortcart-list");
    var getPrice = function () {
        var priceHolder = $('span.total-money'),
            price = parseFloat(priceHolder.text()) || 0;

        return {
            price: price,
            holder: priceHolder
        }
    };

    var findItemInCart = function (skuid) {
        var children = $list.children("li"), i = children.length;
        while (i--) {
            var item = $(children[i]);
            if (item.data('skuid') === skuid) {
                return item;
            }
        }
    };

    var getQuantity = function () {
        var quantityHolder = $('span.total-quantity'),
            quantity = parseInt(quantityHolder.text()) || 0;

        return {
            quantity: quantity,
            holder: quantityHolder
        }
    };

    var updateTotalPriceAndQuantity = function (price, quantity) {
        if ("number" === typeof price) {
            var priceInfo = getPrice(),
                priceHolder = priceInfo.holder,
                priceOld = priceInfo.price;
            price = (priceOld + price).toFixed(2);
            priceHolder.text(price);
        }

        if ("number" === typeof quantity) {
            var quantityInfo = getQuantity(),
                quantityHolder = quantityInfo.holder,
                quantityOld = quantityInfo.quantity;
            quantity = quantityOld + quantity;
            quantityHolder.text(quantity);
        }
    };

    var createCartItem = function (item) {
        var li = $('<li class="media"></li>');
        for (var key in item) {
            var v = item[key];
            li.attr("data-" + key, v);
        }
        var a = $('<a class="pull-left"></a>');
        a.attr("href", "/items/d/" + item.numiid);
        var img = $('<img class="media-object img-thumbnail" style="width: 150px; height:150px"/>');
        img.attr("src", item.img);

        a.append(img);
        li.append(a);

        var quantity = parseInt(item.quantity) || 1;
        var media_div = $('<div class="media-body"></div>');
        $('<h5></h5>').text(item.title).appendTo(media_div);
        $('<span class="bright-point"></span>').text(item.price).append('<span> x </span>').append('<span class="quantity bright-point">' + quantity + '</span>').appendTo(media_div);
        if (item.sel_prop.length) {
            for (var i = 0, max = item.sel_prop.length; i < max; i++) {
                var name = item.sel_prop[i].alias || item.sel_prop[i].name;
                $('<span class="cart-item-prop"></span>').text(name).appendTo(media_div);
            }

        }
        media_div.appendTo(li);
        return li;
    };


    var initShoppingCart = function () {
        $.ajax({
            url: "/customer/get-shoppingcart",
            dataType: "json",
            type: "GET",
            success: function (data, status) {
                if (status === 'success' && data.length) {
                    $('div#shopping-summary').removeClass('hidden').addClass('show');
                    try {
                        var totalPrice = 0, totalQuantity = 0;
                        $(data).each(function () {
                            var self = this;
                            var q = parseInt(self.quantity) || 1,
                                p = parseFloat(self.price) || 0;
                            totalQuantity = totalQuantity + q;
                            totalPrice = totalPrice + parseFloat(q * p);
                            var item = createCartItem(self);
                            if (item) {
                                $list.append(item);
                            }
                        });

                        updateTotalPriceAndQuantity(totalPrice, totalQuantity);
                    } catch (ex) {
                        alert(ex);
                    }
                } else {
                    $('div#go-shopping').removeClass('hidden').addClass('show');
                }
            },
            beforeSend:function(xhr){
            },
            error: function () {
            },
            complete: function (xhr, ts) {
            }
        });
    };

    f.shoppingcart = {
        addItem: function (item) {
            var skuid = item.skuid,
                q = parseInt(item.quantity) || 0,
                p = parseFloat(item.price) || 0;
            var li = findItemInCart(skuid);
            if (!li) {
                li = createCartItem(item);
                if (li) {
                    $list.append(li);
                    updateTotalPriceAndQuantity(p * q, q);
                }
            } else {
                var quantitySpan = li.find("span.quantity");
                var value = parseInt(quantitySpan.text());
                quantitySpan.text(value + q);
                updateTotalPriceAndQuantity(p * q, q);
            }
        },
        delItem: function (item) {

        }
    };

    $(document).ready(function () {
        initShoppingCart();
    });

    window.focusTaobao = window.focusTaobao || f;
    return f;
})(window.focusTaobao || {}, window.jQuery);