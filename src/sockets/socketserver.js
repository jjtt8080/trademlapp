const express = require('express')
const http = require('http')
const url = require('url')
const WebSocket = require('ws')
const cors = require('cors')
const trade_api = require('../trade_api/index')
const app = express();
app.use(cors())

app.use(function (req, res) {
  res.send({ msg: "hello" });
});

const verifyClient = (info) => {
  console.log('ding dong')
  return true
}

function sleep(ms){
    return new Promise(resolve=>{
        setTimeout(resolve,ms)
    })
}

const server = http.createServer(app);
const wss = new WebSocket.Server({ server, verifyClient });
var counter = 1;

function callbackToClient(ws, msg) {
  ws.send(msg)
}
wss.on('connection', function connection(ws) {
  if (ws.upgradeReq !=  undefined) {
    const location = url.parse(ws.upgradeReq.url, true);
  }
  console.log("in on connection")
  ws.send('{"message":"connected"}')
  // You might use location.query.access_token to authenticate or share sessions
  // or ws.upgradeReq.headers.cookie (see http://stackoverflow.com/a/16395220/151312)

  ws.on('message', function incoming(message) {
    console.log('received: %s', message);
    messageJson = JSON.parse(message);
    if (messageJson.hasOwnProperty("type") & messageJson.hasOwnProperty("params")) {
      trade_api.TradeFunctions(messageJson.type, messageJson.params, ws,callbackToClient)
    }else {
      ws.send(message);
      console.log("finish echoing back")
    }

  });
});

server.listen(8567, function listening() {
  console.log('Listening on %d', server.address().port);
});
