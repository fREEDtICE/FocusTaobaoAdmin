var top_cat = require("./top_cats"),
    top_item = require("./top_items"),
    customer = require("./customer"),
    admin = require("./admin");


module.exports = function (app) {
    top_cat(app);
    top_item(app);
    customer(app);
    admin(app);
}