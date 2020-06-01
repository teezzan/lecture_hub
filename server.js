var app = require('./app');
var port = process.env.PORT || 3000;
const SocketServer = require('ws').Server;

var server = app.listen(port, function() {
  console.log('Express server listening on port ' + port);
});

// const wss = new SocketServer({ server });
// //init Websocket ws and handle incoming connect requests
// wss.on('connection', function connection(ws) {
//     console.log("connection ...");
//     //on connect message
//     ws.on('message', (data) => {

//       // sends the data to all connected clients
//       wss.clients.forEach((client) => {
//           if (client.readyState === WebSocket.OPEN) {
//             client.send(data);
//           }
//       });
//     });
//     ws.send('message from server at: ' + new Date());
// });