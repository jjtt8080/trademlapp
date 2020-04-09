var unirest = require("unirest");
const api_key = require('./config/api_key.json')["TD_API_KEY"]
const WebSocket = require('ws')
const socket_const = require('../sockets/socket_constants')
const fs = require('fs');
var g_refresh_token = null;
var g_loginStatus = 30;
var g_clientSubscriptionMap = new Map(); //uuid => symbols
var g_symbolSocketMap = new Map(); //symbols => uuid;
var g_clientSocketMap = new Map(); // uuid => Websocket

function jsonToQueryString(json) {
    return Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
}
var myTdSock = null;
function getWebSocket(url) {
    if (myTdSock === null) {
        myTdSock = new WebSocket(url); 

    }else if (myTdSock !== null && myTdSock.readyState !== WebSocket.OPEN) {
        myTdSock = new WebSocket(url);
    }
    myTdSock.onclose = () => {
        console.log('Web Socket Connection Closed');
    };
    myTdSock.onconnection = () => {
        console.log('Web Socket Connection Opened');
    };
    return myTdSock;
   
}
function composeLoginRequest(res) {
    var userPrincipalsResponse = res;
    var tokenTimeStampAsDateObj = new Date(userPrincipalsResponse["streamerInfo"]["tokenTimestamp"]);
    var tokenTimeStampAsMs = tokenTimeStampAsDateObj.getTime();
    var credentials = {
        "userid": userPrincipalsResponse.accounts[0].accountId,
        "token": userPrincipalsResponse.streamerInfo.token,
        "company": userPrincipalsResponse.accounts[0].company,
        "segment": userPrincipalsResponse.accounts[0].segment,
        "cddomain": userPrincipalsResponse.accounts[0].accountCdDomainId,
        "usergroup": userPrincipalsResponse.streamerInfo.userGroup,
        "accesslevel": userPrincipalsResponse.streamerInfo.accessLevel,
        "authorized": "Y",
        "timestamp": tokenTimeStampAsMs,
        "appid": userPrincipalsResponse.streamerInfo.appId,
        "acl": userPrincipalsResponse.streamerInfo.acl
    }
    var request = {
        "requests": [
                {
                    "service": "ADMIN",
                    "command": "LOGIN",
                    "requestid": "98",
                    "account": userPrincipalsResponse.accounts[0].accountId,
                    "source": userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "credential": jsonToQueryString(credentials),
                        "token": userPrincipalsResponse.streamerInfo.token,
                        "version": "1.0"
                    }
                },
                {
                        "service": "ADMIN",
                        "requestid": "99",
                        "command": "QOS",
                        "account": userPrincipalsResponse.accounts[0].accountId,
                        "source":  userPrincipalsResponse.streamerInfo.appId,
                        "parameters": {
                            "qoslevel": "4"
                        }
                    
                }
            
        ]
    }

    var streamerUrl = "wss://" + userPrincipalsResponse.streamerInfo["streamerSocketUrl"] + "/ws";
    console.log("request in composeLoginRequest", request, streamerUrl)
    return {"streamerUrl": streamerUrl, "request": request, "credentials": credentials};
}


