const socket_const = require('../sockets/socket_constants')
const loki_api = require('./loki_api')
const mongo_api = require('./mongo_api')

module.exports = {
   DbFunctions: function(type, params, ws, callback) {
   if (type === socket_const.OPTION_STATS || type === socket_const.OPTION_STATS_FIELDS) {
      return mongo_api.DbFunctions(type, params, ws,callback);
   
   }else {
      console.error("Unknown type specified in db_api", type);

    }
  }
}
