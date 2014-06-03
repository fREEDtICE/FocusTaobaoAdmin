!(function ($) {
    $(document).ready(function () {
        var form = $('form#main');
        var userNameInput = $('input#inputName');
        var pwdInput = $('input#inputPassword');
        var confirmPwdInput = $('input#confirmPassword');
        var verifyInput = $('input#intputVerify');
        var imgVerify = $('img#imgVerify');
        var verifyChange = $('a#changeimg_link');
        var submitBtn = $('button#submitBtn');

        var tokenTips = $('span#token-tips');
        var pwdTips = $('span#pwd-tips');
        var cfmPwdTips = $('span#confirm-pwd-tips');
        var verifyTips = $('span#verify-tips');
        var typeRadios = $("input[name='userTypeRadios']");
        var $csrf = $("input[name='_csrf']");

//        var labelTips = $('span#label-tips');
//        var wechatTokenTips = $('span#wechat-token-tips');

//        var labelInput = $('input#inputLabel');
//        var wechatTokenInput = $('input#inputWeChatToken');


        function getAdminType() {
            var l = typeRadios.length;
            var typeValue = "buyer";
            while (l--) {
                if (typeRadios[l].checked) {
                    typeValue = $(typeRadios).val();
                    break;
                }
            }

            return typeValue;
        };

        var getLoginData = function () {


            return {
                account: $.trim(userNameInput.val()),
                pwd: $.trim(pwdInput.val()),
                cfmPwd: $.trim(confirmPwdInput.val()),
                verifyTxt: $.trim(verifyInput.val()),
                type: getAdminType()
//                label: $.trim(labelInput.val()),
//                wechatToken: $.trim(wechatTokenInput.val())
            };
        };

        var getVerifyImg = function () {
            $.ajax({
                url: '/tools/verify?reportCode=105&random=' + Math.random(),
                success: function (data) {
                    verifyInput.val('');
                    imgVerify.attr("src", data);
                }
            });
        };

        imgVerify.click(function (e) {
            getVerifyImg();
        });

        verifyChange.click(function (e) {
            getVerifyImg();
        });

        var inputs = form.find("input");

        if (inputs && inputs.length) {
            var i = 0, max = inputs.length;
            for (i = 0; i < max; i++) {
                var ipt = inputs[i];
//                ipt.keydown(function (e) {
//                    e.keyCode == 13
//                });
                ipt.blur(function () {
                    validateForm();
                });
            }
        }

        var validateForm = function () {
            var validate = false;
            var inputs = getLoginData();

            form.find('span.help-block').addClass('hide');

            if ('' == inputs.account) {
                tokenTips.removeClass('hide').text('*请填写用户名');
                userNameInput.focus().select();
            } else if (!/^[0-9a-z_]+$/i.test(inputs.account)) {
                tokenTips.removeClass('hide').text('*用户名由字母和数字组成');
                userNameInput.focus().select();
            } else if ('' == inputs.pwd) {
                pwdTips.removeClass('hide').text('*请填写密码');
                pwdInput.focus().select();
            } else if ('' == inputs.cfmPwd) {
                cfmPwdTips.removeClass('hide').text('*请确认密码');
                confirmPwdInput.focus().select();
            } else if (inputs.pwd.length < 6) {
                cfmPwdTips.removeClass('hide').text('*密码不能少于6位');
                confirmPwdInput.focus().select();
            } else if (inputs.pwd != inputs.cfmPwd) {
                cfmPwdTips.removeClass('hide').text('*两次密码输入不一致, 请重新输入.');
                confirmPwdInput.focus().select();
            } else if ('' == inputs.verifyTxt || 4 != inputs.verifyTxt.length) {
                verifyTips.removeClass('hide').text('*请输入4位验证码');
                verifyInput.focus().select();
            } else {
                validate = true;
            }
            return validate;
        };

        getVerifyImg();

        submitBtn.click(function (e) {
            if (validateForm()) {
//                form.submit(function () {
                var pwd = $.md5($.md5(pwdInput.val())),
                    verify = verifyInput.val(),
                    token = userNameInput.val(),
                    type = getAdminType();
                var timestamp = new Date().getTime();
                var nonce = parseInt(Math.random() * 1000);
                var array = new Array(4);
                array.push(pwd);
                array.push(timestamp);
                array.push(nonce);
                array.sort();
                var signature = $.md5(array.join(''));
//                var url = "/user/add";
//                    $.ajax({
//                        type: "POST",
//                        url: url,
//                        data: {token: token, pwd: pwd, verify: verify},
//                        dataType: 'json',
//                        success: function (e) {
//
//                        }
//                    });
                $.post("/super/add", {token: token,
                        adt: type,
                        pwd: pwd,
                        verify: verify,
                        echostr: pwd,
                        signature: signature,
                        timestamp: timestamp,
                        nonce: nonce,
                        _csrf: $csrf.val(),
                        type: "json"},
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
                            window.location.assign("/super/login");
                        }
                    });
//                });
            }
        });
    });
}(window.jQuery));