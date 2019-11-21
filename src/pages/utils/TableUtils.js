import React, {Component} from 'react';
import './TableUtils.css';
const fs = require('fs');
const watch_list_file = '../../data/watch_list.json'

function readWatchListFile() {
  var data = fs.readFileSync(watch_list_file);
  var watch_list = JSON.parse(data)["curr_list"]
  console.log(this.watch_list);
  return watch_list;
}
function buildData() {
  var watch_list = readWatchListFile();
  const data= [{quotes: 'AAPL', bid: 300, ask: 300, lastChange: 1, changePercent: 10, earningsDaySince: 5}]

}
