import React from 'react';
import ReactDOM from 'react-dom';
import {version} from 'antd';
import {Button} from 'antd';
import "antd/dist/antd.css"
import './index.css';
import { createStore } from 'redux';
import {Layouts} from './pages';
import {WebSocket} from 'websocket';
import {Provider} from 'react-redux';
import {store} from './redux/store/index.js';
import {Login} from './pages';
ReactDOM.render(

    <div className='App'>
      <Provider store={store} >
      <Layouts/>
      </Provider>
    </div>,
    document.getElementById('root'),

);
