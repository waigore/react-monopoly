import React, { Component } from 'react';
import {Switch, Route, Redirect, withRouter} from 'react-router-dom';
import './App.css';

import SimpleAppBar from './components/SimpleAppBar';
import MainView from './views/MainView';
import GameView from './views/GameView';

class App extends Component {

  componentDidMount() {
    document.title = "Monopoly!";
  }

  render() {
    return (
      <div>
        <SimpleAppBar />
        <div style={{padding: "0.5em"}} />
          <Switch>
            <Route exact path="/all" render={() =>
              <MainView />
            }/>
            <Route exact path="/game" render={() =>
              <GameView />
            }/>
            <Redirect from="/" to="/all"/>
          </Switch>
      </div>
    );
  }
}

export default App;
