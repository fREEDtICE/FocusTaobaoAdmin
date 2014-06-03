!(function (taobao, $) {
    taobao.recalculateTotal = function () {
        var itemTotal = 0.0;
        $(taobao.carts).each(function () {
            itemTotal += (this.getTotalPrice() * 100);
        });

//        itemTotal = itemTotal.toFixed(2);
        var commission = itemTotal * 0.1;
//        commission = commission.toFixed(2);
        var totalPrice = itemTotal + commission;
//        totalPrice = totalPrice.toFixed(2);

        itemTotal = (itemTotal / 100);
        commission = (commission / 100);
        totalPrice = (totalPrice / 100);

        taobao.itemHolder.text(itemTotal.toFixed(2));
        taobao.commissionHolder.text(commission.toFixed(2));
        taobao.priceHolder.text(totalPrice.toFixed(2));
    };

    function CartItem(tr) {
        this.tr = tr;
        this.init();
    };

    CartItem.prototype.init = function () {
        var _self = this;
        var tr = this.tr;
        // skuid
        var input_sku = tr.find('input[name="skuid"]');
        this.skuid = parseInt(input_sku.val());
        input_sku.remove();

        // price
        this.price = parseFloat(tr.find("span.price").text());


        var mb = $(tr.find('button[name="quantity-minus"]')),
            pb = $(tr.find('button[name="quantity-plus"]')),
            qi = $(tr.find("input[name='quantity']"));

        function adjustQuantity() {
            $.ajax({
                url: "/customer/adjust-cart",
                dataType: "json",
                type: "POST",
                data: {
                    "skuid": _self.skuid,
                    "quantity": _self.getQuantity(),
                    "_csrf": $("input[name='_csrf']").val()
                },
                success: function (data, status) {
                    if (status === 'success' && data.result === 'success') {
                        taobao.recalculateTotal();
                    } else {
                    }
                },
                beforeSend: function (xhr) {
                },
                error: function (xhr, msg) {
                },
                complete: function (xhr, ts) {
                    _self.popover.popover('hide');
                }
            });
        };

        var t;
        qi.bind("propertychange change keyup input paste", function (event) {
            clearTimeout(t);
            _self.popover.popover('show');
            var v = qi.val(), last_v = qi.data("last");
            if (!parseInt(v)) {
                qi.val(1);
            } else if (v !== last_v) {
                qi.data("last", v);
            }

            if (qi.val() == 1) {
                mb.addClass("disabled");
            } else {
                mb.removeClass("disabled");
            }

            t = setTimeout(adjustQuantity, 1000);
        });

        pb.click(function () {
            var q = _self.getQuantity();
            q += 1;
            qi.val(q);
            mb.removeClass("disabled");
            qi.trigger('change');
        });

        mb.click(function () {
            var q = _self.getQuantity();
            q = q - 1 || 1;
            qi.val(q);
            qi.trigger('change');
        });

        this.minusBtn = mb;
        this.plusBtn = pb;
        this.quanInput = qi;

        var del_btn = $(tr.find('a[name="item-del"]'));

        var modalConfirm = $("#modal-confirm");

        del_btn.click(function () {
            modalConfirm.data("skuid", del_btn.data("skuid"));
            $('#confirmModal').modal('show');
        });

        this.popover = $(tr.find('div[name="quantity-container"]'));
        this.popover.popover({
            "placement": "top",
            "trigger": "manual",
            "html": "true",
            "container": "body",
            "content": "<p><img src='/images/loading.gif' width='43px' height='30px'></p><p>Processing, please wait</p>"
        });
    };


    CartItem.prototype.getTotalPrice = function () {
        var q = this.getQuantity();
        var total = q * this.price;
        return parseFloat(total.toFixed(2));
    };

    CartItem.prototype.getQuantity = function () {
        return parseInt(this.quanInput.val());
    };

    var initData = function () {
        taobao.carts = [];
        $('tr').each(function (index) {
            var tr = $(this);
            var item = new CartItem(tr);
            taobao.carts.push(item);
        });

        var priceSpan = $("#price-total"),
            commissionSpan = $("#customer-commission"),
            itemSpan = $('#item-total');
        taobao.commissionHolder = commissionSpan;
        taobao.priceHolder = priceSpan;
        taobao.itemHolder = itemSpan;
        taobao.recalculateTotal();

        $("#modal-confirm").click(function () {
            var _self = $(this),
                skuid = _self.data("skuid");
            $('#confirmModal').modal('hide');
            $.ajax({
                url: "/customer/remove-cart-item",
                dataType: "json",
                type: "POST",
                data: {
                    "skuid": skuid,
                    "_csrf": $("input[name='_csrf']").val()
                },
                success: function (data, status) {
                    if (status === 'success' && data.result === 'success') {
                        try {
                            var index = -1;
                            for (var i = 0, max = taobao.carts.length; i < max; i++) {
                                if (taobao.carts[i].skuid == skuid) {
                                    index = i;
                                    break;
                                }
                            }
                            if (~index) {
                                taobao.carts[index].tr.remove();
                                taobao.carts.splice(index, 1);
                                taobao.recalculateTotal();
                            }
                        } catch (ex) {
                        }
                    } else {
                    }
                },
                beforeSend: function (xhr) {
                },
                error: function (xhr, msg) {
                },
                complete: function (xhr, ts) {
                }
            });
        });
    };

    var initOrder = function () {

        var getOrderValue = function () {
            return {
                "_csrf": $('#_csrf').val(),
                "tag": $('input[name="addressRadio"]:checked').val()
            };
        };
        var submit = $('#btn-order-submit');
        submit.click(function () {
            var i = $('input[name="addressRadio"]:checked');
            alert(i.val());
            $.post('/customer/order/new', getOrderValue()).done(function (data) {
                console.log(data);
                if (data.result === 'success') {
                    window.location = data.nextUrl;
                } else {

                }
            }).fail(function (err) {
                alert(err);
            }).always(function () {
            });

        });
    };

    var initAddress = function () {
        var addr_anchor = $('#new-address-anchor'),
            addr_submit = $('#btn-submit-address'),
            addr_container = $('div.address-container'),
            addr_editor = $('div.new-address-wrapper > div.new-address-editor'),
            addr_cancel = $('#btn-cancel-address');

        addr_anchor.click(function () {
            addr_editor.removeClass('hidden');
            addr_editor.slideDown();
        });

        addr_submit.click(function () {
            var getAddressInfo = function () {
                return {
                    "tag": $('input#inputTag').val(),
                    "country": $('select#countrySelect').val(),
                    "zipCode": $('input#inputZipCode').val(),
                    "addressee": $('input#inputAddressee').val(),
                    "addresseeContact": $('input#inputContact').val(),
                    "address": $('input#inputAddress').val(),
                    "_csrf": $('#_csrf').val()
                }
            };
            var addressInfo = getAddressInfo();
            $.post('/customer/address/new', addressInfo).done(function (data) {
                if (data.result === 'success') {
                    $('input[name="addressRadio"]').each(function () {
                        var me = $(this);
                        me.attr('checked', false);
                    });
                    $('<div class="radio address-wrapper"><label><input type="radio" name="addressRadio" id="' + addressInfo.tag + '" value="' + addressInfo.tag + '" checked="true">' + addressInfo.tag + '</label><span class="info-details">' + addressInfo.address + ',' + addressInfo.addressee + ' ' + addressInfo.addresseeContact + '</span></div>').prependTo(addr_container);
                    addr_editor.slideUp();
                } else {

                }
            }).fail(function () {
                alert('fail');
            }).always(function () {
            });
        });

        addr_cancel.click(function () {
            addr_editor.slideUp();
        });
    };

    $(document).ready(function () {
        initData();
        initOrder();
        initAddress();
    });

    window.focusTaobao = taobao;
    return taobao;
})(window.focusTaobao || {}, window.jQuery);