/**
 * Module dependencies.
 */

//var cluster = require('cluster');

//if (cluster.isMaster) {
//    // Count the machine's CPUs
//    var cpuCount = require('os').cpus().length;
//
//    // Create a worker for each CPU
//    for (var i = 0; i < cpuCount; i += 1) {
//        cluster.fork();
//    }
////
//    cluster.on('listening', function (worker) {
//        console.log('Worker ' + worker.id + ' listening :)');
//    });
//    cluster.on('exit', function (worker) {
//        // Replace the dead worker,
//        // we're not sentimental
//        console.log('Worker ' + worker.id + ' died :(');
//        cluster.fork();
//
//    });
//} else if (cluster.isWorker) {
var fs = require('fs'),
    express = require('express'),
    http = require('http'),
    path = require('path'),
    mongoose = require('mongoose'),
    passport = require('passport');


var env = process.env.NODE_ENV || 'development',
    config = require('./config/config')[env];

//require('./config/database')(config);
require('top-models');
// bootstrap passport config
require('./config/passport')(passport, config);
var app = express();

exports.expressApp = app;

// Bootstrap routes
//require('./config/routes')(app, passport);

// express settings
require('./config/express')(app, config, passport);

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

var server = http.createServer(app).listen(app.get('port'), function () {
    // chan
    if (process.getgid && process.setgid) {
        console.log('Current gid: ' + process.getgid());
        try {
            process.setgid(config.security.runtime.gid);
            console.log('New gid: ' + process.getgid());
        }
        catch (err) {
            console.log('Failed to set gid: ' + err);
        }
    }

    if (process.getuid && process.setuid) {
        console.log('Current gid: ' + process.getuid());
        try {
            process.setuid(config.security.runtime.uid);
            console.log('New gid: ' + process.getuid());
        }
        catch (err) {
            console.log('Failed to set uid: ' + err);
        }
    }


    console.log('Express server listening on port ' + app.get('port'));
});
//    console.log(app.routes);
//}