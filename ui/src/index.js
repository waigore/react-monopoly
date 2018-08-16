import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {BrowserRouter, Route} from 'react-router-dom'
import {createStore, applyMiddleware} from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import {createLogger} from 'redux-logger';
//import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import App from './App';
import appReducer from './reducers';


const logger = createLogger();
const store = createStore(
    appReducer,
    applyMiddleware(thunk, promise, logger)
);


ReactDOM.render(
<Provider store={store}>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</Provider>, document.getElementById('root'));
