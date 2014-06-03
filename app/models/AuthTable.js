var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var validator = require("validator"),
    _ = require("lodash");

var Roles = require('./Admin').Roles;

var AuthTableSchema = new Schema({
    role: {type: String, unique: true, required: true},
    authInfo: [
        {
            url: {type: String, required: true},
            method: {type: String, required: true, default: "get"}
        }
    ]
});

AuthTableSchema.path('role').validate(function (v) {
    return _.contains(Roles, v);
}, "invalid role");


var AuthTable = mongoose.model('AuthTable', AuthTableSchema);


function AuthManager() {
    this.init();
};

AuthManager.prototype.init = function () {
    this.auths = {};
    var me = this;
    AuthTable.find(null, function (err, data) {
        _.forEach(data, function (item) {
//            var roleAuth = {};
//            _.forEach(item.authInfo, function (item) {
//                var method = item.method,
//                    url = item.url;
//                if (!(method in roleAuth)) {
//                    roleAuth[method] = [];
//                }
//                var methodContainers = roleAuth[method];
//                if (!_.contains(methodContainers, url)) {
//                    methodContainers.push(url);
//                }
//            });
//            me.auths[item.role] = roleAuth;
            me.auths[item.role] = {
                db: item,
                changed: false
            };
        });
    });
};


AuthManager.prototype.save = function () {

};

AuthManager.prototype.newAuth = function (role, url, method) {

};

AuthManager.prototype.hasAuth = function (role, url, method) {

};

AuthManager.prototype.delAuth = function (role, url, method) {

};


exports = module.exports = new AuthManager();

//AuthTable.path('authInfo.method').validate(function (v) {
//    return typeof v === 'string' && /get|post/i.test(v.toLowerCase());
//}, "invalid auth method");
//
//AuthTable.path('authInfos.url').validate(function (v) {
//    return validator.isURL(v);
//}, "invalid url");