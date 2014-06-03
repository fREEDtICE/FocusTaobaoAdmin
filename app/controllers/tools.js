var status = require("../datas/ResponseStatusCode").ResponseStatusCode,
    httpHelper = require("../../utils/HttpHelper"),
    VerifyCodeHelper = require("../../utils/VerifyCodeHelper");

exports.makeVerifyCode = function (req, res) {
    VerifyCodeHelper.generateVerifyCode(req, res, function (err, vcode, buf) {
        if (err) {
            return httpHelper.JSONResponse(res, {errorCode: status.system_err});
        }
        req.session.verifycode = vcode.toLowerCase();
        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': Buffer.byteLength(buf) });
        res.end(buf);
    });
};
