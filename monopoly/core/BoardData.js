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
    GoTile({
      code: 'go'
    }),
    PropertyTile({
      name: 'Old Kent Road',
      code: 'brown_01',
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
    CommChestTile({
      code: 'commchest_01'
    }),
    PropertyTile({
      name: 'Whitechapel Road',
      color: PropertyColor.BROWN,
      code: 'brown_02',
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
    IncomeTaxTile({
      code: 'incometax_01'
    }),
    RailroadTile({
      name: 'Kings Cross Station',
      code: 'rr_01',
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
      code: 'lightblue_01',
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
    ChanceTile({
      code: 'chance_01'
    }),
    PropertyTile({
      name: 'Euston Road',
      code: 'lightblue_02',
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
      code: 'lightblue_03',
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
    JailTile({
      code: 'jail'
    }),
    PropertyTile({
      name: 'Pall Mall',
      code: 'purple_01',
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
      code: 'util_01',
      price: 150,
      mortgageValue: 75
    }),
    PropertyTile({
      name: 'Whitehall',
      code: 'purple_02',
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
      code: 'purple_03',
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
      code: 'rr_02',
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
      code: 'orange_01',
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
    CommChestTile({
      code: 'commchest_02'
    }),
    PropertyTile({
      name: 'Marlborough Street',
      code: 'orange_02',
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
      code: 'orange_03',
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
    FreeParkingTile({
      code: 'freeparking'
    }),
    PropertyTile({
      name: 'The Strand',
      code: 'red_01',
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
    ChanceTile({
      code: 'chance_02'
    }),
    PropertyTile({
      name: 'Fleet Street',
      code: 'red_02',
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
      code: 'red_03',
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
      code: 'rr_03',
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
      code: 'yellow_01',
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
      code: 'yellow_02',
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
      code: 'util_02',
      price: 150,
      mortgageValue: 75
    }),
    PropertyTile({
      name: 'Piccadilly',
      code: 'yellow_03',
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
    GoToJailTile({
      code: 'gotojail'
    }),
    PropertyTile({
      name: 'Regent Street',
      code: 'green_01',
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
      code: 'green_02',
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
    CommChestTile({
      code: 'commchest_03'
    }),
    PropertyTile({
      name: 'Bond Street',
      code: 'green_03',
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
      code: 'rr_04',
      price: 200,
      mortgageValue: 100,
      rent: {
        '1r': 25,
        '2r': 50,
        '3r': 100,
        '4r': 200,
      }
    }),
    ChanceTile({
      code: 'chance_03'
    }),
    PropertyTile({
      name: 'Park Lane',
      code: 'darkblue_01',
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
    SuperTaxTile({
      code: 'supertax_01'
    }),
    PropertyTile({
      name: 'Mayfair',
      code: 'darkblue_02',
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
