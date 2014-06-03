!(function (taobao, $) {
    "use strict";


    taobao.item = taobao.item || {};
    taobao.item.detail = taobao.item.detail || {};
    var d = taobao.item.detail;

    var initItemCarousel = function (div, img) {
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
                $pimg.attr("src", img.data("url"));
            });
        });
    };

    var initShoppingBtn = function (shopcart) {
        var shop = typeof shopcart === "string" ? shopcart : "#btn-add-to-shopping-cart",
            $shopbtn = $(shop);

        var numiid = $shopbtn.data("num_iid"),
            price = $shopbtn.data("price");

        $shopbtn.on('shown.bs.popover', function () {
            $('#close-add-result').click(function (e) {
                $shopbtn.popover('hide');
            });
        });

        $shopbtn.popover({
            html: true,
            placement: 'top',
            trigger: 'manual'
        });

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
            return result;
        };

        $shopbtn.click(function (e) {
            var data = {
                "iteminfo": getItemInfo(),
                "_csrf": $("input[name='_csrf']").val(),
                "sku": d.sel_sku,
                "sel_prop": d.sel_prop,
                "q": parseInt($("#quantity-input").val()),
                "i": d.sel_img,
                "p": parseFloat($("#item-price").text())
            };

            data = JSON.parse(JSON.stringify(data));
            $.ajax({
                url: "/items/s/a/" + numiid + "/" + d.sel_sku.id,
                type: "POST",
                data: data,
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
                        taobao.shoppingcart.addItem(data);
                    } else {

                    }

                    $shopbtn.button("reset");
                },
                error: function (xmlreq, msg, err) {
                    $shopbtn.button("reset");
                }
            });
        });
    };

    var initPropList = function (shopcart, list) {
        var $ul = $("ul.prop-list"),
            prop_num = $ul.length;

        var countSKUQuantity = function (prop) {
            if (!prop instanceof Array) {
                var v = prop;
                prop = [v];
            }

            var quantity = 0;
            for (var k in d.skus) {
                var isOK = true, sku = d.skus[k];
                for (var i = 0, max = prop.length; i < max; i++) {
                    if (sku.props.indexOf(prop[i]) < 0) {
                        isOK = false;
                        break;
                    }
                }
                if (isOK) {
                    quantity = quantity + sku.quantity;
                }
            }
            return quantity;
        };

        // 通过属性查找SKU
        var searchSKUByPro = function (prop) {
            if (!prop instanceof Array) {
                var v = prop;
                prop = [v];
            }

            for (var k in d.skus) {
                var sku = d.skus[k];
                for (var i = 0, max = prop.length; i < max; i++) {
                    if (sku.props.indexOf(prop[i]) < 0) {
                        break;
                    } else if (i === max - 1) {
                        return sku;
                    }
                }
            }
        };

        if (!d.sel_prop) {
            d.sel_prop = new Array(prop_num);
        }

        var selected_props = d.sel_prop;

        $ul.each(function (index) {
            var $this = $(this);
            var $lis = $this.find("li"),
                cid = $this.data("cid"),
                cname = $this.data("cname"),
                $i = $("img#item-img");

            $lis.each(function () {
                var me = $(this),
                    anchor = me.children("a"),
                    pid = me.data("pid"),
                    pname = me.data("pname"),
                    palias = me.data("alias");

                me.click(function () {
//                    $q.text(me.data("sku-quantity"));
//                    $p.text(me.data("sku-price"));
                    var $pimg = me.find("img");
                    if ($pimg.length) {
                        var pro_url = $pimg.data("img");
                        $i.attr("src", pro_url);
                        d.sel_img = pro_url;
                    }

                    selected_props[index] = {
                        "cid": cid,
                        "cname": cname,
                        "id": cid + ":" + pid,
                        "name": pname,
                        "alias": palias
                    };

                    var props = new Array();
                    for (var i = 0, max = d.sel_prop.length; i < max; i++) {
                        if (selected_props[i]) {
                            props.push(selected_props[i].id);
                        }
                    }

                    var quantity = 0, $price = $("#item-price"), price = $price.text(), $shopbtn = $("#btn-add-to-shopping-cart");
                    if (props.length === prop_num) {
                        var sku = searchSKUByPro(props);
                        if (sku) {
                            quantity = sku.quantity;
                            d.sel_sku = sku;
                            price = sku.prom_price || sku.price;
                        }
                    } else {
                        quantity = countSKUQuantity(props);
                    }

                    $("#quantity-num").text(quantity);
                    $price.text(price);

                    if (!quantity) {
                        $shopbtn.addClass("disabled");
                    } else {
                        $shopbtn.removeClass("disabled");
                    }
                });
            });
        });
    };

    var initQuantitySpinner = function () {
        $('.spinner .btn:first-of-type').on('click', function () {
            $('.spinner input').val(parseInt($('.spinner input').val(), 10) + 1);
        });
        $('.spinner .btn:last-of-type').on('click', function () {
            var input = $('.spinner input');
            var v = parseInt(input.val(), 10) - 1 || 1;
            $('.spinner input').val(v);
        });
    };

    var initData = function () {
        d.skus = {
        };
        var skus = $("input[name='sku']");
        skus.each(function () {
            var me = $(this),
                id = me.data("id"),
                price = me.data("price"),
                quantity = me.data("quantity"),
                props = me.val();
            d.skus[id] = {
                id: id,
                price: price,
                quantity: quantity,
                props: props
            };
            me.remove();
        });

        var promption_input = $("#item_promotion");
        if (promption_input.length > 0) {
            try {
                var promotion = $.parseJSON(promption_input.val());
                d.promotion = {
                    name: promotion.name,
                    item_promo_price: promotion.item_promo_price,
                    end_time: promotion.end_time,
                    start_time: promotion.start_time
                };

                var sku_arr = promotion.sku_id_list.string,
                    price_arr = promotion.sku_price_list.price;
                for (var i = 0, max = sku_arr.length; i < max; i++) {
                    var sku_id = sku_arr[i];
                    if (sku_id in d.skus) {
                        var sku = d.skus[sku_id];
                        sku.prom_price = price_arr[i];
                    }
                }
            } catch (ex) {
            }
            promption_input.remove();
        }
    };

    $(document).ready(function () {
        initData();
        initItemCarousel();
        initShoppingBtn();
        initPropList();
        initQuantitySpinner();
    });

    window.focusTaobao = taobao;
}(window.focusTaobao || {}, window.jQuery));
