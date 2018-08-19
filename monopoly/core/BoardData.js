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
      color: PropertColor.LIGHT_BLUE
    }),
    PropertyTile({
      name: 'Pentonville Road',
      color: PropertColor.LIGHT_BLUE
    }),
  ],
  [
    JailTile({}),
    PropertyTile({
      name: 'Pall Mall',
      color: PropertColor.PURPLE
    }),
    UtilityTile({
      name: 'Electric Company'
    }),
    PropertyTile({
      name: 'Whitehall',
      color: PropertColor.PURPLE
    }),
    PropertyTile({
      name: 'Northumberland Road',
      color: PropertColor.PURPLE
    }),
    RailroadTile({
      name: 'Marylebone Station'
    }),
    PropertyTile({
      name: 'Bow Street',
      color: PropertColor.ORANGE
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Marlborough Street',
      color: PropertColor.ORANGE
    }),
    PropertyTile({
      name: 'Vine Street',
      color: PropertColor.ORANGE
    }),
  ],
  [
    FreeParkingTile({}),
    PropertyTile({
      name: 'The Strand',
      color: PropertColor.RED
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Fleet Street',
      color: PropertColor.RED
    }),
    PropertyTile({
      name: 'Trafalgar Square',
      color: PropertColor.RED
    }),
    RailroadTile({
      name: 'Fenchurch St. Station'
    }),
    PropertyTile({
      name: 'Leicester Square',
      color: PropertColor.YELLOW
    }),
    PropertyTile({
      name: 'Coventry Street',
      color: PropertColor.YELLOW
    }),
    UtilityTile({
      name: 'Water Works'
    }),
    PropertyTile({
      name: 'Piccadilly',
      color: PropertColor.YELLOW
    }),
  ],
  [
    GoToJailTile({}),
    PropertyTile({
      name: 'Regent Street',
      color: PropertColor.GREEN
    }),
    PropertyTile({
      name: 'Oxford Street',
      color: PropertColor.GREEN
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Bond Street',
      color: PropertColor.GREEN
    }),
    RailroadTile({
      name: 'Liverpool St. Station'
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Park Lane',
      color: PropertColor.DARK_BLUE
    }),
    SuperTaxTile({}),
    PropertyTile({
      name: 'Mayfair',
      color: PropertColor.DARK_BLUE
    }),
  ]
]

export default ukTileData;
