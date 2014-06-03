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


var ProductSchema = new Schema({

});


var Product = mongoose.model('Product', ProductSchema);

module.exports.schema = exports.schema = ProductSchema;

module.exports.model = exports.model = Product;
