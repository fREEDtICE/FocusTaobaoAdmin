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

var LangDictItemSchema = new Schema({
    langId: {type: String, required: true},
    langValue: String
});

var LangDictSchema = new Schema({
    key: {type: String, required: true, unique: true},
    langs: [LangDictItemSchema]
});

var LangDictItem = mongoose.model('LangDictItem', LangDictItemSchema);

var LangDict = mongoose.model('LangDict', LangDictSchema);

module.exports.searchDictByLang = exports.searchDictByLang = function searchDictByLang(lang, cb) {
    cb = (cb instanceof Function) ? cb : new function () {
    };
    if (!lang) {
        return cb("invalid parameter");
    }

    LangDict.find({"lang.id": lang}, function (err, docs) {
        return cb(err, docs);
    });
};

LangDict.schema.methods.getLangLabel = function (lang) {
    if (!this.langs || !this.langs.length) {
        return;
    }
    var me = this,
        i = me.langs.length;

    while (i--) {
        if (me.langs[i].langId === lang) {
            return me.langs[i].langValue;
        }
    }
}

LangDict.schema.methods.addLang = function (lang, value) {
    var me = this;

    function getLangObj() {
        if (!me.langs || !me.langs.length) {
            return;
        }
        var i = me.langs.length;

        while (i--) {
            if (me.langs[i].langId === lang) {
                return me.langs[i];
            }
        }
    }

    var obj = getLangObj();
    if (obj) {
        obj.value = value;
    } else {
        obj = new LangDictItem({
            langId: lang,
            langValue: value
        });
        me.langs.push(obj);
    }

    return me.save(function (err) {
        console.log(err);
    });
};

module.exports.langSchema = exports.langSchema = LangDictSchema;

module.exports.langModel = exports.langModel = LangDict;

module.exports.itemSchema = exports.itemSchema = LangDictItemSchema;

module.exports.itemModel = exports.itemModel = LangDictItem;


