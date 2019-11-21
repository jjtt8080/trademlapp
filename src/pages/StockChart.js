
import React, {Component} from 'react';
import {Button, Icon} from 'antd';
import { Input } from 'antd';
import {connect} from "react-redux";
import {mapStateToProps, mapDispatchToProps} from './ReduxMapping.js'
import ReactDOM from 'react-dom';
import {ConvertData} from './utils/GraphUtil.js'
import {Chart} from 'react-google-charts'
const { Search } = Input;
const ButtonGroup = Button.Group;
var resolutions = ['1', '5', '15', '30', '60', 'D', 'W', 'M'];


class StockChart extends React.Component {

  constructor(props){
    super(props);
    console.log("StockChart constructor", this.props);
    //console.log(props)
    this.addStockToList = this.addStockToList.bind(this);
    this.removeStockFromList = this.removeStockFromList.bind(this);
    this.displayServerResponse = this.displayServerResponse.bind(this);
    this.setResolution = this.setResolution.bind(this);
    this.resolution = 'D'
    this.displayResolutionButton = this.displayResolutionButton.bind(this)

  }


  setResolution(e, r) {
    e.preventDefault();
    //e.preventDefault();
    console.log("resolution is set to :", r)
    this.resolution = r;
    var value = document.getElementById("searchBox").value
    this.addStockToList(value,r)
  }

  addStockToList(v, r) {
    var newState = this.props.state;
    newState.callback = this.displayServerResponse;
    newState.value = v;
    newState.resolution = r;
    console.log("at addStockToList", newState)
    this.props.onAddStock(newState);
  }

  displayResolutionButton() {
    var buttons = resolutions.map(function(r){
      return <Button onClick={e=>{this.setResolution(e, r)}}>{r}</Button>
    }.bind(this));

    return buttons;
  }


  displayServerResponse(server_response) {
    if (server_response != '') {
      console.log("in displayServerReponse" + server_response);
      var r = ConvertData(server_response, this.resolution);
      console.log("current server response is", JSON.stringify(r))
      this.props.onDisplayResponse(r)
    }
  }

  removeStockFromList(e) {
    e.preventDefault();
  }


  render() {
    return (
         <div>
            <Search id="searchBox" placeholder="input the stock symbol"
             onSearch={value =>this.addStockToList(value, this.resolution)}
             style={{ width: 200 }} defaultValue='AAPL'/>
             <ButtonGroup>
                {this.displayResolutionButton()}
             </ButtonGroup>
             <div id="value">Curren time frame is: {this.resolution}</div>
             <div className={"my-pretty-chart-container"}>
             <Chart
               chartType="CandlestickChart"
               width="100%"
               height="400px"
               options={{
                    legend: 'none',
                    title:'Stock price for ' + this.props.value,
                    hAxis:{title:"time"},
                    vAxis:{title:"price"}
               }}
               data={this.props.response.data}
             />
            </div>
             <br/>
             <br/>
             <Button id="minusButton" onClick={this.props.removeStock}>-</Button>
         </div>
        );
      }


}

const StockCharts = connect(mapStateToProps, mapDispatchToProps)(StockChart);
console.log(StockCharts)
//stockCharts.propTypes = StateObj;
export {StockCharts}
