var unirest = require("unirest");
var querystring = require('querystring');
var formatISO = require('date-fns/formatISO')
var addMonths = require('date-fns/addMonths')
const api_key = require('./api_key.json')["TD_API_KEY"]
const WebSocket = require('ws')
const socket_const = require('../sockets/socket_constants')
const access_token_obj = require('../python/tradeML/trade_api/tmp/access_token.json')
const db_api = require('../db_api/index')
const user_api = require('./user_api')

function GetPriceHistory(symbol, ws, callback) {
    var token = access_token_obj["access_token"]
    var bearerToken = 'Bearer ' + token;
    url = "https://api.tdameritrade.com/v1/marketdata/" + symbol + "/pricehistory?apiKey=" + api_key;
    console.log("sending request to td:", url, api_key);
    var req  =unirest.get(url)
    .headers('Authorization:' + bearerToken)
    .end(function(res) {
        if (res.error){
            console.error(Res.error);
        }
    })
    var finalObj = {type: socket_const.PRICE_HISTORY, result: res.body}
    var finalObjStr = JSON.stringify(finalObj);
    console.log("price_history returns:", finalObjStr);
    callback(ws, finalObjStr);
}
function GetQuote(symbol, ws, callback) {
  var token = access_token_obj["access_token"]
  var bearerToken = 'Bearer ' + token;
  var url = "https://api.tdameritrade.com/v1/marketdata/quotes?apikey=" + api_key + "&symbol=" + symbol;
  console.log("sending request to td:", url, api_key);
  const req = unirest.get(url)
  .headers('Authorization:' + bearerToken)
  .end(function (res) {
  	if (res.error) {
      console.error(res.error)
    }
   //console.log("reswponse for getStockCandle", res.body)
   //console.log("quotes returns:", res.body)
   var finalObj = {type: socket_const.REALTIME_QUOTE, result: res.body}
   var finalObjStr = JSON.stringify(finalObj);
      console.log("quotes returns:", finalObj.type);
  	callback(ws, finalObjStr);
  });
}
function GetOptionChain(symbol, ws, callback){
    var token = access_token_obj["access_token"]
    var bearerToken = 'Bearer ' + token;
    var todayDate = new Date();
    var fromDate = formatISO(todayDate).substr(0,10)
    var targetDate = addMonths(todayDate, 2);
    var toDate = formatISO(targetDate).substr(0,10);
    var url = "https://api.tdameritrade.com/v1/marketdata/chains?apikey=" + api_key + "&symbol=" + symbol + "&contractType=ALL&strikeCount=25&fromDate" + fromDate + "&toDate=" + toDate;
    console.log("sending request to td:", url, api_key);
    const req = unirest.get(url)
    .headers('Authorization:' + bearerToken)
    .end(function (res) {
  	     if (res.error) {
            console.error(res.error)
        }
        console.log("reswponse for options", res.body)
        console.log("quotes returns:", res.body)
        var finalObj = {type: socket_const.OPTION_CHAIN, result: res.body}
        var finalObjStr = JSON.stringify(finalObj);
        console.log("quotes returns:", finalObj.type);
  	     callback(ws, finalObjStr);
    });

    
}
function AddToFilter(params, watchlists) {
    if (params.filter !== null) {
        if (Array.isArray(params.filter)) {
            params.filter.forEach(function(obj){
                obj.symbol = watchlists;
            })
        } else {
            params.filter = {"symbol" : watchlists};
        }
    }
    else {
        params.filter = {"symbol" : watchlists }
    }
    console.log(JSON.stringify(params));
    return params;
}
module.exports = {
  TdFunctions: function(type, params, ws, callback) {
    if (type === socket_const.REALTIME_QUOTE) {
      GetQuote(params.SYMBOL, ws, callback);
    }else if (type === socket_const.OPTION_CHAIN){
        GetOptionChain(params.SYMBOL, ws, callback);
    }else if (type === socket_const.OPTION_STATS || type === socket_const.OPTION_STATS_FIELDS){
        var watchlists = null;
        console.log("watch_list_name", params["WATCH_LIST_NAME"]);
        if (params["WATCH_LIST_NAME"] !== undefined) {
            var watchlists_result =  user_api.WatchListFuncs(socket_const.GET_WATCHLIST_BYNAME, params,null, null);
            console.log("watchlists", watchlists_result)
            var watchlists = watchlists_result.result[params["WATCH_LIST_NAME"]]
            if (watchlists !== null)
                params = AddToFilter(params, watchlists)
        }
        db_api.DbFunctions(type, params, ws, callback);
    }else {
      console.error("Unknown type specified in td_api", type)
    }
  }
}
