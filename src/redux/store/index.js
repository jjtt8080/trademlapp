import { createStore } from 'redux';
import {rootReducer} from "../reducers/index";
import {CONNECT, initialState} from '../constants/index'
const store = createStore(
  rootReducer
);


export {store};
