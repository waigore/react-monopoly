import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import Button from '@material-ui/core/Button';

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
        <Button variant="raised" color="primary">
          Hello World
        </Button>
      </div>
    );
  }
}

export default MainView;
