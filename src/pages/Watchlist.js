import React, {Component} from 'react';
import { Input } from 'antd';
import {connect} from "react-redux";
import {mapStateToProps, mapDispatchToProps} from './ReduxMapping.js'
import ReactDOM from 'react-dom';
import ReactTable from 'react-table';
import "antd/dist/antd.css";
import Table from 'rc-table';
const antd = require('antd');
const { TextArea } = Input;
const { Search } = Input;


const columns = [
  {title: 'Quotes',  dataIndex: 'quotes',key: 'quotes', render: text => <a>{text}</a>, width: 100},
  {title: 'Bid',  dataIndex: 'bid',key: 'bid', width: 100},
  {title: 'Ask',  dataIndex: 'ask',key: 'ask', width: 100},
  {title: 'LastChange',  dataIndex: 'lastChange',key: 'lastChange', width: 100},
  {title: 'Change%',  dataIndex: 'changePercent',key: 'changePercent', width: 100},
  {title: 'EarningsDaySince',  dataIndex: 'earningsDaySince',key: 'earningsDaySince', width: 100},
];
const data= [{quotes: 'AAPL', bid: 300, ask: 300, lastChange: 1, changePercent: 10, earningsDaySince: 5}]

class Watchlist extends React.Component {

  constructor(props){
    super(props);
    console.log("watchlist constructor", this.props);
    this.data = [{name: 'AAPL', bid: 300, ask: 300, lastChange: 1, changePrecent: 10, earningsDaySince: 5}]
  }

  addStockToList(v, r) {
    var newState = this.props.state;
    newState.callback = this.displayServerResponse;
    newState.value = v;
    newState.resolution = r;
    console.log("at addStockToList", newState)
    this.props.onAddStock(newState);
  }

  render() {
    return (
      <div>
        <div>
        <Input placeholder="Enter comma separated symbols" />
        <Table
        columns={columns} data={data}
        tableLayout='auto'
        />
        </div>
     </div>
    );
  }
}

const Watchlists = connect(mapStateToProps, mapDispatchToProps)(Watchlist);
console.log(Watchlists)
//stockCharts.propTypes = StateObj;
export {Watchlists}
