var unirest = require("unirest");
const api_key = require('./api_key.json')["FINN_API_KEY"]
const WebSocket = require('ws')
const socket_const = require('../sockets/socket_constants')
function GetStockCandle(symbol, resolution, ws,callback) {
  const req = unirest("GET", "https://finnhub.io/api/v1/stock/candle");
  console.log("symbol:",symbol)
  defaultCount = "15";

  req.query({
  	"count": defaultCount,
  	"symbol": symbol,
  	"resolution": resolution,
    "token": api_key
  });
  console.log(JSON.stringify({
  	"count": "200",
  	"symbol": symbol,
  	"resolution": resolution,
    "token": api_key
  }));
  req.end(function (res) {
  	if (res.error) {
      console.error("res.error")
    }
   var result = {type: socket_const.PRICE_HISTORY, result: res.body}   
    //console.log("reswponse for getStockCandle", res.body)
  	callback(ws, JSON.stringify(result));
  });
}

const socket = new WebSocket('wss://ws.finnhub.io?token=' + api_key);

// Connection opened -> Subscribe
function SubscribeToStock(symbols, ws, callbackFunction) {
  socket.addEventListener('open', function (event) {
    for (s in symbols) {
      socket.send(JSON.stringify({'type':'subscribe', 'symbol': s}))
    }
  });
  // Listen for messages
  socket.addEventListener('message', function (event) {
      console.log('Message from server ', event.data);
      callbackFunction(ws, event.data);
  });
}

function UnsubscribeStock(symbols){
// Unsubscribe
  for (s in symbols) {
     var unsubscribe = function(s) {
        socket.send(JSON.stringify({'type':'unsubscribe','symbol': s}))
    }
  }
}
module.exports = {
  FinnFunctions: function(type, params, ws, callback) {
    if (type === socket_const.PRICE_HISTORY) {
      GetStockCandle(params.SYMBOL, params.RESOLUTION, ws,callback);
    }else if (type === socket_const.REALTIME_QUOTE) {
      return SubscribeToStock(params[socket_const.SYMBOL], ws, callback)
    }else {
      throw Err("Unknown type specified", type)
    }
  }
}
