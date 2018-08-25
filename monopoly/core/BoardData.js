import {
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
} from './BoardTile';

const ukTileData = [
  [
    GoTile({}),
    PropertyTile({
      name: 'Old Kent Road',
      color: PropertyColor.BROWN
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Whitechapel Road',
      color: PropertyColor.BROWN
    }),
    IncomeTaxTile({}),
    RailroadTile({
      name: 'Kings Cross Station'
    }),
    PropertyTile({
      name: 'The Angel Islington',
      color: PropertyColor.LIGHT_BLUE
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Euston Road',
      color: PropertyColor.LIGHT_BLUE
    }),
    PropertyTile({
      name: 'Pentonville Road',
      color: PropertyColor.LIGHT_BLUE
    }),
  ],
  [
    JailTile({}),
    PropertyTile({
      name: 'Pall Mall',
      color: PropertyColor.PURPLE
    }),
    UtilityTile({
      name: 'Electric Company'
    }),
    PropertyTile({
      name: 'Whitehall',
      color: PropertyColor.PURPLE
    }),
    PropertyTile({
      name: 'Northumberland Road',
      color: PropertyColor.PURPLE
    }),
    RailroadTile({
      name: 'Marylebone Station'
    }),
    PropertyTile({
      name: 'Bow Street',
      color: PropertyColor.ORANGE
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Marlborough Street',
      color: PropertyColor.ORANGE
    }),
    PropertyTile({
      name: 'Vine Street',
      color: PropertyColor.ORANGE
    }),
  ],
  [
    FreeParkingTile({}),
    PropertyTile({
      name: 'The Strand',
      color: PropertyColor.RED
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Fleet Street',
      color: PropertyColor.RED
    }),
    PropertyTile({
      name: 'Trafalgar Square',
      color: PropertyColor.RED
    }),
    RailroadTile({
      name: 'Fenchurch St. Station'
    }),
    PropertyTile({
      name: 'Leicester Square',
      color: PropertyColor.YELLOW
    }),
    PropertyTile({
      name: 'Coventry Street',
      color: PropertyColor.YELLOW
    }),
    UtilityTile({
      name: 'Water Works'
    }),
    PropertyTile({
      name: 'Piccadilly',
      color: PropertyColor.YELLOW
    }),
  ],
  [
    GoToJailTile({}),
    PropertyTile({
      name: 'Regent Street',
      color: PropertyColor.GREEN
    }),
    PropertyTile({
      name: 'Oxford Street',
      color: PropertyColor.GREEN
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Bond Street',
      color: PropertyColor.GREEN
    }),
    RailroadTile({
      name: 'Liverpool St. Station'
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Park Lane',
      color: PropertyColor.DARK_BLUE
    }),
    SuperTaxTile({}),
    PropertyTile({
      name: 'Mayfair',
      color: PropertyColor.DARK_BLUE
    }),
  ]
]

export default ukTileData;
