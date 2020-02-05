const fs = require('fs')
const os = require('os')
const socket_const = require('../sockets/socket_constants')

function GetWatchListByName(watch_list_name) {
    if (watch_list_name !== '') {
        var watchlistFileName = '/home/jane/webapp/trademlapp/data/' + watch_list_name + '.json';
        if (fs.existsSync(watchlistFileName)) {
            var watchFileObj = fs.readFileSync(watchlistFileName);
            var jsonObj = JSON.parse(watchFileObj)
            console.log("watchlistFileName Obj", JSON.stringify(jsonObj));
            var resultObj = {type: socket_const.GET_WATCHLIST_BYNAME, result: jsonObj}
            return resultObj;
        }
    }
    resultObj = {type: socket_const.ARG_ERROR, result: "Wrong watch list name"};
    console.error("error happen in getwatchlistbyname" + JSON.stringify(resultObj));
    return resultObj;
}
function GetWatchLists() {
    var watchlistFileName = '/home/jane/webapp/trademlapp/data/watch_list.json';
    var watchFileObj = fs.readFileSync(watchlistFileName);
    var jsonObj = JSON.parse(watchFileObj)
    //var strJsonObj = JSON.stringify(jsonObj);
    //console.log("sent ", strJsonObj);
    var result = {type: socket_const.GET_WATCH_LISTS, result: jsonObj["watch_lists"]}
    return result;
}
function UpdateWatchListByName(watch_list_name, newQuotes, action) {
    if (watch_list_name === null || watch_list_name === undefined) {
        return {type: socket_const.ARG_ERROR, result: "Error watchlist name"}
    }
    var watchListFile =  '../../data/' + watch_list_name + '.json';
    var summaryFile = '../../data/watch_list.json';
    var summaryFileObj = fs.readFileSync(summaryFile);
    var origWatchLists = JSON.parse(summaryFileObj);
    var origLists = origWatchLists["watch_lists"]
    console.log("Updating watchlist", watch_list_name, newQuotes, action);
    if (fs.existsSync(watchListFile) === false){
        console.log("create new watch list file", watch_list_name);
        var newList = [...new Set([watch_list_name, ...origLists])];
        origWatchLists["watch_lists"] = newList;
        fs.writeFileSync(summaryFile, JSON.stringify(origWatchLists))
    }
    else { 
        if (action !== 'DELETE')
            console.log("replacing existing watch list file", watch_list_name);
        else {
            fs.unlinkSync(watchListFile)
            console.log("deleting existing watch list file", watch_list_name);
            var filteredList = origLists.filter(function(value, index, arr){
                return value !== watch_list_name;
            })
            console.log("filtered list", filteredList)
            origWatchLists["watch_lists"] = filteredList;
            fs.writeFileSync(summaryFile, JSON.stringify(origWatchLists));
            return {type:socket_const.UPDATE_WATCH_LIST, result:origWatchLists};
        }
    }
    var newQuotesObj = []
    if (newQuotes !== '') {
        newQuotesObj = newQuotes.toString().split(",")
    }
    var jsonStr = "{\"" + watch_list_name + "\": " + JSON.stringify(newQuotesObj) + "}";
    console.log("new watch list file content", jsonStr);
    fs.writeFileSync(watchListFile, jsonStr);
    return {type: socket_const.UPDATE_WATCH_LIST, result: "success"}
}
module.exports = {
    WatchListFuncs: function(type, params, ws, callback) {
      if (type === socket_const.GET_WATCHLIST_BYNAME){
          var watchlist = GetWatchListByName(params["WATCH_LIST_NAME"]);
          if (callback !== null)
            callback(ws, JSON.stringify(watchlist));
          else
              return watchlist;
       }else if (type === socket_const.GET_WATCH_LISTS) {
           var watchlists = GetWatchLists();
           callback(ws, JSON.stringify(watchlists));
       }else if (type === socket_const.UPDATE_WATCH_LIST){
           var result = UpdateWatchListByName(params["WATCH_LIST_NAME"], params["SYMBOL"], params["ACTION"]);
           callback(ws, JSON.stringify(result));
       }else {
           console.error("Unknown type specified in user_api", type)
       }
   }
}

