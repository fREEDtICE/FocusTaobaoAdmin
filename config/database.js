var mongoose = require('mongoose');

module.exports = function (config) {
    // mongoose连接
    var connect = function () {
        mongoose.connect(config.db, config.mongoose.options);
        require('mongoose-auto-increment').initialize(mongoose.connection);
    }
    connect();


// Error handler
    mongoose.connection.on('error', function (err) {
        console.log(err);
    });

    // 断连时自动重连
    mongoose.connection.on('disconnected', function () {
        connect();
    });

};