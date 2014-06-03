var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    ObjectId = Schema.ObjectId;

var _ = require('lodash');

var validTypes = ["string", "float", "int", "blob", "buffer", "boolean"];

var SystemConfigSchema = new Schema({
    name: {type: String, required: true, unique: true},
    type: {type: String, required: true, default: "string"},
    value: String
});


SystemConfigSchema.path("type").validate(function (v) {
    if (typeof v !== 'string') {
        return false;
    }
    return _.contains(validTypes, v.toLowerCase());
}, "invalid type");

SystemConfigSchema.path("value").get(function () {
    var _self = this;
    switch (_self.type) {
        case "float":
            return parseFloat(_self.value);
        case "boolean":
            return new Boolean(self.value);
        case "int":
            return parseInt(_self.value);

        default :
            return _self.value;
    }
});

var SystemConfig = mongoose.model("SystemConfig", SystemConfigSchema);

module.exports.schema = exports.schema = SystemConfigSchema;

module.exports.model = exports.model = SystemConfig;