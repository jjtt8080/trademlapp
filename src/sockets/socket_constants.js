const WebSocket = require('websocket')
//Here are the valid API TYPES
const PRICE_HISTORY = 'priceHistory';
const OPTION_CHAIN = 'option_chain';
const OPTION_STATS = 'option_stats';
const OPTION_STATS_FIELDS = 'option_stats_fields';
const REALTIME_QUOTE = 'quotes';
const UPDATE_WATCH_LIST = 'update_watch_list';
const GET_WATCH_LISTS = 'getWatchLists';
const GET_WATCHLIST_BYNAME = 'getWatchListByName';
const NEWS = 'companyNews';
const INDEX = 'index';
const MOVERS = 'movers';
const SYMBOL = 'symbol';
const PARAMS = 'params';
const ACTION = 'action';
const WATCH_LIST_NAME = 'watch_list_name';
const RESOLUTION = 'resolution';
const SOCKET_OPEN = WebSocket.OPEN
const SOCKET_CLOSE = WebSocket.CLOSE
const SOCKET_ERROR = WebSocket.ERROR
const ARG_ERROR = 'ERROR'
const SOCKET_UNKNOWNSTATE = -1
module.exports = {
    PRICE_HISTORY: PRICE_HISTORY,
    OPTION_CHAIN: OPTION_CHAIN,
    OPTION_STATS : OPTION_STATS,
    OPTION_STATS_FIELDS : OPTION_STATS_FIELDS,
    REALTIME_QUOTE: REALTIME_QUOTE,
    NEWS: NEWS,
    MOVERS: MOVERS,
    INDEX: INDEX,
    SYMBOL: SYMBOL,
    WATCH_LIST_NAME: WATCH_LIST_NAME,
    RESOLUTION: RESOLUTION,
    GET_WATCH_LISTS: GET_WATCH_LISTS,
    GET_WATCHLIST_BYNAME: GET_WATCHLIST_BYNAME,
    UPDATE_WATCH_LIST: UPDATE_WATCH_LIST,
    PARAMS: PARAMS,
    ARG_ERROR: ARG_ERROR,
    SOCKET_OPEN: SOCKET_OPEN,
    SOCKET_CLOSE: SOCKET_CLOSE,
    SOCKET_ERROR: SOCKET_ERROR,
    SOCKET_UNKNOWNSTATE: SOCKET_UNKNOWNSTATE
}
