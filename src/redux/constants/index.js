import {CONNECT, ADD_STOCK, REMOVE_STOCK, DISPLAY_RESPONSE, CLICK_PAGE, GET_QUOTE, UPDATE_WATCH_LIST_BR, GET_WATCH_LISTS_BR, GET_WATCHLIST_BYNAME_BR, DISPLAY_WATCHLISTS, OPTION_CHAIN_BR, OPTION_STATS_BR,OPTION_STATS_FIELDS_BR}  from './action-types.js';
import {PropTypes} from 'prop-types'
export {CONNECT}
export {ADD_STOCK}
export {REMOVE_STOCK}
export {DISPLAY_RESPONSE}
export {CLICK_PAGE}
export {GET_QUOTE}
export {UPDATE_WATCH_LIST_BR}
export {GET_WATCH_LISTS_BR}
export {GET_WATCHLIST_BYNAME_BR}
export {DISPLAY_WATCHLISTS}
export {OPTION_CHAIN_BR}
export {OPTION_STATS_BR}
export {OPTION_STATS_FIELDS_BR}
const StateObj = {
  state:
    PropTypes.shape({
      stock_list: PropTypes.array,
      value: PropTypes.string.isRequired,
      isConnected: PropTypes.bool.isRequired,
      socket: PropTypes.object,
      response: PropTypes.stgring,
      resolution: PropTypes.string,
      page: PropTypes.string,
      watch_list_name: PropTypes.string,
      watchlists: PropTypes.array,
      watchlists_dirty: PropTypes.bool,
      action: PropTypes.string,
      optionQueryObj: PropTypes.object,
      optionFieldTree: PropTypes.object,
      optionStatsTree: PropTypes.object
    }).isRequired
};
var initialState = {
    stock_list: Array(),
    value: '',
    isConnected: false,
    socket: null,
    response: '',
    resolution: 'D',
    page: 'Charts',
    watch_list_name: 'Default',
    watchlists: ['Default'],
    watchlists_dirty: true,
    action: '',
    optionQueryObj: undefined,
    optionFieldTree: undefined,
    optionStatsTree: undefined
}
export {StateObj}
export {initialState}
