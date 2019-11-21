import { CONNECT, ADD_STOCK, REMOVE_STOCK, DISPLAY_RESPONSE, CLICK_PAGE} from '../constants/index';
import {initialState} from '../constants/index'
import {createSocket, sendRequest, mySocket, getSocketState} from '../../sockets/socketclient'
import {SOCKET_OPEN, SOCKET_CLOSE, SOCKET_ERROR, SOCKET_UNKNOWNSTATE, PRICE_HISTORY,OPTION_CHAIN} from '../../sockets/socket_constants'
const host = '127.0.0.1'
const port = 8567
function rootReducer(state=initialState, action) {
  //console.log("this.props" + JSON.stringify(this.props))
  if (action.type ===  CONNECT) {
    console.log("in connect", state);
    if (state.isConnected === false) {
      var s = mySocket;
      var socketState = getSocketState();
      console.log("in CONNECT " +  socketState )
      var bOpen = (socketState === SOCKET_OPEN);
      return Object.assign({}, state, {
          socket: s, isConnected: bOpen});
    }else {
      return Object.assign({}, state, {
          isConnected: true});
    }
  }
  if (action.type === ADD_STOCK) {
    s = action.payload;
    var stock_list = s.stock_list;
    stock_list = stock_list.concat(s.value)
    sendRequest(PRICE_HISTORY,
      {SYMBOL: s.value, RESOLUTION: s.resolution},  s.callback)
    return Object.assign({}, state,{
      value: s.value,
      stock_list: stock_list
    });
  }
  if (action.type === REMOVE_STOCK) {
    return Object.assign({}, state,{
      stock_list: state.stock_list.pop(),
    });
  }
  if (action.type === DISPLAY_RESPONSE) {
    s = action.payload;
    console.log("in redux reducer for display_response" + s)
    return Object.assign({}, state,{
      response: s
    });
  }
  if (action.type === CLICK_PAGE) {
    s = action.payload;
    return Object.assign({}, state, {
      page: s
    });
  }
  console.log("Unknow action", action.type)
  return state;
};

export {rootReducer};
