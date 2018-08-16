import React, { Component } from 'react';
import {Switch, Route, Redirect, withRouter} from 'react-router-dom';
import './App.css';

//import AppNavbar from './components/AppNavbar';
import MainView from './views/MainView';

class App extends Component {

  componentDidMount() {
    document.title = "Monopoly!";
  }

  render() {
    return (
      <div>
        <div style={{padding: "0.5em"}} />
          <Switch>
            <Route exact path="/all" render={() =>
              <MainView viewType="all" />
            }/>
            <Redirect from="/" to="/all"/>
          </Switch>
      </div>
    );
  }
}

export default App;
