module.exports = function (app, io) {
    var order = io
        .of('/cus/order')
        .on('connection', function (socket) {
            socket.emit('a message', {
                that: 'only', '/chat': 'will get'
            });
            chat.emit('a message', {
                everyone: 'in', '/chat': 'will get'
            });
        });
};