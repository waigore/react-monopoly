import { Enum } from 'enumify';

class BoardTileType extends Enum {}
BoardTileType.initEnum([
  'PROPERTY',
  'RAILROAD',
  'UTILITY',
  'COMM_CHEST',
  'GO',
  'JAIL',
  'GO_TO_JAIL',
  'CHANCE',
  'INCOME_TAX',
  'SUPER_TAX',
  'FREE_PARKING'
]);

class PropertyColor extends Enum {}
PropertyColor.initEnum([
  'BROWN',
  'LIGHT_BLUE',
  'PURPLE',
  'ORANGE',
  'RED',
  'YELLOW',
  'GREEN',
  'DARK_BLUE'
]);

/*
Rent should be an object with the following fields:
- base
- house1
- house2
- house3
- house4
- hotel
*/
class BoardTile {
  constructor({name, type, color, price, rent, ownable}) {
    this.name = name;
    this.type = type;
    this.color = color;
    this.price = price;
    this.rent = rent;
    this.ownable = ownable;
  }

  isBuyable() {
    return [
      BoardTileType.PROPERTY,
      BoardTileType.RAILROAD,
      BoardTileType.UTILITY
    ].includes(this.type);
  }

  isMortgageable() {
    return [
      BoardTileType.PROPERTY,
      BoardTileType.RAILROAD,
      BoardTileType.UTILITY
    ].includes(this.type);
  }
}

function PropertyTile({...args}) {
  return new BoardTile({type: BoardTileType.PROPERTY, ownable: true, ...args});
}

function RailroadTile({...args}) {
  return new BoardTile({type: BoardTileType.RAILROAD, ownable: true, ...args});
}

function UtilityTile({...args}) {
  return new BoardTile({type: BoardTileType.UTILITY, ownable: true, ...args});
}

function CommChestTile({...args}) {
  return new BoardTile({type: BoardTileType.COMM_CHEST, ownable: false, ...args});
}

function GoTile({...args}) {
  return new BoardTile({type: BoardTileType.GO, ownable: false, ...args});
}

function JailTile({...args}) {
  return new BoardTile({type: BoardTileType.JAIL, ownable: false, ...args});
}

function GoToJailTile({...args}) {
  return new BoardTile({type: BoardTileType.GO_TO_JAIL, ownable: false, ...args});
}

function ChanceTile({...args}) {
  return new BoardTile({type: BoardTileType.CHANCE, ownable: false, ...args});
}

function IncomeTaxTile({...args}) {
  return new BoardTile({type: BoardTileType.INCOME_TAX, ownable: false, ...args});
}

function SuperTaxTile({...args}) {
  return new BoardTile({type: BoardTileType.SUPER_TAX, ownable: false, ...args});
}

function FreeParkingTile({...args}) {
  return new BoardTile({type: BoardTileType.FREE_PARKING, ownable: false, ...args});
}


export {
  BoardTileType,
  PropertyColor,
  BoardTile,
  PropertyTile,
  RailroadTile,
  UtilityTile,
  CommChestTile,
  GoTile,
  JailTile,
  GoToJailTile,
  ChanceTile,
  IncomeTaxTile,
  SuperTaxTile,
  FreeParkingTile
};
