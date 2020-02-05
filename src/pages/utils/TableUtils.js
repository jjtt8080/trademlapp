//import React from 'react';
// Convert from [ { year: '2014', month: '12' }, { year: '2014', month: '11' } ]
// to
// <TreeNode value="All" title="All" key="0">
//          <TreeNode value="2014" title="2014" key="2014">
//            <TreeNode value="2014-11" title="Nov" key="2014-11" />
//            <TreeNode value="2014-12" title="Dec" key="2014-12" />
//          </TreeNode>
//This is asasuming every value in the tree has unique value
class MyTreeNode {
  constructor(value, objectName) {
    this.value = value;
    this.descendents = [];
    this.count = 1 + this.descendents.length;
    this.level = 0;
    this.pId = 0;
    this.isLeaf = true;
  }
  getValue(){
      return this.value;
  }
  setLevel(l) {
      this.level = l;
  }
  getLevel() {
      return this.level;
  }
  getChildren() {
      return this.descendents();
  }
  getpId() {
      return this.pId;
  }
  setpId(id) {
      this.pId = id;
  }
  getIsLeaf() {
      return (this.descendents.length ===0);
  }
 
  addChildren(treeNode) {
      var bUnique = true;
      this.descendents.forEach(function(c){
          if (c.getValue() === treeNode.getValue()) {
              bUnique = false;
          }
      })
      if (bUnique) {
          treeNode.setpId(this.getValue());
          treeNode.setLevel(this.getLevel() + 1);
          this.descendents.push(treeNode);
          this.isLeaf = false;
      }
  }
  addChildrenOfParent(parentNode, treeNode) {
      if (this.getValue() === parentNode.getValue()){
          this.addChildren(treeNode)
      }else {
          this.descendents.forEach(function(c){
              c.addChildrenOfParent(parentNode, treeNode)
          })
      }
  }
  getCount() {
      var count = 1;
      if (this.isLeaf === false) {
          this.descendents.forEach(function(c){
              count += c.getCount();
          })
      }
      return count;
  }
  toString() {
      if (this.getLevel() === 0) {
        // console.log("total nodes:" + this.getCount());
      }
      //console.log("level", this.getLevel(), ":", this.getValue());
      if (this.descendents.length > 0) {
          //console.log("children: [");
          this.descendents.forEach(function(c){
              c.toString();
          })
          //console.log("]")
      }
  }
  toTreeData(returnValue) {
      var objTreeRow = {}
      objTreeRow.value = this.getValue();
      objTreeRow.title = this.getValue();
      objTreeRow.isLeaf = this.getIsLeaf();
      objTreeRow.key = this.getValue();
      objTreeRow.title = this.getValue();
      objTreeRow.pId = this.getpId();
      objTreeRow.selectable = true;
      //console.log("push", JSON.stringify(objTreeRow), " ", returnValue.length)
      objTreeRow.children = []
     
      this.descendents.forEach(function(c){
          objTreeRow.children = c.toTreeData(objTreeRow.children);
      })
      returnValue.push(objTreeRow);
      return returnValue;
  }
}
function ConvertToObj(value, objNames) {
    if (value === undefined || value.length === 0 || value === "All") return {}
    var input = []
    
    value.forEach(function(v){
        var values = v.split("-")
        var returnObj = {}
        var i = 0;
        objNames.forEach(function(n){
        if (!isNaN(values[i]))
            returnObj[n] = Number(values[i])
        else
            returnObj[n] = values[i]
        i += 1;
        })
        input.push(returnObj);
        
    })
    return input;
}

function ConvertTreeData(input, treeSeq) {
  var rootNode = new MyTreeNode("All");
  input.forEach(function(row){
      //console.log("row", row);
      var concat_values = rootNode.getValue();

      var currNode = undefined;
      var parent_key = rootNode.getValue();
     
      var bFirst = true;
      treeSeq.forEach(function(key){   
         if (row.hasOwnProperty(key)) {
            if (bFirst === false)
                concat_values = concat_values.concat("-");
             else {
                 concat_values = ""
                 bFirst = false;
             }
            concat_values = concat_values.concat(row[key]);
            currNode = new MyTreeNode(concat_values, key);
            rootNode.addChildrenOfParent(new MyTreeNode(parent_key), currNode);
            parent_key = currNode.getValue()
            
         }
         
      });
  })  
  //console.log("root node");
  rootNode.toString();
  return rootNode;
}
                         
