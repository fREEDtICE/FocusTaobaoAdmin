/**
 * Created with JetBrains WebStorm.
 * User: steven
 * Date: 14-4-10
 * Time: 下午8:35
 * To change this template use File | Settings | File Templates.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var ShipmentSchema = new Schema({
    trackingNumber: {type: String, unique: true, required: true},
    shippingDate: {type: Number, required: true},
    address: {type: String, required: true},
    label: String,
    recipient: String,
    cellphone: String,
    zipcode: String,
    country: String,
    state: String,
    street: String
});

var Shipment = mongoose.model('Shipment', ShipmentSchema);

module.exports.schema = exports.schema = ShipmentSchema;

module.exports.model = exports.model = Shipment;



