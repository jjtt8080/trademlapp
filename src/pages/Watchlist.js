import React, {Component, forwardRef} from 'react';
import { Input, Dropdown, Menu } from 'antd';
import { connect } from "react-redux";
import { GET_WATCHLIST_BYNAME_BR, GET_QUOTE } from '../redux/constants/index';
import { mapStateToProps, mapDispatchToProps, isEmpty, verifyServerResponse } from './ReduxMapping.js'
import ReactDOM from 'react-dom';
//import ReactTable from 'react-table';
import "antd/dist/antd.css";
import { Button, Icon, Form } from 'antd';
import ReactTable from 'react-table';
import 'react-table/react-table.css'

const antd = require('antd');
const { TextArea } = Input;
const { Search } = Input;
const columns_title = [ 'Action', 'volume', 'bid', 'ask', '_52WkLow', '_52WkHigh', 'Chg', 'PctChg' ]
const columns_datatype = {
     'Quotes': 'action',
     'volume': 'integer',
     'bid': 'float',
     'ask': 'float',
     '_52WkLow': 'float',
     '_52WkHigh': 'float',
     'NetChg': 'float',
     'PctChg': 'float'}

const tableUtils = require('./utils/TableUtils.js')

var emptyHeader =  [{"Quotes": 'Click watch list to add', "bid": 0, "ask": 0, "volume": 0, "_52WkLow":0, "_52WkHigh": 0 }];
var data= emptyHeader;



class Watchlist extends React.Component {
    constructor(props){
        super(props);
        this.requestQuotes = this.requestQuotes.bind(this);
        this.displayServerResponse = this.displayServerResponse.bind(this);
        this.getWatchList = this.getWatchList.bind(this);
        this.addToWatchList = this.addToWatchList.bind(this);
        this.renderSearchSymbol = this.renderSearchSymbol.bind(this);
        this.populateStockList = this.populateStockList.bind(this);
        this.getTrProps = this.getTrProps.bind(this);
       
        this.watch_list_name = this.props.watch_list_name === '' ?
            this.props.page.split(".")[1] : this.props.watch_list_name
        console.log("watchlist constructor, this.watch_list_name", this.watch_list_name);
        this.watch_list = [];
        this.getWatchList(this.watch_list_name);
        this.action_type = GET_WATCHLIST_BYNAME_BR;
        this.state = {
            selected: {}, selectAll: 0,
            watch_list_name : this.watch_list_name,
            
        } 
    }
    mapReactTableColumns = () => {
        var output = []
        var i = 0;
        for (var k in columns_title){
            var c = columns_title[k];
            var dt = columns_datatype;
            if (c === 'Action') {
              output.push({
                Header: c,
                accessor: c,
                style: {background:"black", color:"white"},
                columns: [
                    {
                        id: "checkbox",
                        accessor: "",
                        Cell: ({ original }) => {
                            return (
                                <input
                                    type="checkbox"
                                    className="checkbox"
                                    checked={this.state.selected[original.Quotes] === true}
                                    onChange={() => this.toggleRow(original.Quotes)}
                                />
                            );
                        },
                        Header: x => {
							return (
								<input
									type="checkbox"
									className="checkbox"
									checked={this.state.selectAll === 1}
									ref={input => {
										if (input) {
											input.indeterminate = this.state.selectAll === 2;
										}
									}}
									onChange={() => this.toggleSelectAll()}
								/>
							);
						},
                        sortable: false,
                        width: 45
                     },
                     {
                        Header: "Quotes",
                        accessor: "Quotes",

                    }
                ]
              });
            } else {
              output.push({
                  Header: c,
                  accessor: c,
              });
            }
        }
        console.log("columns", output)
        return output;
    }

    toggleRow = (q) => {
		const newSelected = Object.assign({}, this.state.selected);
		newSelected[q] = !this.state.selected[q];

		this.setState({
			selected: newSelected,
			selectAll: 2
		});
        console.log("toggleRow", q, newSelected)
       
	}
    toggleSelectAll = () => {
		let newSelected = {};

		if (this.state.selectAll === 0) {
			this.state.data.forEach(x => {
				newSelected[x.Quotes] = true;
			});
		}

		this.setState({
			selected: newSelected,
			selectAll: this.state.selectAll === 0 ? 1 : 0
		});
	}
    componentDidMount() {
        this._isMounted = true;
        console.log("componentDidMount", this._isMounted);
    }
    componentWillUnmount(){
        console.log("componentWillUnmount")
        this._isMounted = false;   
    }
    shouldComponentUpdate(nextProp, nextState) {
        if  (this.watch_list_name !== nextProp.watch_list_name) {
            
            console.log("shouldComponentUpdate", nextProp.watch_list_name, this.watch_list_name);
            //this.watch_list_name = nextProp.watch_list_name;
            this.state.data = emptyHeader;
            if (this._isMounted)
                this.getWatchList(nextProp.watch_list_name);
            return true;
        }
        return false;
        
        
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("componentDidUpdate");
        this.watch_list_name = this.props.watch_list_name;
    }
    
