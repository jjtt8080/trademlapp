import React from 'react';
import {Button} from 'antd';
import "antd/dist/antd.css";
import {connect} from "react-redux";
import {Layout, Menu, Breadcrumb, Icon } from 'antd';
import {StockCharts} from './StockChart.js';
import {Watchlists} from './Watchlist.js'
import {store} from '../redux/store/index.js';
import {initialState, CONNECT} from '../redux/constants/index.js'
import {Provider} from 'react-redux';
import {mapStateToProps, mapDispatchToProps} from './ReduxMapping.js'
const  {SubMenu } = Menu;
const  {Header, Content, Sider} = Layout;
const g_MenuItem = ['Charts', 'WatchLists', 'Markets']
class MyLayout extends React.Component {

  constructor(props) {
    super(props);
    //this.state = {browserHistory: []};
    // This binding is necessary to make `this` work in the callback
    this.state = initialState;
    store.dispatch({
      type: CONNECT,
      state : {
        stock_list: Array(),
        value: 'initial_value',
        isConnected: false,
        socket: null}
    })
    this.selectedMenu = 'Charts';
    this.displayMenus = this.displayMenus.bind(this);
    this.displayContent = this.displayContent.bind(this);
    this.setPageMenu = this.setPageMenu.bind(this);
  }
  setPageMenu(key){
    console.log("setPageMenu", key)
    if (this.selectedMenu !== key) {
      this.selectedMenu = key;
      this.props.onClickPage(this.selectedMenu);
    }
  }
  displayContent(m) {
    console.log("current key", m)
    if (m === 'Charts') {
      return <StockCharts state={this.state}/>
    } else if (m === 'WatchLists') {
      console.log("selected watch list", this.state)
      return <Watchlists  state={this.state}/>
    } else {
      return <StockCharts state={this.state}/>
    }
  }

  displayMenus(m) {
    var menuItems = g_MenuItem.map(function(m){
      return <Menu.Item key={m}> {m} </Menu.Item>
    }.bind(this));
    return menuItems;
  }

  render() {
    return (

      <Layout id="LayoutHeader1">
      <Header className="header">
        <div className="logo" />
        <Menu id="pageMenu"
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['Charts']}
          style={{ lineHeight: '64px' }}
          onClick={e=>{this.setPageMenu(e.key)}}
        >
        {this.displayMenus()}
        </Menu>
      </Header>
      <Layout id="Sider1">
      <Sider width={200} style={{ background: '#fff' }}>
      <Menu
        mode="inline"
        theme="light"
        defaultSelectedKeys={['1']}
        defaultOpenKeys={['Fidelity']}
        style={{ height: '100%', borderRight: 0 }}
      >
      <SubMenu
        key="P-Equity"
        title={
          <span>
            <Icon type="user" />
            Equity
          </span>
        }
      >
        <Menu.Item key="1">Fidelity</Menu.Item>
        <Menu.Item key="2">Interactive Broker</Menu.Item>
        <Menu.Item key="3">TDAmeritrade</Menu.Item>
        <Menu.Item key="4">Vanguard</Menu.Item>
        <Menu.Item key="5">Etrade</Menu.Item>
      </SubMenu>
      <SubMenu
        key="P-forex"
        title={
          <span>
            <Icon type="laptop" />
            Forex
          </span>
        }
      >
        <Menu.Item key="6">IG.com</Menu.Item>
        <Menu.Item key="7">TD Ameritrade</Menu.Item>
        <Menu.Item key="8">Forex.com</Menu.Item>
      </SubMenu>
      <SubMenu
        key="P-Bond"
        title={
          <span>
            <Icon type="notification" />
            Bond
          </span>
        }
      >
      <Menu.Item key="9">401K</Menu.Item>
      <Menu.Item key="10">Vanguard</Menu.Item>
      </SubMenu>
      </Menu>
      </Sider>
      <Layout style={{ padding: '0 24px 24px' }}>
        <Breadcrumb id="BrowserHist" style={{ margin: '16px 0' }}>
          <Breadcrumb.Item>Home</Breadcrumb.Item>
          <Breadcrumb.Item>List</Breadcrumb.Item>
          <Breadcrumb.Item>App</Breadcrumb.Item>
        </Breadcrumb>
        <Content name="ContentPanel1"
          style={{
            background: '#b7eb8f',
            padding: 12,
            margin: 0,
            minHeight: 350,
            fontsize: 12
          }}
        >
        <div id="content1">
        {this.displayContent(this.props.page)}
        </div>
        </Content>
      </Layout>
      </Layout>
     </Layout>
  );
  }
}

const Layouts = connect(mapStateToProps, mapDispatchToProps)(MyLayout);
console.log(Layouts)
//stockCharts.propTypes = StateObj;
export {Layouts}
