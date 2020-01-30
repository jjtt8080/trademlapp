const MongoClient = require('mongodb').MongoClient;
const socket_const = require('../sockets/socket_constants')
const fs = require('fs');
const csv = require('csv-parser');
var url = 'mongodb://localhost:27017'
function isEmpty(obj) {
  if (obj === undefined || obj === null) return true;
   for(var prop in obj) {
    if(obj.hasOwnProperty(prop))
      return false;
  }
  return true;

}
//This generate the filter depending on 
//[] array conditions
// Each element in the array will be or together
// while the inner element of each obj will be and together
function generateSingleFilterExpr(f){
    $and = []
    for(var prop in f) {
        if(f.hasOwnProperty(prop)) {
            var propName = prop
            var retObj = {}
            if (Array.isArray(f[prop])) {
                retObj[propName] =  {$in : f[prop]}
            }else {
                retObj[propName] = f[prop]
            }
            $and.push(retObj)
        }
    }
    if ($and.length> 1) {
        return {$and}
    }else {
        return $and[0]
    }          
}
function generateFilterExpr(filterCond) {
    if (Array.isArray(filterCond))
    {
        var $or = []
        filterCond.forEach(function(f){
            var expr = generateSingleFilterExpr(f);
            $or.push(expr)
        })
        return {$or}
    }
}
function makeFieldNameForMeasure(c) {
    var retV = ""
    var keys = Object.keys(c);
    keys.forEach(k=>{
        var value = JSON.stringify(c[k]);
        value = value.replace("\"", "");
        value = value.replace("$", "");
        value = value.replace("\"", "");
        retV = k.substr(1, k.length-1)+ "_" + value;
    })
    return retV

}
function  generateAggrColumns(projectionAttrs, projectionMeasures, filter) {
    var $group = {}
    var idColumns = {};
    var $project = {};
    var pipeline = [];
    projectionAttrs.forEach(c =>{
        var value = c
        value = "$".concat(value);
        idColumns[c] = value;
        var accValue = {$first : value};
        $group[c] = accValue;
        $project[c] = 1;
    });
    $group["_id"] = idColumns;
    $project["_id"] = 0;
    $addFields = {}
    if (projectionMeasures.length > 0) {
        projectionMeasures.forEach(c=>{
            //var value = c
            //value = "$".concat(value);
            var accValue = c
            var fieldName = makeFieldNameForMeasure(c)
            $group[fieldName] = accValue
            $project[fieldName] = 1
            var roundField = "$".concat(fieldName)
            $addFields[fieldName] = {$round : [roundField, 2]}
        });
    }
    $match = generateFilterExpr(filter);
    if (isEmpty($match) === false)
        pipeline.push({$match});
    if (isEmpty($group)  === false)
        pipeline.push({$group})
    if (isEmpty($project)  === false)
        pipeline.push({$project})
    if (isEmpty($addFields)  === false)
        pipeline.push({$addFields});
    console.log(JSON.stringify(pipeline))
    return pipeline;
}
function queryDb(queryType, tableName, distinct, projectionAttrs, projectionMeasures, filter, sortSpec, ws, callback) {
    MongoClient.connect(url, function(err, client){
      
        if(err) { return console.dir(err); }
        console.log("connected");
        var db = client.db('trademl');
        var cursor;
        
        if (!distinct && projectionMeasures.length ===0) {
            var projection = projectionAttrs
            if (filter !== null) {
                cursor = db.collection(tableName).find(filter, projection);
            } else {
                cursor = db.collection(tableName).find({}, projection)
            }
            cursor.toArray().then(function(r){
                var finalObj =  {type: queryType, result: r};
                callback(ws,JSON.stringify(finalObj));                         
            }).catch(function(err){
                console.error(err);
                callback(ws.JSON.stringify({type:queryType, result:"error" + err.toString()}))
            })
        }
        else  {
            if (projectionAttrs.length ===1 && projectionMeasures.length === 0){
                db.collection(tableName).distinct(projectionAttrs[0], filter).then(function(r){
                    var finalObj =  {type: queryType, result: r};
                    callback(ws,JSON.stringify(finalObj));                                                                 
                }).catch(function(err){
                    console.error(err);
                    callback(ws.JSON.stringify({type:queryType, result:"error" + err.toString()}))
                });
            } else {
                cursor = db.collection(tableName).aggregate(generateAggrColumns(projectionAttrs, projectionMeasures, filter), {cursor:{batchSize:1000}})
                //Need to unwrap
                array = null;
                if (sortSpec !== null) {
                    array = cursor.sort(sortSpec).toArray()
                }else {
                    array = cursor.toArray();
                }
                array.then(function(r){
                    var finalObj =  {type: queryType, result: r};
                    console.log("finalObj", r[0])
                    callback(ws,JSON.stringify(finalObj));                         
                }).catch(function(err){
                    console.error(err);
                    callback(ws.JSON.stringify({type:queryType, result:"error" + err.toString()}))
                })
            }
        }
        
    });
}

function queryWatchListSymbols(watch_list_name) {
    user_api.WatchListFuncs()
}
module.exports = {
     DbFunctions : function(type, params, ws, callback) {
        var tableName = params.tablename;
        var projectionAttrs = params.projectionAttrs;
        var projectionMeasures = params.projectionMeasures;
        var distinct = params.distinct;
        var filter = params.filter;
        var watch_list_name = params.watch_list_name;
        var sortspec = params.sortSpec
        var r = queryDb(type, tableName, distinct, projectionAttrs, projectionMeasures, filter, sortspec, ws, callback);
        
        
    }
}