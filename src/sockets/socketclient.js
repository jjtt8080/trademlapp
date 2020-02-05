//#!/usr/bin/env node
//WebSocket = require('../node_modules/engine.io/node_modules/ws/lib/WebSocket.js');
require('websocket')
//var sleep = require('sleep');
const socket_constant = require('./socket_constants');
var mySocket = new WebSocket("ws://192.168.2.18:8568");
var callbackMap = new Map();
//console.log("Create new socket");
function sleep(millis) {
    return new Promise(resolve => setTimeout(resolve, millis));
}
var isConnected = false;

mySocket.onconnect = function(event){
  isConnected = true;
}
function getSocket() {
  return mySocket;
}
function getSocketState() {
  if (mySocket.readyState === WebSocket.OPEN) {
    return socket_constant.SOCKET_OPEN;
  }
  else if (mySocket.readyState === WebSocket.CLOSE) {
    return socket_constant.SOCKET_CLOSE;
  }
  else if (mySocket.readyState === WebSocket.ERROR) {
    return socket_constant.SOCKET_ERROR;
  }
  return socket_constant.SOCKET_UNKNOWNSTATE;
}

function onMessage(data) {

  mySocket.send(JSON.stringify(data))
  mySocket.onmessage= function(event) {
    var socketData = JSON.parse(event.data);
    var eventType = socketData["type"];
    //console.log("callbackMap.keys: ", callbackMap.size)
    //console.log("eventType", eventType);
    var callback = callbackMap.get(eventType)
    //console.log("event name: " + event + ", event data:" +  JSON.stringify(socketData), "callback", callback)
    if (callback)
      callback(socketData);
  }
}
function addCallbackMap(requesttype, callback) {
    //if (!callbackMap.has(requesttype)) {
        //console.log("add call back map", requesttype, callback)
    if (callback !== null) {
        callbackMap.set(requesttype,callback);
        //console.log("callback map length", callbackMap.size);
        
    }
}
function sendRequest(requesttype, params, callback){
  //console.log("in sendRequest function", mySocket.readyState, mySocket.OPEN, requesttype)
  var data = {type: requesttype, params: params}
  if (mySocket.readyState === mySocket.OPEN){
    //console.log("sending request", JSON.stringify(data))
    addCallbackMap(requesttype, callback)
    onMessage(data)
  }else {
      mySocket.onconnect = function(event){
      onMessage(data)
    }
  }
};

export {mySocket};
//export {createSocket};
export {sendRequest};
export {getSocketState}
export {getSocket};
