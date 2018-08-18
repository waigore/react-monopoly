import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';

import Button from '@material-ui/core/Button';


const GameViewLink = props => <Link to="/game" {...props} />

class MainView extends Component {
  constructor(props) {
    super(props)

    this.state = {

    }
  }

  componentWillMount() {
  }

  componentWillReceiveProps(nextProps) {
  }

  render() {
    return (
      <div>
        <Button variant="raised" color="primary" component={GameViewLink}>
          New Game
        </Button>
      </div>
    );
  }
}

export default MainView;
