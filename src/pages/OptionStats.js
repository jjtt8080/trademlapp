import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {Button} from 'antd';
import {Input, Select} from 'antd';
import { Menu } from 'antd';
import { Alert } from 'antd';
import { connect} from "react-redux";
import { mapStateToProps, mapDispatchToProps, isEmpty, verifyServerResponse } from './ReduxMapping.js'
import { ConvertOptionData, ExtractExprDays } from './utils/GraphUtil.js'
import { ConvertTreeData, ConvertToObj } from './utils/TableUtils.js';
import { Chart} from 'react-google-charts'
import { Row, Col } from 'antd';
import { TreeSelect } from 'antd';
import { OPTION_STATS_BR, GET_WATCHLIST_BYNAME_BR, OPTION_STATS_FIELDS_BR} from '../redux/constants'
import ReactTable from 'react-table';
import 'react-table/react-table.css'
import { WatchListDowndownMenu } from './WatchListManage.js'
const { Search } = Input;
const { Option } = Select;
const { TreeNode } = TreeSelect;
const treeData = [
  {
    title: 'Node1',
    value: '0-0',
    key: '0-0',
    children: [
      {
        title: 'Child Node1',
        value: '0-0-1',
        key: '0-0-1',
      },
      {
        title: 'Child Node2',
        value: '0-0-2',
        key: '0-0-2',
      },
    ],
  },
  {
    title: 'Node2',
    value: '0-1',
    key: '0-1',
  },
];


const expiration_year = ['2014', '2015', '2016', '2017', '2018', '2019']
class OptionStats extends React.Component {
        constructor(props){
        super(props);
        console.log("OptionStats constructor", this.props);
        this.getOptionStats = this.getOptionStats.bind(this);
        this.displayResponse = this.displayResponse.bind(this);
        this.renderWatchList = this.renderWatchList.bind(this);
        this.action_type = OPTION_STATS_BR;
        this.state = { queryObj: undefined, optionStatsTree: undefined, renderedTreeData: [], treeValue: [], 
                      watchlists: this.props.watchlists,  watch_list_name: undefined, 
                      optionStatsData: undefined, chartType: 'LineChart',
                      columns_title: ['year', 'month', 'symbol', 'avg_calliv','avg_putiv','avg_meaniv','avg_callvol','avg_putvol','avg_calloi','avg_putoi']};
    }
    componentDidMount() {
        if (this.state.symbols === undefined)
            this.getOptionStatsFields()
    }
    getOptionStats(value) {
        var filterVal = ConvertToObj(value, ["year", "month"])
        var newState = { watch_list_name: this.props.watch_list_name, 
                        optionQueryObj: {tablename: "optionstats", 
                                         projectionAttrs:["year","month","symbol"], 
                                         projectionMeasures:["calliv", "putiv", "meaniv", "callvol", "putvol", "calloi", "putoi"],
                                         filter:filterVal},
                        callback: this.displayResponse};
         console.log("getting optionstats", JSON.stringify(newState))
        this.props.onGetOptionStats(newState);
    }
    onChange = value => {
        var v = undefined;
        console.log(value);
        this.setState({treeValue: value });
        console.log("this.state.treeValue", this.state.treeValue);
        if (value !== "default") {
            this.getOptionStats(value);
        }
    };

    displayResponse(server_response) {
        if (server_response !== '') {
            var res = verifyServerResponse(server_response, this.action_type);
				this.state.optionStatsData = res;
				this.props.onDisplayResponse(this.state.optionStatsData);
        }
    }
    getOptionStatsFields = () => {
        if (this.state.symbols === undefined) {
            var newState = {optionQueryObj: {tablename: "optionstats", projectionAttrs:["year","month"], projectionMeasures:[], distinct:true},
                                callback: this.populateDate}
            this.props.onGetOptionStatsFields(newState)
        }
    }
   
    populateDate = (server_response)=> {
        if (server_response !== ''){
            var res = verifyServerResponse(server_response, OPTION_STATS_FIELDS_BR);
            console.log(res);
            if (isEmpty(res) === false) {
                this.state.treeFields = res;
                console.log(res)
                var treeNode = ConvertTreeData(res, ["year", "month"]);
                console.log("converted tree node", treeNode)
                this.state.optionStatsTree = treeNode;
                this.props.onGetOptionStats(this.state);
            }
        }
    }
   
   
   
	 renderWatchList() {
        var options = this.props.watchlists.map(function(y) {
             return <Option key={y} value={y}>{y}</Option>
        }.bind(this));
        return options;
		  
	 }
	 renderTableByType(type) {
		  if (type === 'CALL') {
				console.log("render chart" , JSON.stringify(this.props.response.callData));
          } else {
				console.log("render chart" , JSON.stringify(this.props.response.putData));
		  }
		  
	 }
     renderTreeData = () => {
         console.log("render tree data", this.state.optionStatsTree);
         if (this.state.optionStatsTree !== undefined) {
            this.state.renderedTreeData = []
            this.state.renderedTreeData = this.state.optionStatsTree.toTreeData(this.state.renderedTreeData)
             console.log("renderTreeData", this.state.renderedTreeData);
            return  (this.state.renderedTreeData);
         } else {
            return [{id: "default", key: "default", value: "default", isLeaf: true}]
         }
         
     }
     mapReactTableColumns = () => {
        var output = []
        var i = 0;
        for (var k in this.state.columns_title){
            var c = this.state.columns_title[k];
              output.push({
                  Header: c,
                  accessor: c,
              });
        }
        console.log("columns", output)
        return output;
         
     }
     renderTable = () => {
         if (this.state.optionStatsData !== undefined)
         return (
           <div>
            <Col span={24}>
                   <div>
                     <ReactTable
                      showPagination={false}
                      minRows={0}
                      columns={this.mapReactTableColumns()} data={this.state.optionStatsData}
                      getTrProps={this.getTrProps}

                     />
                    </div>
            </Col>	
            </div>
        );
        else return (<div></div>);
     }
     renderTreeNode = () => {
         return (
         <TreeSelect
            showSearch
            style={{ width: '75%'}}
            value={this.state.treeValue}
            dropdownStyle={{ maxHeight: 100, overflow: 'auto' }}
            placeholder="Please select"
            allowClear
            multiple={true}
            treeData={this.renderTreeData()}
            treeDefaultExpandAll={false}
            onChange={this.onChange}
         >
        
        </TreeSelect>
        );
     }
	 render() {
	    return (
         <div>
            <Row>
                <Col span={12}>
                    Expiration Date: 
                    {this.renderTreeNode()}
                </Col>
                <Col span={12}>
                    <div>
                        WatchLists:
                        <WatchListDowndownMenu state={this.state}/>
                    </div>
                </Col>
            </Row>
            <Row>
			   {this.renderTable()}
            </Row>	
        </div>  
       );

    }
};

const OptionStatistics = connect(mapStateToProps, mapDispatchToProps)(OptionStats);
console.log(OptionStatistics)
//stockCharts.propTypes = StateObj;
export {OptionStatistics}
