/*! taobaofocus 2014-06-04 */

!function(a){a(document).ready(function(){function b(){for(var b=o.length,c="buyer";b--;)if(o[b].checked){c=a(o).val();break}return c}var c=a("form#main"),d=a("input#inputName"),e=a("input#inputPassword"),f=a("input#confirmPassword"),g=a("input#intputVerify"),h=a("img#imgVerify"),i=a("a#changeimg_link"),j=a("button#submitBtn"),k=a("span#token-tips"),l=a("span#pwd-tips"),m=a("span#confirm-pwd-tips"),n=a("span#verify-tips"),o=a("input[name='userTypeRadios']"),p=a("input[name='_csrf']"),q=function(){return{account:a.trim(d.val()),pwd:a.trim(e.val()),cfmPwd:a.trim(f.val()),verifyTxt:a.trim(g.val()),type:b()}},r=function(){a.ajax({url:"/tools/verify?reportCode=105&random="+Math.random(),success:function(a){g.val(""),h.attr("src",a)}})};h.click(function(){r()}),i.click(function(){r()});var s=c.find("input");if(s&&s.length){var t=0,u=s.length;for(t=0;u>t;t++){var v=s[t];v.blur(function(){w()})}}var w=function(){var a=!1,b=q();return c.find("span.help-block").addClass("hide"),""==b.account?(k.removeClass("hide").text("*请填写用户名"),d.focus().select()):/^[0-9a-z_]+$/i.test(b.account)?""==b.pwd?(l.removeClass("hide").text("*请填写密码"),e.focus().select()):""==b.cfmPwd?(m.removeClass("hide").text("*请确认密码"),f.focus().select()):b.pwd.length<6?(m.removeClass("hide").text("*密码不能少于6位"),f.focus().select()):b.pwd!=b.cfmPwd?(m.removeClass("hide").text("*两次密码输入不一致, 请重新输入."),f.focus().select()):""==b.verifyTxt||4!=b.verifyTxt.length?(n.removeClass("hide").text("*请输入4位验证码"),g.focus().select()):a=!0:(k.removeClass("hide").text("*用户名由字母和数字组成"),d.focus().select()),a};r(),j.click(function(){if(w()){var c=a.md5(a.md5(e.val())),f=g.val(),h=d.val(),i=b(),j=(new Date).getTime(),k=parseInt(1e3*Math.random()),l=new Array(4);l.push(c),l.push(j),l.push(k),l.sort();var m=a.md5(l.join(""));a.post("/super/add",{token:h,adt:i,pwd:c,verify:f,echostr:c,signature:m,timestamp:j,nonce:k,_csrf:p.val(),type:"json"},function(a,b){if("success"!=b);else if(a&&a.errorCode)switch(a.errorCode){case 1:break;case 2:break;case 3:}else window.location.assign("/super/login")})}})})}(window.jQuery),!function(a){a(document).ready(function(){function b(){for(var b=o.length,c="buyer";b--;)if(o[b].checked){c=a(o).val();break}return c}var c=a("form#main"),d=a("input#inputName"),e=a("input#inputPassword"),f=a("input#confirmPassword"),g=a("input#intputVerify"),h=a("img#imgVerify"),i=a("a#changeimg_link"),j=a("button#submitBtn"),k=a("span#token-tips"),l=a("span#pwd-tips"),m=a("span#confirm-pwd-tips"),n=a("span#verify-tips"),o=a("input[name='userTypeRadios']"),p=a("input[name='_csrf']"),q=function(){return{account:a.trim(d.val()),pwd:a.trim(e.val()),cfmPwd:a.trim(f.val()),verifyTxt:a.trim(g.val()),type:b()}},r=function(){a.ajax({url:"/tools/verify?reportCode=105&random="+Math.random(),success:function(a){g.val(""),h.attr("src",a)}})};h.click(function(){r()}),i.click(function(){r()});var s=c.find("input");if(s&&s.length){var t=0,u=s.length;for(t=0;u>t;t++){var v=s[t];v.blur(function(){w()})}}var w=function(){var a=!1,b=q();return c.find("span.help-block").addClass("hide"),""==b.account?(k.removeClass("hide").text("*请填写用户名"),d.focus().select()):/^[0-9a-z_]+$/i.test(b.account)?""==b.pwd?(l.removeClass("hide").text("*请填写密码"),e.focus().select()):""==b.cfmPwd?(m.removeClass("hide").text("*请确认密码"),f.focus().select()):b.pwd.length<6?(m.removeClass("hide").text("*密码不能少于6位"),f.focus().select()):b.pwd!=b.cfmPwd?(m.removeClass("hide").text("*两次密码输入不一致, 请重新输入."),f.focus().select()):""==b.verifyTxt||4!=b.verifyTxt.length?(n.removeClass("hide").text("*请输入4位验证码"),g.focus().select()):a=!0:(k.removeClass("hide").text("*用户名由字母和数字组成"),d.focus().select()),a};r(),j.click(function(){if(w()){var c=a.md5(a.md5(e.val())),f=g.val(),h=d.val(),i=b(),j=(new Date).getTime(),k=parseInt(1e3*Math.random()),l=new Array(4);l.push(c),l.push(j),l.push(k),l.sort();var m=a.md5(l.join(""));a.post("/super/add",{token:h,adt:i,pwd:c,verify:f,echostr:c,signature:m,timestamp:j,nonce:k,_csrf:p.val(),type:"json"},function(a,b){if("success"!=b);else if(a&&a.errorCode)switch(a.errorCode){case 1:break;case 2:break;case 3:}else window.location.assign("/super/login")})}})})}(window.jQuery);
//# sourceMappingURL=setup.min.map