    renderSearchSymbol() {
        return(
            <div>
                <Search id="searchBox" placeholder="input the stock symbol"
                    onSearch={value =>this.addToWatchList(value)}
                    style={{ width: 200 }} defaultValue={this.state.value}/>
            </div> 
        );
    }
    
    addToWatchList(values) {
        if ((values !== '') && (values !== undefined)) {
            var newValues = values.split(',');
            var curr_list = this.watch_list;
            var union_list = [...new Set([...newValues, ...curr_list])];
            this.watch_list = union_list;
            this.requestQuotes(this.watch_list);
        }
    }
    populateStockList(server_response) {
        if (server_response !== ''){
            var res = verifyServerResponse(server_response, GET_WATCHLIST_BYNAME_BR);
            if (isEmpty(res) === false) {
                //console.log("populateStockList", res)
                var new_watch_list_name = this.watch_list_name;
                for (var obj in res){
                    if (res.hasOwnProperty(obj)){
                        //console.log("returned watchlistname", obj)
                        new_watch_list_name = obj;
                        break;
                    }
                }
                this.watch_list = res[new_watch_list_name]
                //console.log("at populate stock list", res);
                this.requestQuotes(this.watch_list);
            }
        }
    }
    getWatchList(watch_list_name) {
        if (watch_list_name !== '' ){
            var newState = {watch_list_name: watch_list_name,
                            callback: this.populateStockList}
            this.props.onGetWatchListByName(newState)
            
        }

    }
    requestQuotes(watch_list) {
        var newState = {}
        newState.callback = this.displayServerResponse;
        newState.stock_list = watch_list;
        this.props.onRealtimeQuote(newState);
    }
    
    displayServerResponse(server_response) {
        //console.log("display server response", server_response, this.watch_list_name)
        if (server_response !== '') {
            var res = verifyServerResponse(server_response, GET_QUOTE);
            var convertedData;
            if (isEmpty(res) === false) {
                convertedData = tableUtils.ConvertData(res, this);
                //console.log("converted", convertedData);
            }
            else {
                //console.log("empty response", convertedData);
                this.state.data = emptyHeader;
                this.props.onDisplayResponse(emptyHeader);
            }
            if ((this.watch_list_name !== '' || this.props.watch_list_name.value != '' ) && isEmpty(convertedData) === false) {  
                this.state.data = convertedData;
                console.log("onDisplayResponse", this._isMounted, convertedData)
                this.props.onDisplayResponse(this.props.stock_list)
                if (this._isMounted) {
                    this.forceUpdate();
                }
            }else {
                console.error("empty watch_list_name")
            }
            
        } else {
            this.state.data = emptyHeader;
            //console.log("empty result 2");
            this.props.onDisplayResponse(emptyHeader);
        }
    }
    
    getTrProps = (state, rowInfo, instance) => {
        if (rowInfo) {
            return {
                style: {
                    background: rowInfo.row.volume > 5000000 ?  '#aed6f1': 'black', 
                    color: rowInfo.row.Chg < 0 ? 'red' : 'blue',
                    textAlign: 'right'
                }
            }
        }
        return {};
    };
    renderTableData = () => {
        console.log("this render tableData", this.state.data)
        return this.state.data;
    }
    renderInternal() {
        return (
           <div>
            {this.renderSearchSymbol()}
                <div>
                    <ReactTable name={this.props.watch_list_name}
                      showPagination={true}
                      minRows={0}
                      columns={this.mapReactTableColumns()} data={this.renderTableData()}
                      getTrProps={this.getTrProps}

                    />
                </div>
                          
             </div>

        );
    }
    render() {
       
            return (this.renderInternal());
       
    }
}

const Watchlists = connect(mapStateToProps, mapDispatchToProps)(Watchlist);
//console.log(Watchlists)
//stockCharts.propTypes = StateObj;
export {Watchlists}
