import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Button, Icon } from 'antd';
import { Input } from 'antd';
import { Alert } from 'antd';
import { connect } from "react-redux";
import { ADD_STOCK,GET_QUOTE } from '../redux/constants/index';
import { mapStateToProps, mapDispatchToProps, verifyServerResponse, isEmpty } from './ReduxMapping.js'
import { ConvertData } from './utils/GraphUtil.js'
import { ComboChart, Chart, ColumnChart, LineChart} from 'react-google-charts'
const { Search } = Input;

const ButtonGroup = Button.Group;
var resolutions = ['1m', '15m', '1D', '15D', '1M', '1Y', '5Y'];

const prePopulatedPage = pageid => {
    if (pageid === "Markets.S&P")
        return "SPY"
    if (pageid ===  "Markets.QQQ")
        return "QQQ"
    if (pageid === "Markets.DowJones")
        return "DIA"
    if (pageid === "Markets.IWM")
        return "IWM"
    else if (pageid === "Markets.USO")
        return "USO"
    else
        return ""
}

class StockChart extends React.Component {

    constructor(props){
        super(props);
        console.log("StockChart constructor", this.props);
        //console.log(props)
        this.addStockToList = this.addStockToList.bind(this);
        this.removeStockFromList = this.removeStockFromList.bind(this);
        this.displayServerResponse = this.displayServerResponse.bind(this);
        this.displayResolutionButton = this.displayResolutionButton.bind(this)
        this.setResolution = this.setResolution.bind(this);
        this.action_type = ADD_STOCK;
        this.state = {
            checked: false,
            page: "Stock.Charts", 
            resolution: "D",
            value: ""
        }
    }
    prePopulateContent = props => {
        var v = prePopulatedPage(props.page);
        if ( v !== '' && v !== undefined) {
            var r = props.resolution;
            if (props.resolution === undefined && this.state.resolution !== undefined)
                r = this.state.resolution
            this.addStockToList(v, r)
            this.state = { checked: true, page: props.page, resolution: r, value: v};
        }else {
           console.log("empty page")
        }   
    }
    componentDidMount() {
        console.log("componentDidMount in stock chart, this.state", this.state.page)
        console.log("componentDidMount in stock chart, this.props", this.props.page)
        if (this.state.page !== this.props.page) {
            this.state.checked = false;
        }
        if (this.state.checked === false){
            this.prePopulateContent(this.props);
        }
    }
    componentWillReceiveProps(props) {
        console.log("componentWillReceiveProps in stock chart, this.state", this.state, props)
        if (this.state.page !== props.page) {
            this.prePopulateContent(props);
        }
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
        if (v === '' | v === null) {
            alert("Choose a stock to display chart")
        }else{
            var newState = this.props.state;
            newState.callback = this.displayServerResponse;
            newState.value = v;
            newState.resolution = r;
            console.log("at addStockToList", newState)
            this.props.onAddStock(newState);
        }
    }

    displayResolutionButton() {
        var buttons = resolutions.map(function(r){
        return <Button key={r} onClick={e=>{this.setResolution(e, r)}}>{r}</Button>
        }.bind(this));
        return buttons;
    }

    displayServerResponse(server_response) {
        if (server_response !== '') {
          var res = verifyServerResponse(server_response, this.action_type);
          if (isEmpty(res) === false){
              //console.log("in displayServerReponse" + res);
              var r  = ConvertData(res, this.resolution);
              //console.log("current server response is", JSON.stringify(r))
              this.props.onDisplayResponse(r)
          }
        }
    }

    removeStockFromList(e) {
        e.preventDefault();
    }


    render() {
        return (
        <div>
           <div>    
            <Search id="searchBox" placeholder="input the stock symbol"
             onSearch={value =>this.addStockToList(value, this.resolution)}
             style={{ width: 200 }} defaultValue={this.state.value}/>
             <ButtonGroup>
                {this.displayResolutionButton()}
             </ButtonGroup>
             <div id="value">Curren time frame is: {this.resolution}</div>
             <div className={"my-pretty-chart-container"}>
             <Chart
               chartType="CandlestickChart"
               width="100%"
               height="80%"
               loader={<div>Loading Chart</div>}
               options={{
                    legend: 'none',
                    title:'Stock price for ' + this.props.value,
                    hAxis:{title:"time"},
                    vAxis:{title:"price"},
                    crosshair: { trigger: 'both' },
                    candlestick: {
                       fallingColor: { strokeWidth: 0, fill: '#a52714' },
                       isingColor: { strokeWidth: 0, fill: '#0f9d58' }
                    },
               }}

               data={this.props.response.data}
            />

             <Chart
                 chartType="ColumnChart"
                 width="100%"
                 height="20%"
                 options={{
                    legend: 'none',
                    title:'volume for' + this.props.value,
                    hAxis:{title:"time"},
                    vAxis:{title:"volume"}
                 }}
                 data={this.props.response.volumeData}

              />
              </div>
            </div>
         </div>
        );
    }


}

const StockCharts = connect(mapStateToProps, mapDispatchToProps)(StockChart);
console.log(StockCharts)
//stockCharts.propTypes = StateObj;
export {StockCharts}
