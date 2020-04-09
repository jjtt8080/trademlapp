
import {CONNECT, ADD_STOCK, REMOVE_STOCK, DISPLAY_RESPONSE, CLICK_PAGE, GET_QUOTE, UPDATE_WATCH_LIST_BR, GET_WATCH_LISTS_BR, GET_WATCHLIST_BYNAME_BR,DISPLAY_WATCHLISTS, OPTION_CHAIN_BR, OPTION_STATS_BR, OPTION_STATS_FIELDS_BR, GET_MODEL_PREDICTIONS} from '../redux/constants/index';
import {PRICE_HISTORY,
        OPTION_CHAIN,
        REALTIME_QUOTE,
        NEWS,
        MOVERS,
        INDEX,
        SYMBOL,
        GET_WATCH_LISTS,
        GET_WATCHLIST_BYNAME,
        UPDATE_WATCH_LIST,
        OPTION_STATS,
        OPTION_STATS_FIELDS,
        MODEL_PREDICTIONS
} from '../sockets/socket_constants';

const  mapStateToProps = state => {
  return {
    stock_list: state.stock_list,
    value: state.value,
    isConnected: state.isConnected,
    socket: state.socket,
    response: state.response,
    page: state.page,
    watchlists: state.watchlists,
    watch_list_name: state.watch_list_name,
    watchlists : state.watchlists,
    watchlists_dirty : state.watchlists_dirty,
    optionQueryObj : state.optionQueryObj,
    optionFieldTree : state.optionFieldTree,
    optionStatsTree : state.optionStatsTree,
    modelPredictions: state.modelPredictions
  };
};
const ActionTypeMapping = action_type => {
    switch (action_type) {
    case ADD_STOCK:
        return PRICE_HISTORY;
    case GET_QUOTE:
        return REALTIME_QUOTE;
    case GET_WATCH_LISTS_BR:
        return GET_WATCH_LISTS;
    case GET_WATCHLIST_BYNAME_BR:
        return GET_WATCHLIST_BYNAME;
    case UPDATE_WATCH_LIST_BR:
        return UPDATE_WATCH_LIST;
    case OPTION_CHAIN_BR:
        return OPTION_CHAIN;
    case OPTION_STATS_BR:
        return OPTION_STATS;
    case OPTION_STATS_FIELDS_BR:
        return OPTION_STATS_FIELDS;
    case GET_MODEL_PREDICTIONS:
        return MODEL_PREDICTIONS;
    default:
        console.error("unknown type", action_type)
        break;
    }
}
function isEmpty(obj) {
    for(var key in obj) {
        if(obj.hasOwnProperty(key))
            return false;
    }
    return true;
}

function verifyServerResponse(server_response, type) {
    var socket_type = ActionTypeMapping(type)
    //console.log("verifying ", type, socket_type, server_response);
    var parsedObj = server_response;

    if (parsedObj.type === socket_type)
        return (parsedObj.result);
    else
        return {}

}
function connect(state) {
  //console.log("dispatching connect function", state)
  return {
    type: CONNECT,
    payload: state
  }
}

function addStock(state) {
  return {
    type: ADD_STOCK,
    payload: state
  }
}
function getOptions(state) {
    return {
        type: OPTION_CHAIN_BR,
        payload: state
  }
}
function getOptionStats(state) {
    return {
        type: OPTION_STATS_BR,
        payload:state
    }
}
function getOptionStatsFields(state) {
    return {
        type: OPTION_STATS_FIELDS_BR,
        payload:state
    }
}
function displayResponse(state) {
  return {
    type: DISPLAY_RESPONSE,
    payload: state
  }
}
function clickPage(pageID) {
  return {
    type: CLICK_PAGE,
    payload : pageID
  }
}
function realtimeQuote(state) {
  return {
    type: GET_QUOTE,
    payload: state
  }
}
function updateWatchList(state) {
  //console.log("onupdateWatchList:", state)
  return {
    type: UPDATE_WATCH_LIST_BR,
    payload:state
  }
}
function getWatchLists(state) {
  //console.log("ongetWatchLists:", state)
  return {
    type: GET_WATCH_LISTS_BR,
    payload:state
  }
}
function getWatchListByName(state) {
  //console.log("ongetWatchListByName:", state)
  return {
    type: GET_WATCHLIST_BYNAME_BR,
    payload:state
  }
}
function displayWatchList(list) {
    return {
        type: DISPLAY_WATCHLISTS,               
        payload:list
    }
}
function getModelPredictions(state) {
  return {
    type: GET_MODEL_PREDICTIONS,
    payload: state
  }
}
const mapDispatchToProps = dispatch => {
    return {
	onConnect: (state) => dispatch(connect(state)),
	onAddStock : (state)=> dispatch(addStock(state)),
	onRemoveStock: () => dispatch({type: REMOVE_STOCK}),
	onDisplayResponse: (state) =>dispatch(displayResponse(state)),
  onGetOptions: (state) => dispatch(getOptions(state)),
  onGetOptionStats: (state) => dispatch(getOptionStats(state)),
  onGetOptionStatsFields: (state) => dispatch(getOptionStatsFields(state)),
	onClickPage: (pageID) => dispatch(clickPage(pageID)),
	onRealtimeQuote: (state) => dispatch(realtimeQuote(state)),
	onUpdateWatchList: (state) => dispatch(updateWatchList(state)),
	onGetWatchLists: (state) => dispatch(getWatchLists(state)),
	onGetWatchListByName: (state) => dispatch(getWatchListByName(state)),
  onDisplayWatchLists:(list) =>dispatch(displayWatchList(list)),
  onGetModelPredictions:(state) =>dispatch(getModelPredictions(state))
   };
   
};

export {mapStateToProps}
export {mapDispatchToProps}
export {verifyServerResponse}
export {isEmpty}
