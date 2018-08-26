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
      color: PropertyColor.BROWN,
      price: 60,
      houseCost: 30,
      mortgageValue: 50,
      rent: {
        '0': 2,
        '1': 10,
        '2': 30,
        '3': 90,
        '4': 160,
        'h': 250
      }
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Whitechapel Road',
      color: PropertyColor.BROWN,
      price: 60,
      houseCost: 30,
      mortgageValue: 50,
      rent: {
        '0': 4,
        '1': 20,
        '2': 60,
        '3': 180,
        '4': 360,
        'h': 450
      }
    }),
    IncomeTaxTile({}),
    RailroadTile({
      name: 'Kings Cross Station',
      price: 200,
      mortgageValue: 100,
      rent: {
        '1r': 25,
        '2r': 50,
        '3r': 100,
        '4r': 200,
      }
    }),
    PropertyTile({
      name: 'The Angel Islington',
      color: PropertyColor.LIGHT_BLUE,
      price: 100,
      houseCost: 50,
      mortgageValue: 50,
      rent: {
        '0': 6,
        '1': 30,
        '2': 90,
        '3': 270,
        '4': 400,
        'h': 550
      }
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Euston Road',
      color: PropertyColor.LIGHT_BLUE,
      price: 100,
      houseCost: 50,
      mortgageValue: 50,
      rent: {
        '0': 6,
        '1': 30,
        '2': 90,
        '3': 270,
        '4': 400,
        'h': 550
      }
    }),
    PropertyTile({
      name: 'Pentonville Road',
      color: PropertyColor.LIGHT_BLUE,
      price: 120,
      houseCost: 60,
      mortgageValue: 60,
      rent: {
        '0': 8,
        '1': 40,
        '2': 100,
        '3': 300,
        '4': 450,
        'h': 600
      }
    }),
  ],
  [
    JailTile({}),
    PropertyTile({
      name: 'Pall Mall',
      color: PropertyColor.PURPLE,
      price: 140,
      houseCost: 100,
      mortgageValue: 70,
      rent: {
        '0': 10,
        '1': 50,
        '2': 150,
        '3': 450,
        '4': 625,
        'h': 750
      }
    }),
    UtilityTile({
      name: 'Electric Company',
      price: 150,
      mortgageValue: 75
    }),
    PropertyTile({
      name: 'Whitehall',
      color: PropertyColor.PURPLE,
      price: 140,
      houseCost: 100,
      mortgageValue: 70,
      rent: {
        '0': 10,
        '1': 50,
        '2': 150,
        '3': 450,
        '4': 625,
        'h': 750
      }
    }),
    PropertyTile({
      name: 'Northumberland Avenue',
      color: PropertyColor.PURPLE,
      price: 160,
      houseCost: 100,
      mortgageValue: 80,
      rent: {
        '0': 12,
        '1': 60,
        '2': 180,
        '3': 500,
        '4': 700,
        'h': 900
      }
    }),
    RailroadTile({
      name: 'Marylebone Station',
      price: 200,
      mortgageValue: 100,
      rent: {
        '1r': 25,
        '2r': 50,
        '3r': 100,
        '4r': 200,
      }
    }),
    PropertyTile({
      name: 'Bow Street',
      color: PropertyColor.ORANGE,
      price: 180,
      houseCost: 100,
      mortgageValue: 90,
      rent: {
        '0': 14,
        '1': 70,
        '2': 200,
        '3': 550,
        '4': 750,
        'h': 950
      }
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Marlborough Street',
      color: PropertyColor.ORANGE,
      price: 180,
      houseCost: 100,
      mortgageValue: 90,
      rent: {
        '0': 14,
        '1': 70,
        '2': 200,
        '3': 550,
        '4': 750,
        'h': 950
      }
    }),
    PropertyTile({
      name: 'Vine Street',
      color: PropertyColor.ORANGE,
      price: 200,
      houseCost: 100,
      mortgageValue: 100,
      rent: {
        '0': 16,
        '1': 80,
        '2': 220,
        '3': 600,
        '4': 800,
        'h': 1000
      }
    }),
  ],
  [
    FreeParkingTile({}),
    PropertyTile({
      name: 'The Strand',
      color: PropertyColor.RED,
      price: 220,
      houseCost: 150,
      mortgageValue: 110,
      rent: {
        '0': 18,
        '1': 90,
        '2': 250,
        '3': 700,
        '4': 870,
        'h': 1050
      }
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Fleet Street',
      color: PropertyColor.RED,
      price: 220,
      houseCost: 150,
      mortgageValue: 110,
      rent: {
        '0': 18,
        '1': 90,
        '2': 250,
        '3': 700,
        '4': 870,
        'h': 1050
      }
    }),
    PropertyTile({
      name: 'Trafalgar Square',
      color: PropertyColor.RED,
      price: 240,
      houseCost: 150,
      mortgageValue: 120,
      rent: {
        '0': 20,
        '1': 100,
        '2': 300,
        '3': 750,
        '4': 925,
        'h': 1100
      }
    }),
    RailroadTile({
      name: 'Fenchurch St. Station',
      price: 200,
      mortgageValue: 100,
      rent: {
        '1r': 25,
        '2r': 50,
        '3r': 100,
        '4r': 200,
      }
    }),
    PropertyTile({
      name: 'Leicester Square',
      color: PropertyColor.YELLOW,
      price: 260,
      houseCost: 150,
      mortgageValue: 150,
      rent: {
        '0': 22,
        '1': 110,
        '2': 330,
        '3': 800,
        '4': 975,
        'h': 1150
      }
    }),
    PropertyTile({
      name: 'Coventry Street',
      color: PropertyColor.YELLOW,
      price: 260,
      houseCost: 150,
      mortgageValue: 150,
      rent: {
        '0': 22,
        '1': 110,
        '2': 330,
        '3': 800,
        '4': 975,
        'h': 1150
      }
    }),
    UtilityTile({
      name: 'Water Works',
      price: 150,
      mortgageValue: 75
    }),
    PropertyTile({
      name: 'Piccadilly',
      color: PropertyColor.YELLOW,
      price: 280,
      houseCost: 140,
      mortgageValue: 150,
      rent: {
        '0': 24,
        '1': 120,
        '2': 360,
        '3': 850,
        '4': 1025,
        'h': 1200
      }
    }),
  ],
  [
    GoToJailTile({}),
    PropertyTile({
      name: 'Regent Street',
      color: PropertyColor.GREEN,
      price: 300,
      houseCost: 150,
      mortgageValue: 200,
      rent: {
        '0': 26,
        '1': 130,
        '2': 390,
        '3': 900,
        '4': 1100,
        'h': 1275
      }
    }),
    PropertyTile({
      name: 'Oxford Street',
      color: PropertyColor.GREEN,
      price: 300,
      houseCost: 150,
      mortgageValue: 200,
      rent: {
        '0': 26,
        '1': 130,
        '2': 390,
        '3': 900,
        '4': 1100,
        'h': 1275
      }
    }),
    CommChestTile({}),
    PropertyTile({
      name: 'Bond Street',
      color: PropertyColor.GREEN,
      price: 320,
      houseCost: 160,
      mortgageValue: 200,
      rent: {
        '0': 28,
        '1': 150,
        '2': 450,
        '3': 1000,
        '4': 1200,
        'h': 1400
      }
    }),
    RailroadTile({
      name: 'Liverpool St. Station',
      price: 200,
      mortgageValue: 100,
      rent: {
        '1r': 25,
        '2r': 50,
        '3r': 100,
        '4r': 200,
      }
    }),
    ChanceTile({}),
    PropertyTile({
      name: 'Park Lane',
      color: PropertyColor.DARK_BLUE,
      price: 350,
      houseCost: 200,
      mortgageValue: 175,
      rent: {
        '0': 35,
        '1': 175,
        '2': 500,
        '3': 1100,
        '4': 1300,
        'h': 1500
      }
    }),
    SuperTaxTile({}),
    PropertyTile({
      name: 'Mayfair',
      color: PropertyColor.DARK_BLUE,
      price: 400,
      houseCost: 200,
      mortgageValue: 200,
      rent: {
        '0': 50,
        '1': 200,
        '2': 600,
        '3': 1400,
        '4': 1700,
        'h': 2000
      }
    }),
  ]
]

export default ukTileData;
