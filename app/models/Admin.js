var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var validator = require("validator"),
    _ = require("lodash");

var ValidRoles = ["super", "buyer", "logistic", "admin", "customer service"],
    Status = {
        "NotConfirmed": 0,
        "Normal": 1,
        "Forbidden": 2
    };


var AdminSchema = new Schema({
    token: {type: String, unique: true, required: true},
    salt: {type: String, required: true},
    hpwd: {type: String, required: true},
    role: String,
    lastLogin: {type: Number, default: Date.now()},
    status: {type: Number, default: Status.Normal}
});

AdminSchema.virtual("password").set(function (pwd) {
    this.salt = this.makeSalt();
    this.hpwd = this.encryptPassword(pwd, this.salt);
    this.pwd = pwd;
}).get(function () {
    return this.pwd;
});


AdminSchema.path("role").validate(function (v) {
    return _.contains(ValidRoles, v);
}, "invalid role");

AdminSchema.methods.makeSalt = function () {
    return require("crypto").randomBytes(32).toString('base64');
};

AdminSchema.methods.authenticate = function (pwd) {
    return this.hpwd === this.encryptPassword(pwd);
};

AdminSchema.methods.encryptPassword = function (pwd) {
    if (!pwd) {
        return '';
    }
    try {
        return require("crypto").createHmac('sha1', this.salt).update(pwd).digest('hex');
    } catch (err) {
        return ''
    }
};

var Admin = mongoose.model('Admin', AdminSchema);

module.exports.schema = exports.schema = AdminSchema;

module.exports.model = exports.model = Admin;

module.exports.Roles = exports.Roles = ValidRoles;

module.exports.Status = exports.Status = Status;

Admin.find({"token": "superadmin"}, function (err, data) {
    if (err || !data || !data.length) {
        var admin = new Admin({
            "token": "superadmin",
            "role": "super",
            "status": Status.Normal
        });

        admin.password = "123456";

        admin.save(function (err) {
            console.log('init admin, err %s', err);
        });
    } else {
        console.log(data);
        console.log('super admin already exsits');
    }
});
