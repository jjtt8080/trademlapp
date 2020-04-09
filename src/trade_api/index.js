const socket_const = require('../sockets/socket_constants')
const finn = require('./finn_api')
const td = require('./td_api')
const fs = require('fs')
const user_api = require('./user_api')


module.exports = {
   TradeFunctions: function(type, params, ws, callback) {
   if (type === socket_const.PRICE_HISTORY) {
      return finn.FinnFunctions(type, params, ws,callback);
   }else if (type === socket_const.REALTIME_QUOTE |
            type === socket_const.OPTION_CHAIN |
            type === socket_const.UNSUBSCRIBE_QUOTE ) {
      return td.TdFunctions(type, params, ws,callback)
   }else if (type === socket_const.GET_WATCHLIST_BYNAME |
             type === socket_const.GET_WATCH_LISTS |
             type === socket_const.UPDATE_WATCH_LIST)
   {
      return user_api.WatchListFuncs(type, params, ws, callback)
   }else if (type === socket_const.OPTION_CHAIN | 
            type === socket_const.OPTION_STATS |
            type === socket_const.OPTION_STATS_FIELDS) {
      return td.TdFunctions(type, params, ws, callback)
   }else if (type === socket_const.MODEL_PREDICTIONS) {
         return user_api.ModelFunc(type, params, ws, callback);
   }else{
      console.error("Unknown type specified in tradeapi", type);

    }
  }
}
