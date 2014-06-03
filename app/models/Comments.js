//var mongoose = require('mongoose'),
//    Schema = mongoose.Schema,
//    validator = require('validator'),
//    ObjectId = Schema.Types.ObjectId,
//    Mixed = Schema.Types.Mixed;
//
//var CommentsSchema = new Schema({
////    firstName: {type: String},
////    lastName: {type: String},
////    email: {type: String, required: true, unique: true},
////    gender: Number,
////    phone: {type: String, unique: true},
////    salt: Buffer,
////    pwd: {type: String, required: true},
////    lastLogin: {type: Number, default: Date.now()},
////    favoriteShipments: [
////        {type: ObjectId, ref: Shipment.schema}
////    ]
//});
//
//var Customer = mongoose.model('Customer', CustomerSchema);
//
//Customer.schema.path("email").validate(function (v) {
//    return validator.isEmail(v);
//}, "invalid email");
//
//Customer.schema.path("gender").validate(function (v) {
//    return /0|1|-1/i.test(v);
//}, "invalid gender");
//
//Customer.schema.path("phone").validate(function (v) {
//    return  /^\d{6,15}$/.test(v);
//}, "invalid phone");
//
//
//module.exports.schema = exports.schema = CustomerSchema;
//
//module.exports.model = exports.model = Customer;