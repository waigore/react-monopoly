import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import MonopolyBoard from '../components/game/MonopolyBoard';

class GameView extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
      <MonopolyBoard/>
      </div>
    );
  }
}

export default GameView;
