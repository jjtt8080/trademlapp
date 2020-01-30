import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Input, Dropdown, Menu, Popover, Card, List } from 'antd';
import { connect } from "react-redux";
import { mapStateToProps, mapDispatchToProps, isEmpty, verifyServerResponse } from './ReduxMapping.js'
import { GET_QUOTE, UPDATE_WATCH_LIST_BR, GET_WATCH_LISTS_BR, GET_WATCHLIST_BYNAME_BR } from '../redux/constants/index';
import "antd/dist/antd.css";
import "./WatchListManaged.css"
import { Button, Icon} from 'antd';
import 'react-table/react-table.css'
import { Watchlists } from './Watchlist.js'
import { WatchListPopupDiag } from './WatchListPopup'
const antd = require('antd');
const { TextArea } = Input;
const { Search } = Input;
class WatchlistDropdown extends React.Component{
    constructor(props){
        super(props);
        console.log("watchlistdropdown constructor ", props.watchlists_dirty, this.props.watchlists)
       
        this.displayMenus = this.displayMenus.bind(this);
        this.getWatchLists = this.getWatchLists.bind(this);
        this.displayWatchLists = this.displayWatchLists.bind(this);
        this.manageClick = this.manageClick.bind(this);
        this.watchlists = this.props.watchlists;
        this.state = {checked : false,  watchlists_dirty : props.watchlists_dirty};
        if (this.props.page === 'WatchLists.Manage' )
            this.state.showResult = false;
        else
            this.state.showResult = true;
        //console.log("dropdown constructor", this.props.page, this.state)
        this.action_type = GET_WATCH_LISTS_BR;
        this.watch_list_name = "Default";
        this.stock_list = [];
       
    }
    componentDidMount() {
        console.log("WatchlistDropdown componentDidMount")
        if (this.state.checked === false){
            this.getWatchLists();
            this.setState( { checked: true } );
        }
    }
    componentDidUpdate(prevProps, prevState, snapshot) {
        console.log("WatchlistDropdown componentdid update", prevProps.watchlists, this.watchlists, prevState.checked, this.state.watchlists_dirty, this.props.watch_list_name, prevProps.watch_list_name);
        if (this.state.checked === true && this.state.watchlists_dirty) {
            this.getWatchLists();
            this.setState({ checked: false });
        }
    }
    manageClick(key) {
        this.watch_list_name = key
        //console.log("click ", key);
        if (this.watch_list_name !== '' ){
            var newState = {watch_list_name: this.watch_list_name}
            
            this.props.onGetWatchListByName(newState)
        }
    }
    
    displayMenus() {
        var menuItems = this.watchlists.map(function(m){
            return <Menu.Item key={m} title={m} onClick={e=>{this.manageClick(e.key)}}>{m}</Menu.Item>
        }.bind(this));
        return menuItems;
    }
    
    getWatchLists() {
        var newState = {callback: this.displayWatchLists}
        this.props.onGetWatchLists(newState);
    }
    displayWatchLists(server_response) {
        var res = verifyServerResponse(server_response, this.action_type);
        console.log("displayWatchLists", res);
        if (isEmpty(res) === false){
                this.watchlists = res;
                this.props.onDisplayWatchLists(this.watchlists);
        }
    }
    renderDropDown =() => {
        if (this.state.showResult) {
            return (
                 <Dropdown overlay={
                                    <Menu>
                                    {this.displayMenus(this.watchlists)}
                                    </Menu>
                            }>
                    <a className="ant-dropdown-link" href="#">
                    {this.props.watch_list_name} <Icon type="down" />
                    </a>
                </Dropdown>
            );
        }else {
            return <div></div>
        }
    }
    render() {
       return this.renderDropDown();
    }
    
};
const WatchListDowndownMenu = connect(mapStateToProps, mapDispatchToProps)(WatchlistDropdown);
export {WatchListDowndownMenu};

class WatchListManage extends React.Component
{
    constructor(props) {
        super(props);
        this.renderWatchListCards = this.renderWatchListCards.bind(this);
        this.updateWatchList = this.updateWatchList.bind(this);
        this.watchlists = ["Default"]
        this.action_type = GET_WATCH_LISTS_BR;
        this.watch_list_name = "Default"
        this.state = props.state;
        console.log(props)
    }
    
    deleteWatchList = (v) => {
        //console.log("item:", v.item)
        if (v.item !== null && v.item !== undefined) {
            var newState = {stock_list: [], watch_list_name: v.item, action: "DELETE", callback: this.displayWatchLists}
            this.props.onUpdateWatchList(newState);
           
        }
       
    }
    
    
    renderWatchListCards() {
        var colWidth = 1;
        var cards = 
            <List
                grid={{ gutter: 16, column: colWidth }}
                dataSource={this.props.watchlists}
                renderItem={item => (
                  <List.Item>
                    <Card title={item} extra={<Button size="small" onClick={(e)=>{this.deleteWatchList({item})}}>Delete</Button>}>
                        <p> Number of stocks included: </p>
                        <p> Created since: </p>
                        <p> Performance since created: </p>
                    </Card>
                  </List.Item>
                )}
              />
        
        return (
            <div>
             {cards}
            </div>
        );
        
    }
       

    updateWatchList(watch_list_name, watch_list_array){
        var newState = {stock_list: watch_list_array, watch_list_name: watch_list_name,callback: this.displayWatchLists}
        this.props.onUpdateWatchList(newState)
    }
    

    render() {
        return (
         <div>
           <div>
             <WatchListPopupDiag state={this.state}/>
             <WatchListDowndownMenu state={this.state}/>
           </div>
           <br/> 
             {this.renderWatchListCards()}
          </div>
           
        );
    }
}

class WatchListBrowse extends  React.Component
{
    constructor(props) {
        super(props);
        this.state = props.state;
        //console.log("WatchlistBrowse constructor", this.action_type);
    }
    render() {
        return (
            <div>
                <div>
                    <span>
                    <WatchListDowndownMenu state={this.state}/>
                    <WatchListPopupDiag state={this.state}/>
                    </span>
                </div>
            <br/>
                <div>
                <Watchlists state={this.state} />
                </div>
            </div>
           
        );
    }
}
const WatchListManaged = connect(mapStateToProps, mapDispatchToProps)(WatchListManage);
export {WatchListManaged};

const WatchListBrowsed = connect(mapStateToProps, mapDispatchToProps) (WatchListBrowse);
export {WatchListBrowsed};