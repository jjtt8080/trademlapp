//#!/usr/bin/env node
//WebSocket = require('../node_modules/engine.io/node_modules/ws/lib/WebSocket.js');
require('websocket')
const socket_constant = require('./socket_constants')

//import 'WebSocket';
var mySocket = new WebSocket("ws://127.0.0.1:8567");

function sampleCallback(response) {
  console.log("sample call back" + response)
}
//For debugging purpose
function ackStateToServer() {
  if (mySocket.readyState === WebSocket.OPEN) {
    mySocket.send("{\"message\": \"connected\"}")
  }
  if (mySocket.readyState === WebSocket.CLOSE) {
      console.log("socket closed")
  }
  if (mySocket.readyState === WebSocket.ERROR) {
      console.log("socket throw error");
  }
}

function getSocketState() {
  if (mySocket.readyState === WebSocket.OPEN) {
    return socket_constant.SOCKET_OPEN;
  }
  if (mySocket.readyState === WebSocket.CLOSE) {
      return socket_constant.SOCKET_CLOSE;
  }
  if (mySocket.readyState === WebSocket.ERROR) {
      return socket_constant.SOCKET_ERROR;
  }
  return socket_constant.SOCKET_UNKNOWNSTATE;
}
function sendRequest(requesttype, params, callback){
  console.log("in sendRequest function", mySocket.readyState, mySocket.OPEN)
  if (mySocket.readyState === mySocket.OPEN){
    var data = {"type": requesttype, "params": params}
    console.log("sending request", JSON.stringify(data))
    mySocket.send(JSON.stringify(data))
    mySocket.onmessage= function(event) {
      var socketData = event.data;
      var returnRequestType = event.type;
      console.log("event name: " + event + ", event data:" +  socketData)
      callback(socketData);
    }
  }else {
    callback("Cannot connect to the socket server!")
  }
};

export {mySocket};
//export {createSocket};
export {sendRequest};
export {getSocketState}
