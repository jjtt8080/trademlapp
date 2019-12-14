import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import { Button, Icon} from 'antd';
import { Input , Select } from 'antd';
import { Alert } from 'antd';
import { TreeSelect } from 'antd';
import { connect} from "react-redux";
import { mapStateToProps, mapDispatchToProps, isEmpty, verifyServerResponse } from './ReduxMapping.js'
import { ConvertOptionData, ExtractExprDays } from './utils/GraphUtil.js'
import { Chart} from 'react-google-charts'
import { Row, Col } from 'antd';
import { OPTION_CHAIN_BR } from '../redux/constants'
const { Search } = Input;
const { Option } = Select;

const fieldNames =  ['strike', 'totalVolume', 'openInterest'];
const priceFieldNames = ['strike', 'lowPrice', 'openPrice', 'mark', 'highPrice'];
const chgFieldNames = ['strike', 'netChange', 'delta', 'theta']

class OptionChain extends React.Component {
        constructor(props){
        super(props);
        console.log("OptionChain constructor", this.props);
        this.getOption = this.getOptions.bind(this);
        this.displayResponse = this.displayResponse.bind(this);
        this.renderExprDate = this.renderExprDate.bind(this);
        this.handleSelectDate = this.handleSelectDate.bind(this);
        this.handleSelectField = this.handleSelectField.bind(this);
        this.renderChart = this.renderChart.bind(this);
        this.renderChartOptions = this.renderChartOptions.bind(this);
        this.onChange = this.onChange.bind(this);
        this.action_type = OPTION_CHAIN_BR;
        this.state = { value: undefined, expr_date: undefined, selected_fields: fieldNames, optionTreeData: undefined, chartType: 'LineChart'};
    }
    getOptions(v) {
        var newState = { value: v, callback: this.displayResponse};
        this.props.onGetOptions(newState);
    }
    onChange = value => {
        console.log(value);
        this.setState({ value });
    };

    displayResponse(server_response) {
        if (server_response !== '') {
            var res = verifyServerResponse(server_response, this.action_type);
				this.state.optionTreeData = res;
				this.props.onDisplayResponse({});
        }
    }
    handleSelectDate(value) {
        console.log("handleSelectDate get called", value, this.state.selected_fields);
        this.props.state.expr_date = value;
        if (value !== undefined) {
            var callData = ConvertOptionData(this.state.optionTreeData, value, 'CALL', this.state.selected_fields);
            var putData = ConvertOptionData(this.state.optionTreeData, value, 'PUT', this.state.selected_fields);
            this.props.onDisplayResponse({callData, putData});
        }
	 }
     handleSelectField(value) {
         console.log("handleSelectFields", value)
         if (this.state.selected_fields !== fieldNames & value === "V_OI") {
             //this.state.chartType = 'CandlestickChart'
             this.state.selected_fields = fieldNames;
             this.handleSelectDate(this.props.state.expr_date);
         }else if (this.state.selected_fields !== priceFieldNames & value === "Price") {
             this.state.selected_fields = priceFieldNames;
             this.handleSelectDate(this.props.state.expr_date);
         } else if (this.state.selected_fields !== chgFieldNames & value === "PriceChg") {
             this.state.selected_fields = chgFieldNames;
             this.handleSelectDate(this.props.state.expr_date);
         }
     }
	 renderExprDate(input) {
		  var options = ['default']
		  console.log("renderExprDate get called", input);
		  if (!isEmpty(input)) {
				var exprDays = ExtractExprDays(input);
				options = exprDays.map(function(d) {
					 return <Option key={d} value={d}>{d}</Option>
				}.bind(this));
		  }else {
				return <Option value="Default">default</Option>
		  }
		  return options;
		  
	 }
	 renderChart(type) {
		  if (type === 'CALL')
				console.log("render chart" , JSON.stringify(this.props.response.callData));
		  else {
				console.log("render chart" , JSON.stringify(this.props.response.putData));
				
		  }
		  
	 }
	 renderChartOptions (type){
		  return {
				title: "Option Chain:" + type + " " + this.state.selected_fields,
				curveType: "function",
				legend: { position: "bottom" },
                crosshair: {trigger: "both" }
		  };
	 };
	 render() {
	    return (
         <div>
            <Row>
                <Col span={8}>
                    <div>
                        Symbol:
                        <Search id="searchBox" placeholder="input the stock symbol"
                           onSearch={value =>this.getOptions(value)}
                           style={{ width: 150 }} defaultValue={this.props.state.value}/>
                    </div>
                </Col>
                <Col span={8}>
                    <div>
                        Expiration Date:
                        <Select onChange={this.handleSelectDate} style={{ width: 150}} >
                             {this.renderExprDate(this.state.optionTreeData)}
                        </Select>
                    </div>
                </Col>
                <Col span={8}>
                    <div>
                        Columns:
                        <Select onChange={this.handleSelectField} style={{ width: 150}} >
                             <Option key="V_OI">Vol OI</Option>
                             <Option key="Price">Price</Option>
                             <Option key="PriceChg">Chg</Option>
                        </Select>
                    </div>
                </Col>
            </Row>
            <Row>
			   <Col span={12}>
                   <div>
                        current selected date {this.props.state.expr_date}
                        <Chart id="option_call"
                             chartType={this.state.chartType}
                             width="100%"
                             height="400px"
                             data={this.props.response.callData}
                             options={this.renderChartOptions('CALL')}
                        />;
                        {this.renderChart('CALL')}
                    </div>
				</Col>
				<Col span={12}>	 
				    <div>
                        current selected date {this.props.state.expr_date}
                        <Chart id="option_put"
                            chartType={this.state.chartType}
                            width="100%"
                            height="400px"
                            data={this.props.response.putData}
                            options={this.renderChartOptions('PUT')}
                        />;
                        {this.renderChart('PUT')}
                    </div>   
				</Col>
            </Row>	
        </div>  
       );

    }
};

const OptionChains = connect(mapStateToProps, mapDispatchToProps)(OptionChain);
console.log(OptionChains)
//stockCharts.propTypes = StateObj;
export {OptionChains}
