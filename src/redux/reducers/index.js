import { CONNECT, ADD_STOCK, REMOVE_STOCK, DISPLAY_RESPONSE,OPTION_CHAIN_BR, CLICK_PAGE,GET_QUOTE, UPDATE_WATCH_LIST_BR, GET_WATCH_LISTS_BR, GET_WATCHLIST_BYNAME_BR,DISPLAY_WATCHLISTS , OPTION_STATS_BR, OPTION_STATS_FIELDS_BR, GET_MODEL_PREDICTIONS} from '../constants/index';
import {initialState} from '../constants/index'
import {sendRequest, getSocketState, getSocket} from '../../sockets/socketclient'
import {SOCKET_OPEN, SOCKET_CLOSE, SOCKET_ERROR, SOCKET_UNKNOWNSTATE, PRICE_HISTORY,OPTION_CHAIN, REALTIME_QUOTE,UNSUBSCRIBE_QUOTE, UPDATE_WATCH_LIST, GET_WATCH_LISTS, GET_WATCHLIST_BYNAME, OPTION_STATS, OPTION_STATS_FIELDS, MODEL_PREDICTIONS} from '../../sockets/socket_constants'
const host = '127.0.0.1'
const port = 8567
function rootReducer(state=initialState, action) {
    var s = action.payload;
    if (action.type ===  CONNECT) {
        if (s.isConnected === false) {
            var socketState = getSocketState();
            var bOpen = (socketState === SOCKET_OPEN);
            var so = getSocket();
            return Object.assign({}, state, {
                socket: so, isConnected: bOpen});
        }else {
            return Object.assign({}, state, {
                isConnected: true});
        }
    }
    else if (action.type === ADD_STOCK) {
        sendRequest(PRICE_HISTORY,
                    {SYMBOL: s.value, RESOLUTION: s.resolution},  s.callback)
        return Object.assign({}, state,{
            value: s.value
        });
    }
    else if (action.type === REMOVE_STOCK) {
        return Object.assign({}, state,{
            stock_list: state.stock_list.pop(),
        });
    }
    else if (action.type === DISPLAY_RESPONSE) {
        var returnVal = Object.assign({}, state,{
            response: s
        });
        //console.log("display response in reducer", s)
        return returnVal;
    }
    else if (action.type === OPTION_CHAIN_BR) {
        sendRequest(OPTION_CHAIN,
                    {SYMBOL: s.value}, s.callback);
        return Object.assign({}, state, {
            value: s.value
        });
    }
    else if (action.type === CLICK_PAGE) {
        if (state.page === 'WatchLists.Browse' && s.page !== 'WatchLists.Browse') {
            sendRequest(UNSUBSCRIBE_QUOTE, {"watch_lists": state.stock_list});
        }
        return Object.assign({}, state, {
            page: s,
            response: ''
        });
    }
    else if (action.type === GET_QUOTE) {
        //stock_list = action.stock_list;
        if (s.callback !== undefined) {
            sendRequest(REALTIME_QUOTE,
                        {SYMBOL: s.stock_list},  s.callback)
        }
        return Object.assign({}, state,{
            stock_list: s.stock_list
        });
    }
    else if (action.type === GET_WATCH_LISTS_BR) {
        sendRequest(GET_WATCH_LISTS,
                    {}, s.callback);
        return Object.assign({}, state, {
            watchlists: '',
            watchlists_dirty: false});
            
    }
    else if (action.type === GET_WATCHLIST_BYNAME_BR) {
        
        if (s.callback !== undefined & s.watch_list_name !== ''){
            sendRequest(GET_WATCHLIST_BYNAME,
                        {WATCH_LIST_NAME: s.watch_list_name}, s.callback)
        }
        return Object.assign({},  state, {
            "watch_list_name": s.watch_list_name
        });
    } else if (action.type === DISPLAY_WATCHLISTS) {
        return Object.assign({}, state, {
            "watchlists": s,
            watchlists_dirty: false
        });
    }else if (action.type === UPDATE_WATCH_LIST_BR) {
        
        sendRequest(UPDATE_WATCH_LIST,
                    {WATCH_LIST_NAME: s.watch_list_name, SYMBOL: s.stock_list, ACTION: s.action}, s.callback);
        return Object.assign({}, state,{
            stock_list: s.stock_list,
            watchlists_dirty: true
        });
    }else if (action.type === OPTION_STATS_FIELDS_BR) {
        //console.log("s", s)
        if (s.callback !== undefined) {
            sendRequest(OPTION_STATS_FIELDS,
                         s.optionQueryObj, s.callback);
            return Object.assign({}, state, {
                optionQueryObj: {}
            })
        } else {
            return Object.assign({}, state, {
                optionFieldTree: s.optionFieldTree             
            })
        }
    }else if (action.type === OPTION_STATS_BR) {
        //console.log("s", s)
        if (s.callback !== undefined) {
            sendRequest(OPTION_STATS,
                         s.optionQueryObj, s.callback);
            return Object.assign({}, state, {
                optionQueryObj: {}
            })
        } else {
            return Object.assign({}, state, {
                optionStatsTree: s.optionStatsTree             
            })
        }
    } else if (action.type === GET_MODEL_PREDICTIONS) {
        if (s.callback !== undefined) {
            sendRequest(MODEL_PREDICTIONS,
                         s.modelQueryObj, s.callback);
            return Object.assign({}, state, {
                modelQueryObj: s.modelQueryObj
            })
        } else {
            return Object.assign({}, state, {
                modelQueryObj: s.modelQueryObj             
            })
        }
    }
    return state;
};

export {rootReducer};
