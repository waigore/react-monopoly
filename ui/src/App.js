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
        <Container fluid>
          <Switch>
            <Route exact path="/all" render={() =>
              <MainView viewType="all" />
            }/>
            <Redirect from="/" to="/all"/>
          </Switch>
        </Container>
      </div>
    );
  }
}

export default App;
