(function ($) {
    var form = $('form#main'),
        $csrf = $('input[name="_csrf"]'),
        inputToken = $('input#token'),
        submitBtn = $('button'),
        inputPwd = $('input#pwd');


    submitBtn.click(function (e) {
//        var signatureObj = $.signature($.trim(inputToken.val()));
        var data = {
            token: $.trim(inputToken.val()),
            pwd: $.trim($.md5($.md5(inputPwd.val()))),
            _csrf: $csrf.val()
//            signature: signatureObj.signature,
//            nonce: signatureObj.nonce,
//            timestamp: signatureObj.timestamp,
//            echostr: signatureObj.echostr
        };

        $.post("/super/login", data,
            function (data, status) {
                if ('success' != status) {

                } else if (data && data.errorCode) {
                    switch (data.errorCode) {
                        case 1:
                            break;
                        case 2:
                            break;
                        case 3:
                            break;
                    }
                } else {
                    window.location.assign("/super/main");
                }
            });
    });
})(window.jQuery);