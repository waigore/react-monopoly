import {combineReducers} from 'redux';


const SERVER_ENDPOINT = 'http://localhost:5002';


const app = function(state = {}, action) {
  switch (action.type) {
    default:
      return state;
  }
}

const appReducer = combineReducers({
  app: app
});

export default appReducer;
