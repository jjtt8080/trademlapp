var unirest = require("unirest");
const api_key = require('./api_key.json')["TD_API_KEY"]
const WebSocket = require('ws')
const socket_const = require('../sockets/socket_constants')
const fs = require('fs');
var g_refresh_token = null;
var g_loginStatus = 30;
function jsonToQueryString(json) {
    return Object.keys(json).map(function(key) {
            return encodeURIComponent(key) + '=' +
                encodeURIComponent(json[key]);
        }).join('&');
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
                    "requestid": 99,
                    "account": userPrincipalsResponse.accounts[0].accountId,
                    "source": userPrincipalsResponse.streamerInfo.appId,
                    "parameters": {
                        "credential": jsonToQueryString(credentials),
                        "token": userPrincipalsResponse.streamerInfo.token,
                        "version": "1.0"
                    }
                }
        ]
    }

    var streamerUrl = "wss://" + "streamer-ws.tdameritrade.com" + "/ws";
    console.log("request in composeLoginRequest", request)
    return {"streamerUrl": streamerUrl, "request": request, "credentials": credentials};
}

var myTdSock = new WebSocket("wss://streamer-ws.tdameritrade.com/ws"); 
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
    var bodyStr = JSON.stringify(body);
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
    myTdSock.send(strLoginRequest);
    return true;
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
function LoginEx()
{
    return new Promise((resolve, reject) => {
        GetStreamerLoginRequest()
        .then(function(res){
            resolve(LoginRefreshToken(res));
        });
    });
}

HandleResponse(null, null);
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
    "key": "symbol"
};
function mapKeyToResult(service, content) {
    if (service === "QUOTE") {
        var outerMap  = [];
        Object.keys(content).map((v) =>{
            var inner = content[v];
            var innerObj = {}
            Object.keys(inner).map((k) => {
                var inferredKey = stockKeyMap[k];
                innerObj[inferredKey] = inner[k];
            });
            outerMap.push(innerObj);
        });
        //console.log(outerMap);
        return outerMap;
    }
}
function HandleResponseInner(evt2, callBackFunc, clientSock) {
    
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
            console.log("key:", k, "value:",dataContent);
            if (service === "QUOTE" && command == 'SUBS') {
                var contentObj = mapKeyToResult("QUOTE", dataContent);
                var resultStr = JSON.stringify({"type": socket_const.REALTIME_QUOTE, "result": contentObj});
                //console.log("send back to client ", innerData.command);
                callBackFunc(clientSock, resultStr);
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
            console.log("message", message);
            if (code !== 0 && service === 'ADMIN' && command === 'LOGIN') {
                g_loginStatus = code;
            }
            else if (code === 0 && service === 'ADMIN' && command === 'LOGIN') {
                g_loginStatus = 0;
            }
        
        }              
    }
}

function HandleResponse(callBackFunc=null, clientSock=null) {
    myTdSock.onmessage = function (evt2) {
        //console.log("callBackFunc", callBackFunc, clientSock);
        if (callBackFunc !== null && clientSock !== null) {
            HandleResponseInner(evt2, callBackFunc, clientSock);
        }else {
            HandleGenericResponse(evt2);
        }
        
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
    myTdSock.send(strRequest);
    HandleResponse(callback, ws);
}

function sendRequest(service, command, parameters,ws, callback) {
    if (g_loginStatus === 30){
        console.log("login status is 30");
        LoginEx().then(function(res){
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
    myTdSock.send(JSON.stringify(request));
}
function SubscribeQuote(symbol, ws, callback) {
    console.log("subscribe to symbol" + symbol);
    sendRequest("QUOTE", "SUBS", {
        "keys": convertJsonListToString(symbol),
        "fields": "0,1,2,3,4,8,11,12,13,29"
    }, ws, callback);
    
}

function UnsubscribeQuote(symbols, ws, callback) {
    console.log("unscribe to symbol" + symbols);
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