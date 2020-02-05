var unirest = require("unirest");
const api_key = require('./api_key.json')["FINN_API_KEY"]
//const WebSocket = require('ws')
const socket_const = require('../sockets/socket_constants')
function minutesSinceMarketOpen() {
  var dateNow = new Date();
  //console.log(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), dateNow.getHours(), dateNow.getMinutes());
  var dateMarketOpen = new Date(dateNow.getFullYear(), dateNow.getMonth(), dateNow.getDate(), 6, 30, 0)
  //console.log(dateMarketOpen)
  var seconds = Math.floor((dateNow - (dateMarketOpen))/1000);
  var minutes = Math.floor(seconds / 60) + 1;
  return minutes;
}
function GetResolutionCount(r) {
  var resolution = String(r).slice(-1)
  var count = Number(String(r).slice(0, -1))
  if (r == "5Y") {
    resolution = "M"
    count *= 2;
  }
  else if( r === "1Y") {
    resolution = "W"
    count = 52;
  }else if (r === '1M') {
    count = 30;
    resolution = 'D';
  }
  else if (r === '1D' || resolution === 'm') {
    var minutes = minutesSinceMarketOpen();
    resolution = count;
    count = Math.floor(minutes / resolution);
  }
  console.log(JSON.stringify({"resolution": resolution, "count": count}))
  return {"resolution": resolution, "count": count};
}
function GetStockCandle(symbol, resolution, ws,callback) {
  const req = unirest("GET", "https://finnhub.io/api/v1/stock/candle");
  console.log("symbol:",symbol)
  var rc = GetResolutionCount(resolution);

  req.query({
  	"count": rc.count,
  	"symbol": symbol,
  	"resolution": rc.resolution,
    "token": api_key
  });
  /*
  console.log(JSON.stringify({
  	"count": rc.count ,
  	"symbol": symbol,
  	"resolution": rc.resolution,
    "token": api_key
  }));
  */
  req.end(function (res) {
  	if (res.error) {
      console.error("res.error")
    }
   var result = {type: socket_const.PRICE_HISTORY, result: res.body}   
    //console.log("reswponse for getStockCandle", res.body)
  	callback(ws, JSON.stringify(result));
  });
}
/*
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
      //console.log('Message from server ', event.data);
      callbackFunction(ws, event.data);
  });
}
*/

module.exports = {
  FinnFunctions: function(type, params, ws, callback) {
    if (type === socket_const.PRICE_HISTORY) {
      GetStockCandle(params.SYMBOL, params.RESOLUTION, ws,callback);
    }else {
      throw Error("Unknown type specified", type)
    }
  }
}
