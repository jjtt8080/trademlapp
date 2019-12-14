import React from 'react';
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
    if (value === undefined || value.length === 0 ) return {}
    var input = []
    value.forEach(function(v){
        if (v !== 'Default')
        {
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
        }
    })
    return input;
}

function ConvertTreeData(input, treeSeq) {
  var rootNode = new MyTreeNode("All ");
  input.forEach(function(row){
      //console.log("row", row);
      var concat_values = rootNode.getValue();
      var level = 0;
      var parent_node = rootNode;
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
            currNode = new MyTreeNode(concat_values, key)
            rootNode.addChildrenOfParent(new MyTreeNode(parent_key), currNode)
            parent_key = currNode.getValue()
            
         }
         level += 1;
      });
  })  
  //console.log("root node");
  rootNode.toString();
  return rootNode;
}

function ConvertData(input, parent) {
  var output = {};
  var parsedObj = input;

  output = [];
  var i = 0;
  var keys = Object.keys(parsedObj);
  var keylen = Object.keys(parsedObj).length;
  var values = Object.values(parsedObj);
  var k = '';
    for (i = 0; i < keylen; ++i){
      var a = values[i]
      var mappedObj = {
              'Quotes': a.symbol,
              'bid':  a.bidPrice,
              'ask': a.askPrice,
              'volume': a.totalVolume,
              '_52WkHigh': a["52WkHigh"],
              '_52WkLow':a["52WkLow"],
              'Chg': a["markChangeInDouble"],
              'PctChg': a["markPercentChangeInDouble"]
        }
      output.push(mappedObj);
      //console.log(JSON.stringify(mappedObj))
    }
    
    
    return output;
}
//export {mapReactTableColumns};
export {ConvertData};
export {ConvertTreeData};
export {ConvertToObj};