var streamerLoginInfo;
function refreshToken() {
    var url = "https://api.tdameritrade.com/v1/oauth2/token?apikey="+api_key;
    var f = fs.readFileSync('/home/jane/python/tradeML/trade_api/tmp/access_token.json');
    var access_token_obj = JSON.parse(f);
    var refresh_token = access_token_obj["refresh_token"];
    if (g_refresh_token === null && refresh_token !== null && refresh_token !== undefined) {
        g_refresh_token = refresh_token;
    }
    var body = null;
    if (refresh_token === null) {

    }
    else {
        body = {'grant_type': 'refresh_token','client_id': api_key, 'refresh_token': refresh_token};
    }
    //var bodyStr = JSON.stringify(body);
    return  unirest.post(url).header({'Content-Type': 'application/x-www-form-urlencoded'}).send(body);
}
function GetStreamerLoginRequest() {
    var f = fs.readFileSync('/home/jane/python/tradeML/trade_api/tmp/access_token.json');
    var access_token_obj = JSON.parse(f);
    var token = access_token_obj["access_token"]
    var bearerToken = 'Bearer ' + token;
    var url = "https://api.tdameritrade.com/v1/userprincipals?fields=streamerConnectionInfo&apikey=" + api_key;
    return unirest.get(url).header({'Authorization': bearerToken}).send();
}
function LoginStreamServer(res) {
    streamerLoginInfo = composeLoginRequest(res);
    var strLoginRequest = JSON.stringify(streamerLoginInfo["request"]);
    var tSock = getWebSocket(streamerLoginInfo.streamerUrl);
    if (tSock.readyState === WebSocket.OPEN) {
        tSock.send(strLoginRequest);
          HandleResponse(null, null);
            return true;
    }else {
        var retryCount = 1;
        while(retryCount++ < 4) {
            sleep(5).then(()=>{
                if (tSock.readyState === WebSocket.OPEN) {
                    tSock.send(strLoginRequest);
                    HandleResponse(null, null);
                    return true;
                }
            })
        }
    
    }
}
async function refreshTokenAndGetPrincipal() {
    return new Promise((resolve, reject)=>{
        refreshToken().then(function(resp){
            var respJson = resp.body;
            //console.log("refreshTokenResult", respJson);
            if (respJson !== null && respJson["access_token"] != null) {
                respJson["refresh_token"] = g_refresh_token;
                var tokenObj = JSON.stringify(respJson);
                
                //console.log("updating access token: ", tokenObj);
                fs.writeFileSync('/home/jane/python/tradeML/trade_api/tmp/access_token.json', tokenObj); 
                resolve(GetStreamerLoginRequest())
                
            }else {
            resolve( respJson);
            }
        });
    });
}
function LoginRefreshToken(res){
    if (res.error)
        refreshTokenAndGetPrincipal().then(function(res2){  
            return (LoginStreamServer(res2.body));
        });
    else
        return (LoginStreamServer(res.body));
}
function LoginEx(uuid)
{
    return new Promise((resolve, reject)=>{
        GetStreamerLoginRequest()
        .then(function(res){
            resolve(LoginRefreshToken(res));
        });
    });
}
LoginEx(0).then(function(res){
    console.log("finished login");
});
var constRequestId = 100;
function getNextRequestId() {
    return constRequestId++;
}


const stockKeyMap = {
    "1": "bidPrice",
    "2": "askPrice",
    "3": "lastPrice",
    "4": "bidSize",
    "5": "askSize",
    "6": "askId",
    "7": "bidId",
    "8": "totalVolume",
    "9": "lastSize",
    "10":"tradeTimeInLong",
    "11":"quoteTimeInLong",
    "12":"highPrice",
    "13": "lowPrice",
    "14": "bidTick",
    "15": "closePrice",
    "16":"exchange",
    "17":"marginable",
    "18": "shortable",
    "22": "quoteDate",
    "23": "tradeDate",
    "24": "volatility",
    "25": "description",
    "28": "openPrice",
    "29": "netChange",
    "key": "symbol",
    "cusip" : "cusip"
};
function mapKeyToResult(service, content) {
    if (service === "QUOTE") {
        var outerMap  = new Map();
        content.forEach((v)=>{
            var inner = v;
            var innerObj = {}
            Object.keys(inner).map((k) => {
                var inferredKey = stockKeyMap[k];
                innerObj[inferredKey] = inner[k];
            });
            var symbol = innerObj["symbol"];
            if (g_symbolSocketMap.has(symbol)) {
                var uuidSet = g_symbolSocketMap.get(symbol).values();

                for (var uuid = uuidSet.next().value; uuid !== undefined; uuid = uuidSet.next().value){
                    if (outerMap.has(uuid)){
                        var innerSet= outerMap.get(uuid);
                        innerSet.push(innerObj);
                        outerMap.set(uuid, innerSet);
                    }else {
                        outerMap.set(uuid, [innerObj]);
                        
                    }
                    console.log("push" + uuid + " : " + JSON.stringify(innerObj) + " to outerMap");
                }
            }
        });
        
        return outerMap;
    }
}
function HandleResponseInner(evt2, callBackFunc) {
    
    var data = JSON.parse(evt2["data"]);
    for (var k of Object.keys(data)) {
        
        if (k === "notify" || k === "response") {
            HandleGenericResponse(evt2);
        }
        else if (k === "data"){
            
            var innerData = data[k][0];
            var service = innerData.service;
            var command = innerData.command;
            var dataContent = innerData.content;
            console.log("key:", k, "value:",JSON.stringify(dataContent));
            if (service === "QUOTE" && command === 'SUBS') {
                var contentMap = mapKeyToResult("QUOTE", dataContent);
                var keys = contentMap.keys();
                for (var uuid of keys) {
                    var content = contentMap.get(uuid);
                    var resultStr = JSON.stringify({"type": socket_const.REALTIME_QUOTE, "result": content});
                    console.log("send back to client ", resultStr);
                    if (g_clientSocketMap.has(uuid)){
                        var ws = g_clientSocketMap.get(uuid);
                        callBackFunc(ws,resultStr);
                    }else {
                        console.error("can't find the socket info for", uuid);
                    }
                }
            }
        }              
    }
}

