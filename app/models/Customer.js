var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    validator = require('validator'),
    ObjectId = Schema.ObjectId;

var _ = require('lodash');

var cutil = require("../../utils/CommonUtils");

var CustomerSchema = new Schema({
    nick: String,
    email: {type: String, required: true, unique: true},
    gender: {type: Number, default: -1},
    phone: {type: String},
    salt: {type: String, required: true},
    hpwd: {type: String, required: true},
    status: {type: Number, default: 0},
    score: Number,
    points: Number,
    lastLogin: {type: Number, default: Date.now()},
    registerInfo: {
        confirmUrl: String,
        time: Number
    },
    moneyAccount: {
        paypal: {type: Number, dedault: 0},
        money: {type: Number, dedault: 0}
    },
    shippingAddress: [
        {
            country: String,
            zipCode: String,
            addressee: {type: String, required: true},
            addresseeContact: {type: String, required: true},
            address: {type: String, required: true},
            tag: String,
            lastUseTime: {type: Number, default: Date.now()}
        }
    ],
    shoppingcart: [
        {
            ask_price: Number,
            skuid: Number,
            detail_url: String,
            title: String,
            numiid: Number,
            img: String,
            sku_price: Number,
            prom_price: Number,
            price: Number,
            props: String,
            sel_prop: [
                {
                    cid: String,
                    cname: String,
                    id: String,
                    name: String,
                    alias: String
                }
            ],
            quantity: Number
        }
    ],
    favorites: [
        {
            tag: {type: String, default: "default"},
            items: [
                {
                    skuid: Number,
                    detail_url: String,
                    title: String,
                    numiid: Number,
                    img: String,
                    sku_price: Number,
                    prom_price: Number,
                    price: Number,
                    props: String,
                    sel_prop: [
                        {
                            cid: String,
                            cname: String,
                            id: String,
                            name: String,
                            alias: String
                        }
                    ]
                }
            ]
        }
    ]
});

CustomerSchema.virtual("password").set(function (pwd) {
    this.salt = this.makeSalt();
    this.hpwd = this.encryptPassword(pwd, this.salt);
    this.pwd = pwd;
}).get(function () {
    return this.pwd;
});

CustomerSchema.path("email").validate(function (v) {
    return validator.isEmail(v);
}, "invalid email");

CustomerSchema.path("gender").validate(function (v) {
    return /0|1|-1/i.test(v);
}, "invalid gender");

// FIXME Phone need to be unique
CustomerSchema.path("phone").validate(function (v) {
    return !v || /^\d{6,15}$/.test(v)
}, "invalid phone");


CustomerSchema.path("gender").set(function (v) {
    if (typeof v !== 'number') {
        v = parseInt(v) || -1;
    }
    this.gender = v;
});

CustomerSchema.static("checkNumFields", function (item, props) {
    var converter = function (v, t) {
        console.log("convert v = %s, t = %s", v, t);
        if (t === 'float') {
            return parseFloat(v) || v;
        } else if (t === 'int') {
            return parseInt(v) || v;
        }
    };
    _.forIn(props, function (props, type) {
        _.forEach(props, function (p) {
            console.log("item[p] %s , %s", p, item[p]);
            if (p in item && typeof item[p] !== "number") {
                item[p] = converter(item[p], type);
            }
        });
    });
});


CustomerSchema.methods.makeSalt = function () {
    try {
        var buf = require("crypto").randomBytes(32);
        return buf.toString("base64");
    } catch (ex) {
        console.log(ex);
        return cutil.echoStr(32);
    }
};

CustomerSchema.methods.authenticate = function (pwd) {
    return this.hpwd === this.encryptPassword(pwd);
};

CustomerSchema.methods.encryptPassword = function (pwd) {
    if (!pwd) {
        return '';
    }
    try {
        return require("crypto").createHmac('sha1', this.salt).update(pwd).digest('hex');
    } catch (err) {
        return ''
    }
};

CustomerSchema.methods.cookieToCart = function (items, cb) {
    if (!this.shoppingcart) {
        console.log("shoppingcart not exists");
        this.shoppingcart = [];
    }
    var self = this;
    _.forIn(items, function (v, k) {
        self.addItemToShoppingCart(v, false);
    });

    self.save(function (err) {
        console.log(err);
        if (typeof cb === 'function') {
            cb(err);
        }
    });
};

CustomerSchema.methods.adjustCartItemQuantity = function (skuid, quantity, cb) {
    var self = this;
    if (!self.shoppingcart) {
        console.log("shopping cart not init");
        return;
    }

    var index = _.findIndex(self.shoppingcart, {skuid: skuid});
    if (~index) {
        self.shoppingcart[index].quantity = quantity;
    }

    self.save(function (err) {
        console.log(err);
        if (typeof cb === 'function') {
            cb(err);
        }
    });
};

CustomerSchema.methods.removeCartItem = function (skuid, cb) {
    var self = this;
    if (!self.shoppingcart) {
        console.log("shopping cart not init");
        return;
    }

    var index = _.findIndex(self.shoppingcart, {skuid: skuid});
    if (~index) {
        self.shoppingcart.splice(index, 1);
    }

    self.save(function (err) {
        console.log(err);
        if (typeof cb === 'function') {
            cb(err);
        }
    });
};

CustomerSchema.methods.addItemToShoppingCart = function (item, save) {
    item = typeof item === "object" ? item : JSON.parse(item);

    save = save || true;

    Customer.checkNumFields(item, {
        "float": ["sku_price", "price", "prom_price", "ask_price"],
        "int": ["skuid", "numiid", "quantity"]
    });

    var self = this;

    if (!self.shoppingcart) {
        self.shoppingcart = [];
    }

    var index = _.findIndex(self.shoppingcart, {skuid: item.skuid});
    console.log(item.skuid + " index is " + index);
    if (~index) {
        self.shoppingcart[index].quantity += item.quantity;
    } else {
        self.shoppingcart.push(item);
    }

    if (save) {
        self.save(function (err) {
            console.log(err);
        });
    }
};


var Customer = mongoose.model('Customer', CustomerSchema);

module.exports.schema = exports.schema = CustomerSchema;

module.exports.model = exports.model = Customer;