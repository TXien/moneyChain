var http_port = process.env.HTTP_PORT || 3001;
var express = require("express");
var bodyParser = require('body-parser');
var WebSocket = require("ws");

var p2p_port = process.env.P2P_PORT || 6001;
var sockets = [];

var httpServer = () => {
    var app = express();
    app.use(bodyParser.json());
    app.post('/addPeer', (req, res) => {
	connectToPeers([req.body.peer]);
	res.send("");
    });
    app.post('/mineBlock', (req, res) => {
        broadcast("222");
        res.send();
    });
    app.get('/peers', (req, res) => {
        res.send(sockets.map(s => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.listen(1124, () => console.log('Listening http on port: ' + 1124));
};



var P2PServer = () => {
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => connection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);

};
P2PServer();
var Connection = (ws) => {
    sockets.push(ws);
    messageHandler(ws);
    write(ws, queryChainLengthMsg());
};

var messageHandler = (ws) => {
    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));

    });
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => connection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};
var broadcast = (message) => sockets.forEach(socket => write(socket, message));
var queryChainLengthMsg = () => ({'type': 0});
var write = (ws, message) => ws.send(JSON.stringify(message));
httpServer();
