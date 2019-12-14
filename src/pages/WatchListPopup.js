import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { Input, Dropdown, Menu, Popover, Card, List } from 'antd';
import { CustomizedForm } from './CustomizedForm'
import { mapStateToProps, mapDispatchToProps, isEmpty, verifyServerResponse } from './ReduxMapping.js'
import "antd/dist/antd.css";
import { Watchlists } from './Watchlist' 
import { Button, Icon} from 'antd';

class WatchListPopup extends React.Component
{
    constructor(props) {
        super(props);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.handleSaveWatchList = this.handleSaveWatchList.bind(this);
        this.renderShowWatchList = this.renderShowWatchList.bind(this);
        this.state = {
            visible: false,
            fields: {
             watch_list_name: {
                value: '',
              },
            },
        }
    }
    handleSaveWatchList() {
        var watch_list_name = this.state.fields.watch_list_name.value;
        if ( watch_list_name !== undefined) {
            //console.log("add a new watch list named " + watch_list_name, this.props.watch_list); 

            if (this.props.stock_list !== []) {
                this.updateWatchList(watch_list_name, this.props.stock_list)
            }
            this.hide();
        }
        
    }
    handleFormChange = changedFields => {
        //console.log("changeFields to", changedFields)
        this.setState(({ fields }) => ({
          fields: { ...fields, ...changedFields },
        }));
    }
    hide () {    
        if (this.state.visible === true) {
            this.setState({
              visible: false,
            });
        }
    };
    show(v){
        if (v !== undefined) {
            this.setState({visible: v})
            this.setState({watch_list_name: ''});
            var newState = {watch_list_name: ''};
            //Use a empty watch list name to get a fresh start
            this.props.onGetWatchListByName(newState);
            //console.log("show a new watch list window")
        }
    };
    updateWatchList(watch_list_name, watch_list_array){
        var newState = {stock_list: watch_list_array, watch_list_name: watch_list_name}
        this.props.onUpdateWatchList(newState)
    }
    renderShowWatchList() {
        const { fields } = this.state;
        //console.log("popup list", this.props.page);
        if (this.props.page === "WatchLists.Manage")
        {
            return (
                <div>
                    <CustomizedForm  {...fields} onChange={this.handleFormChange} state={this.state}/>
                    <Watchlists id="search_watch_list" state={this.state}/>
                </div>
            );
        }else {
            return <div>
                <CustomizedForm  {...fields} onChange={this.handleFormChange} state={this.state}/>
                </div> 
        }
                    
    }
    renderButtonText = () => {
        if (this.props.page === "WatchLists.Manage")
            return "Add New Watchlist"
        else
            return "Save"
    }
    render() {
        
        return (
            <Popover state={this.state} scrollable={true}
                    content={
                        <div>
                            {this.renderShowWatchList()}
                            <Button onClick={this.handleSaveWatchList}>Ok</Button>
                            <Button onClick={this.hide}>Cancel</Button>
                        </div>
                    }
                    title="Type the name of the watch list"
                    trigger="click"
                    visible={this.state.visible}
                    onVisibleChange={e=>{this.show(e)}}
                >
            <Button type="primary" icon="plus" onClick={e=>{this.show(e)}} style={{float:"right"}}>{this.renderButtonText()}</Button>
            </Popover>
        );
    }
    
    
}
const WatchListPopupDiag = connect(mapStateToProps, mapDispatchToProps)(WatchListPopup);
export {WatchListPopupDiag};