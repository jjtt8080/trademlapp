
import {CONNECT, ADD_STOCK, REMOVE_STOCK, DISPLAY_RESPONSE, CLICK_PAGE} from '../redux/constants/index';



const  mapStateToProps = state => {
  return {
    stock_list: state.stock_list,
    value: state.value,
    isConnected: state.isConnected,
    socket: state.socket,
    response: state.response,
    page: state.page
  };
};

function addStock(state) {

  return {
    type: ADD_STOCK,
    payload: state
  }
}
function displayResponse(state) {
  return {
    type: DISPLAY_RESPONSE,
    payload: state
  }
}
function clickPage(pageID) {
  return {
    type: CLICK_PAGE,
    payload : pageID
  }
}
const mapDispatchToProps = dispatch => {
    return {
      onAddStock : (state)=> dispatch(addStock(state)),
      onRemoveStock: () => dispatch({type: REMOVE_STOCK}),
      onDisplayResponse: (state) =>dispatch(displayResponse(state)),
      onClickPage: (pageID) => dispatch(clickPage(pageID))
    };
};

export {mapStateToProps}
export {mapDispatchToProps}