function getOriginalMap(watch_list_name) {
    
    var original_map = JSON.parse(sessionStorage.getItem(watch_list_name));
    //console.log("getting original map", watch_list_name, original_map)
    if (original_map !== undefined && original_map !== null) {
        var returningMap = new Map();
        for (var i =0; i < original_map.length; ++i) {
            var entry = original_map[i];
            returningMap.set(entry[0], entry[1]);
        }
        return returningMap;
    } else {
        return undefined;
    }
}
function setOriginalMap(watch_list_name, original_map) {
    //console.log("setting original map for watchlist", watch_list_name, original_map)
    sessionStorage.setItem(watch_list_name, JSON.stringify([...original_map]));
}
function convertOriginalDataToMap(data) {
    if (data === undefined) return undefined;
    var keylen = Object.keys(data).length;
    var values = Object.values(data);
    var returningMap = new Map();
    for (var i = 0; i < keylen; ++i) {
        var v = values[i];
        var currentSymbol = v["Quotes"];
        returningMap.set(currentSymbol,  v);
    }
    //console.log('originalMap keys:' + Object.keys(returningMap));
    return returningMap;
}
function supplementData(new_data, original_map, symbol, keyName) {
    //console.log("symbol", symbol);
    //if (original_map !== undefined && original_map !== null)
    //    console.log(original_map.get(symbol));
    return (new_data !== undefined && !isNaN(new_data) ? new_data : 
        (original_map !== undefined && original_map !== null && original_map.get(symbol) !== undefined) ?
         original_map.get(symbol)[keyName]: null);
}
function ConvertData(watch_list_name, watch_list, input, original_data) {
    var output = {};
    var parsedObj = input;

    output = [];
    var i = 0;
    var keys = Object.keys(parsedObj);
    var keylen = Object.keys(parsedObj).length;
    var values = Object.values(parsedObj);
    var k = '';
    var original_map = getOriginalMap(watch_list_name);
    var pushed_keys = [];
    for (i = 0; i < keylen; ++i){
        var a = values[i]
        var mappedObj = {
                'Quotes': a.symbol,
                'bid':  supplementData(a["bidPrice"], original_map, a.symbol, "bid"),
                'ask': supplementData(a["askPrice"], original_map, a.symbol, "ask"),
                'volume': supplementData(a["totalVolume"], original_map, a.symbol, "volume"),
                '_52WkHigh': supplementData(a["52WkHigh"], original_map, a.symbol, "_52WkHigh"),
                '_52WkLow':supplementData(a["52WkLow"], original_map, a.symbol, "_52WkLow"),
                'Chg': supplementData(a["netChange"], original_map, a.symbol, "Chg"),
                'PctChg': (supplementData(a["netChange"],original_map, a.symbol,"Chg")/
                            supplementData(a["askPrice"],original_map, a.symbol,"ask")*100.0).toFixed(2)
        }
        output.push(mappedObj);
        pushed_keys.push(a.symbol)
        //console.log(JSON.stringify(mappedObj))
    }
    if (original_map !== undefined) {
        for (const k of original_map.keys()){
            if (pushed_keys.indexOf(k) !== -1) {
                //console.log("not pushing ", k)
                continue;
            }
            //console.log("pushing ", k)
            //console.log("push original data from map", original_map.get(k))
            if (watch_list.indexOf(k) === -1) continue;
            output.push(original_map.get(k));
        }
    }
    if (original_data === undefined || original_map === null || original_map === undefined || pushed_keys.length>0) {
        var map = convertOriginalDataToMap(output);
        setOriginalMap(watch_list_name, map);
    }
    return output;
}
//export {mapReactTableColumns};
export {ConvertData};
export {ConvertTreeData};
export {ConvertToObj};