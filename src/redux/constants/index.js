import {CONNECT, ADD_STOCK, REMOVE_STOCK, DISPLAY_RESPONSE, CLICK_PAGE}  from './action-types.js';
import {PropTypes} from 'prop-types'
export {CONNECT}
export {ADD_STOCK}
export {REMOVE_STOCK}
export {DISPLAY_RESPONSE}
export {CLICK_PAGE}
const StateObj = {
  state:
    PropTypes.shape({
      stock_list: PropTypes.array,
      value: PropTypes.string.isRequired,
      isConnected: PropTypes.bool.isRequired,
      socket: PropTypes.object,
      response: '',
      resolution: '',
      page: ''
    }).isRequired
};
var initialState = {
    stock_list: Array(),
    value: '',
    isConnected: false,
    socket: null,
    response: '',
    resolution: 'D',
    page: 'Charts'
}
export {StateObj}
export {initialState}
