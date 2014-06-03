function SocketIOManager(port) {
    port = ("number" === typeof port && port > 0) ? port : 9000;
    this.io = require("socket.io").listen(port);
};

SocketIOManager.prototype.addChanel = function(namespace, room, handler){

}
