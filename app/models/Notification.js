var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    ObjectId = Schema.Types.ObjectId,
    Mixed = Schema.Types.Mixed;

var NotificationSchema = new Schema({
    userId: {type: ObjectId, required: true},
    notifications: [
        {
            id: ObjectId,
            catalog: {type: String, required: true},
            status: Number,
            level: Number,
            message: String,
            changes: [
                {
                    actor: ObjectId,
                    message: String,
                    verb: String
                }
            ]
        }
    ]
});

var Notification = mongoose.model("Notification", NotificationSchema);

module.exports.schema = exports.schema = NotificationSchema;

module.exports.model = exports.model = Notification;
