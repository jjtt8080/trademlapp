import React from 'react';
import { Button } from 'antd';
import { Input } from 'antd';
import { connect } from "react-redux";
import { ADD_STOCK, GET_MODEL_PREDICTIONS} from '../redux/constants/index';
import { mapStateToProps, mapDispatchToProps, verifyServerResponse, isEmpty } from './ReduxMapping.js'
import { ConvertVictoryStockData,ConvertVictoryPredictions } from './utils/GraphUtil.js'
import { VictoryChart, VictoryAxis, VictoryGroup, VictoryTooltip, VictoryCursorContainer, VictoryCandlestick, VictoryVoronoiContainer, VictoryLine, VictoryContainer, VictoryTheme, createContainer } from "victory"; 
import { merge, random, range } from "lodash";
const { Search } = Input;
const VictoryZoomVoronoiContainer = createContainer("zoom", "voronoi");
class Model extends React.Component {
    
    constructor() {
        super();
        this.state = {
          data : []
        };
       
        this.data = range(100).map((x) => ({x, y: 100 + x + random(10)}));
        this.action_type = ADD_STOCK;
        this.action_type_prediction = GET_MODEL_PREDICTIONS;
        this.resolution = "356D";
        this.state = {};
    }

  handleZoom = (domain) => {
    this.setState({selectedDomain: domain});
  }

  handleBrush = (domain) => {
    this.setState({zoomDomain: domain});
  }

    addStockToList = (v, r) => {
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
    displayServerResponse = (server_response) => {
        if (server_response !== '') {
          var res = verifyServerResponse(server_response, this.action_type);
          if (isEmpty(res) === false){
              //console.log("in displayServerReponse" + res);
              var r  = ConvertVictoryStockData(res);
              console.log("current server response is", JSON.stringify(r))
              this.props.onDisplayResponse(r)
              this.getModelPredictions();
          }
          else {
              res = verifyServerResponse(server_response, this.action_type_prediction);
              if (isEmpty(res) === false){
                  
                  var r = ConvertVictoryPredictions(res);
                  console.log("server response", r);
                  if (this.props.response.data !== {}) {
                      r["data"] = this.props.response.data;
                  }
                  console.log("model prediction result", r);
                  this.props.onDisplayResponse(r);
              }
          }
        }
    }
    getModelPredictions = () => {
        var state = this.props.state;
        state.callback = this.displayServerResponse;
        var todayDate = new Date();
        var shortStringDate = (todayDate.getYear() -100 ) + "" +
         ("00" + (todayDate.getMonth() +1)).slice(-2) +  "" + (todayDate.getDate() );
        console.log("short date", shortStringDate);
        state.modelQueryObj = {symbol: this.props.value, date: shortStringDate};
        this.props.onGetModelPredictions(state);
    }
    render() {
        return (
        <div>
            <div>
            <Search id="searchBox" placeholder="input the stock symbol"
                onSearch={value =>this.addStockToList(value, this.resolution)}
                style={{ width: 200 }} defaultValue={this.state.value}/>
            </div>``
            <div>
                <VictoryChart  
                    theme={VictoryTheme.material}
                    domainPadding={{ x : 7 }}
                    scale={{ x: "time" }}
                    style={{ parent: { maxWidth: "70%" } }}
                    width={700} height={400}
                    containerComponent={<VictoryZoomVoronoiContainer
                        labels={({ datum }) => `${datum.y}`}
                        labelComponent={<VictoryTooltip/>} 
                    />}
                    
                >
                <VictoryAxis tickFormat={(t) => `${t.getYear()+1900}/${t.getMonth()+1}/${t.getDate()}`}/>
                <VictoryAxis dependentAxis/>
                <VictoryGroup>
                    <VictoryCandlestick
                        candleColors={{ positive: "white", negative: "red" }}
                        labels={({ datum }) => `c:${datum.close}`}
                        labelComponent={<VictoryTooltip dx={0} dy={-60}/>}
                        data={this.props.response.data}
                    />
                     <VictoryLine
                        
                        labelComponent={<VictoryTooltip dx={0} dy={-30}/>}
                        data ={this.props.response.predictions}/>
                </VictoryGroup>
                </VictoryChart>
            </div>
        </div>
        );
    }
     
};

const Models = connect(mapStateToProps, mapDispatchToProps)(Model);

//stockCharts.propTypes = StateObj;
export {Models}