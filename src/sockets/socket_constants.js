const WebSocket = require('websocket')
//Here are the valid API TYPES
const PRICE_HISTORY = 'priceHistory';
const OPTION_CHAIN = 'option_chain';
const REALTIME_QUOTE = 'quote';
const NEWS = 'companyNews';
const INDEX = 'index';
const MOVERS = 'movers';
const SYMBOL = 'symbol';
const PARAMS = 'params';
const RESOLUTION = 'resolution';
const SOCKET_OPEN = WebSocket.OPEN
const SOCKET_CLOSE = WebSocket.CLOSE
const SOCKET_ERROR = WebSocket.ERROR
const SOCKET_UNKNOWNSTATE = -1
module.exports = {
  PRICE_HISTORY: PRICE_HISTORY,
  OPTION_CHAIN: OPTION_CHAIN,
  REALTIME_QUOTE: REALTIME_QUOTE,
  NEWS: NEWS,
  MOVERS: MOVERS,
  INDEX: INDEX,
  SYMBOL: SYMBOL,
  RESOLUTION: RESOLUTION,
  PARAMS: PARAMS,
  SOCKET_OPEN: SOCKET_OPEN,
  SOCKET_CLOSE: SOCKET_CLOSE,
  SOCKET_ERROR: SOCKET_ERROR,
  SOCKET_UNKNOWNSTATE: SOCKET_UNKNOWNSTATE
}
