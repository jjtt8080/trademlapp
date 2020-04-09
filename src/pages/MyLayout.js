import React, {useState} from 'react';
import 'antd/dist/antd.css';
import './MyLayout.css';
import {connect} from "react-redux";
import {Layout, Menu, Breadcrumb, Icon, Dropdown} from 'antd';
import {StockCharts} from './StockChart.js';
import {OptionChains} from './OptionChain.js'
import {OptionStatistics} from './OptionStats.js'
import {Models} from './Model.js'
import {initialState} from '../redux/constants/index.js'
import {mapStateToProps, mapDispatchToProps} from './ReduxMapping.js'
import { Typography } from 'antd';
import {WatchListManaged, WatchListBrowsed} from './WatchListManage';
const { Title } = Typography;
const  {SubMenu } = Menu;
const  {Header, Content, Sider} = Layout;
const g_MenuItem = ['Quotes', 'WatchLists', 'Markets', 'OptionStats', 'Model'];


const getIconType = function(key) {

    if (key.m === 'Stock')
        return <Icon type="stock" />
    else if (key.m === 'Option')
        return <Icon type="sliders" />
    else if (key.m === 'Quotes')
        return <Icon type="database" theme="filled" />
    else if (key.m === 'WatchLists')
        return <Icon type="experiment" theme="filled" />
    else
        return <Icon type="line-chart" />
}
const getTitle = function(m) {
    return <span> {getIconType({m})} <span>{m}</span> </span>
}
class MyLayout extends React.Component {
    constructor(props) {
        super(props);
        //this.state = {browserHistory: []};
        // This binding is necessary to make `this` work in the callback
        this.state = initialState;
        this.selectedMenu = 'Quotes.Stock';
        this.getSubMenuItems = this.getSubMenuItems.bind(this);
        this.displayMenus = this.displayMenus.bind(this);
        this.displaySubMenu = this.displaySubMenu.bind(this);
        this.displayBrowseHistory = this.displayBrowseHistory.bind(this);
        this.displayContent = this.displayContent.bind(this);
        this.setPageMenu = this.setPageMenu.bind(this);
        this.url = new URL(window.location.href);
        console.log("MyLayout constructor", this.url.searchParams.get("symbol"), this.url.searchParams.get("resolution"))
        if (this.url.searchParams.get("symbol") !== null)
            this.state.value = this.url.searchParams.get("symbol");
        if (this.url.searchParams.get("resolution") !== null)
            this.state.resolution = this.url.searchParams.get("resolution")
         console.log("MyLayout constructor", this.state)
        this.watchlists = ['Default'];
        this.state.watchlists_dirty = true;
        
    }

    getSubMenuItems(m) {
        if (m === 'Quotes')
            return   ['Stock', 'Option'];
        else if (m.startsWith('WatchLists')) {
            return ['Browse', 'Manage'];
        }else if (m === 'Markets')
            return ['S&P', 'QQQ', 'DowJones', 'IWM', 'USO'];
        else if (m === 'OptionStats')
            return ['Overall', 'Detail']
        else if (m === 'Model') 
            return ['Stock']
        else return ["Unknown"]
    }
    setPageMenu(key){
        if (this.selectedMenu !== key) {
            this.selectedMenu = key;
            this.props.onClickPage(this.selectedMenu);
        }
    }
    displayContent(m) {
        if (m === 'Quotes.Stock') {
            return <StockCharts state={this.state}/>
        } else if (m === 'Quotes.Option') {
            return <OptionChains state={this.state}/>
        } else if (m.startsWith('WatchLists.Manage')) {
            return <WatchListManaged state={this.state}/>
        }else if (m.startsWith('WatchLists.Browse')){
            return <WatchListBrowsed state={this.state}/>
        } else if (m.startsWith('Markets')){
            console.log("this state in displayContent in MyLayout", this.props.page)
            return <StockCharts state={this.state} value={this.state.value}/>
        } else if (m.startsWith('OptionStats')) {
            return <OptionStatistics state={this.state}/>
        } else if (m.startsWith('Model')) {
            return <Models state={this.state}/>
        } else { 
            console.error("strange");
            return <StockCharts state={this.state}/>
        }
    }
    displaySubMenu(m) {
        var menuItems = this.getSubMenuItems(m).map(function(s){
            return <Menu.Item key={m + '.' + s} title={getTitle(s)}>{getTitle(s)}</Menu.Item>
        }.bind(this));
        return menuItems;
    }
    displayMenus() {
        var menuItems = g_MenuItem.map(function(m){
            return <SubMenu key={m} title={getTitle(m)} > {this.displaySubMenu(m)}
            </SubMenu>
        }.bind(this));
        return menuItems;
    }
    displayBrowseHistory() {
        return (
                <Breadcrumb id="BrowserHist" style={{ margin: '8px 8px', color:"black"}}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                <Breadcrumb.Item>{this.selectedMenu}</Breadcrumb.Item>
                </Breadcrumb>
        );
    }
    showPopup(){
        
    }
    render() {
        return (
                <Layout id="LayoutHeader1">
                <Header style={{ background:"black"}}>
                <div>
                <Title level={2} style={{color:"snow"}}>
                TradeML <span><span><Icon type="home"/></span>
                <Menu mode="horizontal" style={{lineHeight:"60px", float:"right",color:"snow",background:"black", padding:"true", fontsize:"12px"}}>
                <Menu.Item key="home" onClick={e=>{this.setPageMenu(e.key)}}> home </Menu.Item>
                <Menu.Item key="settings" onClick={e=>{this.setPageMenu(e.key)}}> settings </Menu.Item>
                </Menu>
                </span>
                </Title>
                </div>

            </Header>
                <Layout>
                <Sider collapsible style={{background: 'black', padding:'false'}}>
                <Menu id="pageMenu" theme="dark"
                   mode="inline" defaultSelectedKeys={['Charts']}
                   style={{ lineHeight: '64px' }}
                   onClick={e=>{this.setPageMenu(e.key)}}>
                {this.displayMenus()}
                </Menu>

                </Sider>
                <Content name="ContentPanel1"
            style={{
                background: '#b7eb8f',
                padding: 12,
                margin: 0,
                minHeight: 400,
                fontsize: 12
            }}
                >
                {this.displayBrowseHistory()}
                <div id="content1">
                {this.displayContent(this.props.page)}
            </div>
                </Content>
                </Layout>
                </Layout>
        );
    }
}

const Layouts = connect(mapStateToProps, mapDispatchToProps)(MyLayout);

export {Layouts}
