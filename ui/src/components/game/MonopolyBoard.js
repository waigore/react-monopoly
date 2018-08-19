import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Stage, Layer, Rect, Text } from 'react-konva';
import Konva from 'konva';

class ColoredRect extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      color: 'white',
      stroke: 'black'
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
        x={this.props.x}
        y={this.props.y}
        width={this.props.width}
        height={this.props.height}
        fill={this.state.color}
        stroke={this.state.stroke}
        onClick={this.handleClick}
        rotation={this.props.rotation}
      />
    );
  }
}

class MonopolyBoard extends Component {
  properties = {
    bottomRight: {
      type: 'go'
    },
    bottom: [
      {
        color: 'brown',
        name: 'Old Kent Road'
      },
      {
        type: 'special',
        name: 'Community Chest'
      },
      {
        color: 'brown',
        name: 'Whitechapel Road'
      },
      {
        type: 'special',
        name: 'Income Tax'
      },
      {
        type: 'railroad',
        name: 'King\'s Cross Station'
      },
      {
        color: 'lightblue',
        name: 'The Angel Islington'
      },
      {
        type: 'chance',
        name: 'Chance'
      },
      {
        color: 'lightblue',
        name: 'Euston Road'
      },
      {
        color: 'lightblue',
        name: 'Pentonville Road'
      },
    ],
    bottomLeft: {
      type: 'jail'
    },
    left: [
      {
        color: 'pink',
        name: 'Pall Mall'
      },
      {
        type: 'utility',
        name: 'Electric Company'
      },
      {
        color: 'pink',
        name: 'Whitehall'
      },
      {
        color: 'pink',
        name: 'Northumberland Avenue'
      },
      {
        type: 'railroad',
        name: 'Marylebone Station'
      },
      {
        color: 'orange',
        name: 'Bow Street'
      },
      {
        type: 'special',
        name: 'Community Chest'
      },
      {
        color: 'orange',
        name: 'Marlborough Street'
      },
      {
        color: 'orange',
        name: 'Vine Street'
      },
    ],
    topLeft: {
      type: 'freeparking'
    },
    top: [
      {
        color: 'red',
        name: 'The Strand'
      },
      {
        type: 'chance',
        name: 'Chance'
      },
      {
        color: 'red',
        name: 'Fleet Street'
      },
      {
        color: 'red',
        name: 'Trafalgar Square'
      },
      {
        type: 'railroad',
        name: 'Fenchurch Street Station'
      },
      {
        color: 'yellow',
        name: 'Leicester Square'
      },
      {
        color: 'yellow',
        name: 'Coventry Street'
      },
      {
        type: 'utility',
        name: 'Water Works'
      },
      {
        color: 'yellow',
        name: 'Piccadilly'
      },
    ],
    topright: {
      type: 'gotojail'
    },
    right: [
      {
        color: 'green',
        name: 'Regent Street'
      },
      {
        color: 'green',
        name: 'Oxford Street'
      },
      {
        type: 'special',
        name: 'Community Chest'
      },
      {
        color: 'green',
        name: 'Bond Street'
      },
      {
        type: 'railroad',
        name: 'Liverpool St. Station'
      },
      {
        type: 'chance',
        name: 'Chance'
      },
      {
        color: 'darkblue',
        name: 'Park Lane'
      },
      {
        type: 'special',
        name: 'Super Tax'
      },
      {
        color: 'darkblue',
        name: 'Mayfair'
      },
    ]
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Stage width={292} height={292}>
        <Layer>
          <ColoredRect x={38} y={38} width={38} height={38} rotation={-180} />
          <ColoredRect x={38+24} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*2} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*3} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*4} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*5} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*6} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*7} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*8} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={38+24*9} y={38} width={24} height={38} rotation={-180} />
          <ColoredRect x={254} y={38} width={38} height={38} rotation={-90} />
          <ColoredRect x={254} y={62} width={24} height={38} rotation={-90} />
        </Layer>
      </Stage>
    );
  }
}

export default MonopolyBoard;