function HandleGenericResponse(evt2) {
    //console.log("evt2", evt2)
    var data = JSON.parse(evt2.data);
    for (var key of Object.keys(data)) {
        //console.log("key", k, "value",data.data[k].content);   
        if ((key === 'notify' || key === 'response') && 
            (key !== undefined && data[key][0].hasOwnProperty("content"))) {
            var innerObj = data[key][0];
            var service = innerObj.service;
            var command = innerObj.command;
            var dataContent = innerObj.content;
            var code = dataContent.code;
            var message = dataContent.msg;
            console.log("message", message, code);
            if (code !== 0 && service === 'ADMIN' && command === 'LOGIN') {
                g_loginStatus = code;
            }
            else if (code === 0 && service === 'ADMIN' && command === 'LOGIN' && message) {
                g_loginStatus = 0;
            }
        
        }              
    }
}
function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
function HandleResponseEx(callBackFunc) {
    var tSock = getWebSocket(streamerLoginInfo.streamerUrl); 
    tSock.onmessage = function (evt2) {
        //console.log("callBackFunc", callBackFunc, clientSock);
        if (callBackFunc !== null) {
            HandleResponseInner(evt2, callBackFunc);
        }else {
            HandleGenericResponse(evt2);
        }
        
    }
    tSock.onerror = function(evt) {
        console.error(evt);
    }
}
function HandleResponse(callBackFunc=null) {
    if(streamerLoginInfo === undefined) {
        sleep(5).then(()=>{
            HandleResponseEx(callBackFunc);
        })
    }
    else {
        HandleResponseEx(callBackFunc);
    }
    
}
function putSubscriptionMap(ws, symbols){
    g_clientSubscriptionMap.set(ws.uuid, new Set(symbols));
    
    if (!g_clientSocketMap.has(ws.uuid)){
        g_clientSocketMap.set(ws.uuid, ws);
    }
    if (g_clientSubscriptionMap.has(0)){
        symbols.forEach(s=>{
            g_clientSubscriptionMap.get(0).add(s);
        });
    }else {
        g_clientSubscriptionMap.set(0, new Set(symbols));
    }
    var currentMapKeys = new Set(g_symbolSocketMap.keys());
    var incomingSymbols = new Set(symbols);
    var symbolsNeedToRemove = new Set(
        [...currentMapKeys].filter(x=> !incomingSymbols.has(x)));
    for (var s in symbols) {
        var symbol = symbols[s];
        if (g_symbolSocketMap.has(symbol)) {
            g_symbolSocketMap.get(symbol).add(ws.uuid);
        }else {
            var uuidSet = new Set();
            uuidSet.add(ws.uuid);
            g_symbolSocketMap.set(symbol, uuidSet);
        }
    }
    symbolsNeedToRemove.forEach((sm)=> {
        var uuidSet2 = g_symbolSocketMap.get(sm);
        if (uuidSet2.has(ws.uuid)) {
            g_symbolSocketMap.get(sm).delete(ws.uuid);
            if (g_symbolSocketMap.get(sm).size === 0) {
                //No longer has any websocket interested in this symbol
                g_clientSubscriptionMap.get(0).delete(sm);
            }
        }
    });
    
}
function removeSubscriptions(ws) {
    if (g_clientSubscriptionMap.has(ws.uuid)) {
        var originalSymbols = g_clientSubscriptionMap[ws.uuid];
        if (originalSymbols !== undefined)
            g_clientSubscriptionMap[0].delete(originalSymbols);
        g_clientSubscriptionMap.delete(ws.uuid);
        for (var s in originalSymbols.entries()) {
            var uuidSet = g_symbolSocketMap.get(s);
            if (uuidSet.has(ws.uuid))
                uuidSet.delete(ws.uuid);
        }
    }
    
    if (g_clientSocketMap.has(ws.uuid)){
        g_clientSocketMap.delete(ws.uuid);
    }

}
function getSymbolsForClientSocks(ws) {
    return g_clientSubscriptionMap[ws.uuid];
}
function getGlobalSymbols() {
    if (g_clientSubscriptionMap.has(0))
        return Array.from(g_clientSubscriptionMap.get(0));
    else {
        return [];
    }
}
function sendSubscribeRequest(streamerLoginInfo, service, command, parameters, ws, callback) {

    var request = streamerLoginInfo["request"];
    var requestID = String(getNextRequestId());
    request["requests"] = [{
        "service": service,
        "requestid": requestID,
        "command": command,
        "account": streamerLoginInfo["credentials"]["userid"],
        "source": streamerLoginInfo["credentials"]["appid"],
        "parameters": parameters
    }];
    if (ws !== null) {
        console.log("in sendSubscribeRequest", requestID, request["requests"], ws.uuid);
    }
    var strRequest = JSON.stringify(request)
    //console.log("strRequest:" + strRequest);
    var tSock = getWebSocket(streamerLoginInfo.streamerUrl); 
    if (tSock.readyState === WebSocket.OPEN){
        tSock.send(strRequest);
        HandleResponse(callback);
    }else {
        console.error("Cannot open socket to stream server");
    }
}

