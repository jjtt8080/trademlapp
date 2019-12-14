const loki = require("lokijs");
const yargs = require('yargs');
const socket_const = require('../sockets/socket_constants')
const dbname = '/home/jane/webapp/trademlapp/src/db_api/option_stats.db';
const fs = require('fs');
const csv = require('csv-parser');
var initialized = false;
var db = new loki(dbname, {
                 autoload: true,
                    autoloadCallback : databaseInitialize,
                    autosave: true, 
                    autosaveInterval: 4000});
// implement the autoloadback referenced in loki constructor

function databaseInitialize() {
  // on the first load of (non-existent database), we will have no collections so we can 
  //   detect the absence of our collections and add (and configure) them now.
  var tables = db.getCollection("tables");
  if (tables === null) {
    now = new Date();
    tables = db.addCollection("tables", {indices: ['tablename'], clone:true});
  }

  // kick off any program logic or start listening to external events
  runProgramLogic();
}


// While we could have done this in our databaseInitialize function, 
//   lets go ahead and split out the logic to run 'after' initialization into this 'runProgramLogic' function
function runProgramLogic() {
    var tables = db.getCollection("tables");
    var tableCount = tables.count();
    var now = new Date();

    console.log("old number of entries in database : " + tableCount);
    now = new Date();
    var result = tables.where(function(obj){return obj.tablename == "tables"});
    if (result === null) {
        tables.insert({ tablename: "tables", created_ts:  now.getTime()});
        tableCount = tables.count();
    }
    initialized = true;
    main();
    
}
process.on('SIGINT', function() {
  console.log("flushing database");
  db.close();
});
function main() {
    args = yargs.command('<type> [filename] [tablename]', 'type: {import | export | query}')
    .help()
    .argv
    if (args.filename !== null) {
        var tablename = args.tablename;
        if (tablename === null) {
            tablename = filename.substring(0, args.filename.lastIndexOf('.'))
            console.log("inferred table name:", tablename)
        }
    }
    if (args.type === 'import') {
        importTb(args.filename, tablename);
    }
    else if (args.type === 'export') {

    }else if (args.type === 'query') {
        if (tablename === null) {
            console.error("Please input tablename")
        }else {
            var tableCount = getTableCount(args.tablename);
            console.log(tableCount);
        }
    }
}

function getTableCount(tableName) {
    var table = db.getCollection(tableName);
    if (table !== null)
        return table.count();
    else {
        console.error("table does not exist", tableName)
        return -1;
    }
}
function queryDb(tableName, distinct, projection, filter) {
    var table = db.getCollection(tableName);
    console.log("table count", table.count(), "projection", projection, "filter", filter, "distinct", distinct);
    var result = [];
    var data = null;
    if (table !== null) {
        if (filter !== null)
            data = table.find(filter);
        else {
            data = table;
        }
        var uniqueSet = new Set();
        
        if (projection !== null) {
            if (projection === '["*"]')
                result = data;
            else {
                data.forEach(function(row) {
                    currRow = {}
                    projection.forEach(function (key) {
                        if (row.hasOwnProperty(key)) {
                           currRow[key] = row[key]
                        }
                    });
                    
                    if (distinct === true) {
                        if (!uniqueSet.has(JSON.stringify(currRow)))
                            uniqueSet.add(JSON.stringify(currRow))
                    }else {
                        result.push(currRow);
                    }
                });
                if (distinct) {
                    var re = Array.from(uniqueSet);
                    re.forEach(function(row){
                        result.push(JSON.parse(row));
                    })
                }
                console.log("result", result)
            }
        }
        else {
            result = data;
        }
        
        return result;
    }else {
        console.log("table not found", tableName)
        return {"error":"table not found"};
    }
}
function addTable(tableName) {
    var tables = db.getCollection("tables");
    var result = tables.where(function(t){
        return (t.table_name === tableName);
    })
    if (result === null) {
        var now = new Date();
        tables.insert({table_name: tableName, created_ts: now.getTime()})
    }
}
function importTb(csvFileName, tableName) {
    var table = db.getCollection(tableName);
    var rowCount = 0;
    if (table !== null)
        rowCount = table.count();
    else {
        table = db.addCollection(tableName);
    }
    console.log("trying to import", csvFileName, "to ", tableName, ", current row count", rowCount);
    
    fs.createReadStream(csvFileName)
      .pipe(csv(columns=true))
      .on('data', (row) => {
        table.insert(row);
      })
      .on('end', () => {
        table = db.getCollection(tableName);
        if (table !== null) {
            console.log("after insert, current row count", table.count());
            if (rowCount ==0) {
                addTable(tableName);
            }
        }
      });
    
}
                             
module.exports = {
    DbFunctions : function(type, params, ws, callback) {
        var tableName = params.tablename;
        var projection = params.projection;
        var distinct = params.distinct;
        var filter = params.filter;
        var r = queryDb(tableName, distinct, projection, filter);
        var finalObj =  {type: socket_const.OPTION_STATS, result: r};
        callback(ws,JSON.stringify(finalObj));
        
    }
}
