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


const expiration_year = ['2014', '2015', '2016', '2017', '2018', '2019'];

const optionstat_proj = ["year","month","symbol"];
const optionstat_meas = [{"$avg": "$median_iv_call"},
        {"$avg": "$median_iv_put"},  
        {"$avg": "$max_vol_call"},
        {"$avg":"$max_vol_put"}, 
        {"$avg": "$mean_oi_call"},
        {"$avg": "$mean_oi_put"}];

// Keep this in sync with db_api mongo_api 
function makeFieldNameForMeasure(c) {
    var retV = ""
    var keys = Object.keys(c);
    keys.forEach(k=>{   
        var value = JSON.stringify(c[k]);
        value = value.replace("\"", "");
        value = value.replace("$", "");
        value = value.replace("\"", "");
        retV = k.substr(1, k.length-1)+ "_" + value;
    })
    return retV

} 
class OptionStats extends React.Component {
        constructor(props){
        super(props);
        console.log("OptionStats constructor", this.props);
        this.getOptionStats = this.getOptionStats.bind(this);
        this.displayResponse = this.displayResponse.bind(this);
        this.renderWatchList = this.renderWatchList.bind(this);
        this.action_type = OPTION_STATS_BR;
        var meas_titles = optionstat_meas.map(k=>{
            return makeFieldNameForMeasure(k);
        })
        var column_titles = optionstat_proj.concat(meas_titles);
        this.state = { optionQueryObj: undefined, optionStatsTree: undefined, renderedTreeData: [], treeValue: [], 
                      watchlists: this.props.watchlists,  watch_list_name: undefined, stock_lists: [],
                      optionStatsData: undefined, chartType: 'LineChart',
                      columns_title: column_titles};
    }
    componentDidMount() {
        if (this.state.symbols === undefined)
            this.getOptionStatsFields()
        this._isMounted = true;
    }
    componentWillUnmount() {
        this._isMounted = false;
    }
    
    shouldComponentUpdate(nextProp, nextState) {
        if (this.state.watch_list_name != nextProp.watch_list_name) {
            console.log("watch_list_name", this.state.watch_list_name, nextProp.watch_list_name, nextState.watch_list_name)
            this.state.watch_list_name = nextProp.watch_list_name;
            this.state.optionStatsData = undefined; 
            return true;
        }
        if (this.state.treeValue !== nextProp.treeValue) {
            return true;
        }
        return false;
    }
    componentDidUpdate(prevProps, prevState, snapshot){
         console.log("OptionStats componentdid update",this.props.watchlists_dirty, this.props.watch_list_name, prevProps.watch_list_name);
        if (this.props.watchlists_dirty === false && prevProps.watch_list_name !== this.props.watch_list_name) {
            this.setState({watchlists_dirty: true})
            this.getOptionStats(this.state.treeValue)
        }
    }
    getOptionStats(value) {
        var filterVal = ConvertToObj(value, ["year", "month"])
        var newState = { 
                        optionQueryObj: {tablename: "optionstats", 
                                         projectionAttrs:optionstat_proj, 
                                         projectionMeasures: optionstat_meas,
                                         filter:filterVal,
                                         sortSpec:{"symbol": 1, "year": 1, "month":1},
                                        WATCH_LIST_NAME: this.state.watch_list_name},
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
            var newState = {optionQueryObj: {tablename: "optionstats", projectionAttrs:["year","month"], projectionMeasures:[], distinct:true,  sortSpec:{"year": 1, "month":1}},callback: this.populateDate}
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
         //console.log("render tree data", this.state.optionStatsTree);
         if (this.state.optionStatsTree !== undefined) {
            this.state.renderedTreeData = []
            this.state.renderedTreeData = this.state.optionStatsTree.toTreeData(this.state.renderedTreeData)
             //console.log("renderTreeData", this.state.renderedTreeData);
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