function sendRequest(service, command, parameters,ws, callback) {
    if (g_loginStatus === 30){
        console.log("login status is ", g_loginStatus);
        LoginEx(ws.uuid).then(function(res){
            sendSubscribeRequest(streamerLoginInfo, service, command, parameters, ws, callback);
        })
    }else {
        sendSubscribeRequest(streamerLoginInfo, service, command, parameters, ws, callback);
    }
}
function convertJsonListToString(listOfSymbols) {
    var returnString = listOfSymbols.map(function(k){
            return k;
    }).join(",");
    return returnString;
}
function SubscribeNews(symbols, ws, callback) {
    var request = sendRequest("NEWS_HEADLINE", "SUBS", {
        "keys": symbols, "fields": "0,1,2,3,4"
    }, ws, callback);
    getWebSocket(ws.uuid).send(JSON.stringify(request));
}
function SubscribeQuote(symbol, ws, callback) {
    console.log("subscribe to symbol" + symbol);
    putSubscriptionMap(ws, symbol);
    var totalSymbols = getGlobalSymbols();
    sendRequest("QUOTE", "SUBS", {
        "keys": convertJsonListToString(totalSymbols),
        "fields": "0,1,2,3,4,8,11,12,13,29"
    }, ws, callback);
    
}

function UnsubscribeQuote(symbols, ws, callback) {
    console.log("unscribe to symbol" + symbols);
    removeSubscriptions(ws.uuid);
    sendRequest("QUOTE", "UNSUBS", {
        "keys": convertJsonListToString(symbols),
        "fields": "0,1,2,3,4,8,11,12,13,29"
    }, ws, callback);
}
module.exports = {
    TdStreamerFuncs: function(type, params, ws, callback) {
      if (type === socket_const.SUBS_QUOTE) {
        SubscribeQuote(params, ws, callback);
      } else if (type === socket_const.UNSUBSCRIBE_QUOTE) {
        UnsubscribeQuote(params.watch_lists, ws, callback);
      }else if (type === socket_const.SUBS_NEWS){
        SubscribeNews(params, ws, callback);
      }else {
        console.error("Unknown type specified in td_streamer_api", type)
      }
    }
  }