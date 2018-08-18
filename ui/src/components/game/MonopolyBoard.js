import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

class ColoredRect extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      color: 'green'
    }
  }
  handleClick = () => {
    this.setState({
      color: Konva.Util.getRandomColor()
    });
  };
  render() {
    return (
      <Rect
        x={20}
        y={20}
        width={50}
        height={50}
        fill={this.state.color}
        shadowBlur={5}
        onClick={this.handleClick}
      />
    );
  }
}

class MonopolyBoard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Stage width={700} height={700}>
        <Layer>
          <Text text="Try click on rect" />
          <ColoredRect />
        </Layer>
      </Stage>
    );
  }
}

export default MonopolyBoard;
