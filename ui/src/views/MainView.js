import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Button from '@material-ui/core/Button';

import SimpleAppBar from '../components/SimpleAppBar';

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
        <SimpleAppBar />
        <Button variant="raised" color="primary">
          Hello World
        </Button>
      </div>
    );
  }
}

export default MainView;
