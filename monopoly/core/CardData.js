import {
  CardType,
  MonopolyCard,
  chanceCard,
  commChestCard
} from './MonopolyCard';
import {
  BoardTileType
} from './BoardTile';

function advanceToAndPassGo(game, player, code) {
  let advanceToTile = game.getTileByCode(code);
  let currentTile = game.getTileById(player.onTileId);
  let tileDistance = game.calcTileDistance(currentTile.id, advanceToTile.id);

  game.advancePlayer(player.id, tileDistance);

  if (game.isRentDue(player.id, advanceToTile.id)) {
    game.payRent(player.id, advanceToTile.id);
  }
}

function advanceToClosestTileType(game, player, tileType, rentMultiplier) {
  let tiles = game.board.filter(t=> t.info.type == tileType);
  let closest = tiles.reduce((r, t) =>
                    game.calcTileDistance(player.onTileId, r.id) >
                    game.calcTileDistance(player.onTileId, t.id) ? t : r);

  game.advancePlayerToTile(player.id, closest.id);

  if (game.isRentDue(player.id, closest.id)) {
    game.payRent(player.id, closest.id, rentMultiplier);
  }
}

const ukChanceCardData = [
  chanceCard({
    name: 'Advance to GO',
    code: 'adv_to_go',
    description: 'Advance to GO. Collect $200.',
    effect: (game, player) => {
      let tile = game.findTileByType(BoardTileType.GO);

      game.advancePlayerToTile(player.id, tile.id);
      game.passGo(player.id);
    }
  }),
  chanceCard({
    name: 'Advance to Trafalgar Square',
    code: 'adv_to_red_03',
    description: 'Advance to Trafalgar Square. If you pass GO, collect $200.',
    effect: (game, player) => {
      advanceToAndPassGo(game, player, 'red_03');
    }
  }),
  chanceCard({
    name: 'Advance to Pall Mall',
    code: 'adv_to_purple_01',
    description: 'Advance to Pall Mall. If you pass GO, collect $200.',
    effect: (game, player) => {
      advanceToAndPassGo(game, player, 'purple_01');
    }
  }),
  chanceCard({
    name: 'Advance to utility',
    code: 'adv_to_util',
    description: 'Advance to nearest utility. If unowned, you may buy it ' +
      'from the bank. If owned, throw dice and pay owner a total ten times ' +
      'the amount thrown.',
    effect: (game, player) => {
      advanceToClosestTileType(game, player, BoardTileType.UTILITY, 2);
    },
  }),
  chanceCard({
    name: 'Advance to railroad',
    code: 'adv_to_rr',
    description: 'Advance to nearest railroad and pay owner twice the rental to which ' +
      'he/she is otherwise entitled. If railroad is unowned, you may buy it from the Bank.',
    effect: (game, player) => {
      advanceToClosestTileType(game, player, BoardTileType.RAILROAD, 2);
    },
  }),
  chanceCard({
    name: 'Advance to railroad',
    code: 'adv_to_rr',
    description: 'Advance to nearest railroad and pay owner twice the rental to which ' +
      'he/she is otherwise entitled. If railroad is unowned, you may buy it from the Bank.',
    effect: (game, player) => {
      advanceToClosestTileType(game, player, BoardTileType.RAILROAD, 2);
    },
  }),
  chanceCard({
    name: 'Dividend payout',
    code: 'rcv_dividend',
    description: 'Bank owes you dividend of $50.',
    effect: (game, player) => {
      player.money += 50;
    }
  }),
  chanceCard({
    name: 'Get out of jail free',
    code: 'get_out_of_jail',
    description: 'Get out of jail free. This card may be kept until needed, or traded/sold.',
    effect: (game, player) => {
      player.getOutOfJailCard = true;
    },
  }),
  chanceCard({
    name: 'Go back 3 spaces',
    code: 'go_back_3_spaces',
    description: 'Go back 3 spaces. Do not collect $200 if you pass go.',
    effect: (game, player) => {
      game.advancePlayer(player.id, -3);

      let currentTile = game.getTileById(player.onTileId);
      if (game.isRentDue(player.id, currentTile.id)) {
        game.payRent(player.id, currentTile.id);
      }
    }
  }),
  chanceCard({
    name: 'Go to jail',
    code: 'go_to_jail',
    description: 'Go to jail. Go directly to jail. Do not pass Go, do not collect $200.',
    effect: (game, player) => {
      game.goToJail(player.id);
    }
  }),
  chanceCard({
    name: 'House repairs',
    code: 'repairs',
    description: 'Make general repairs on all your property. For each house pay $25. For each ' +
      'hotel pay $100.',
    effect: (game, player) => {
      let playerProperties = game.getPlayerAssets(player.id).properties;
      let repairCost = playerProperties.reduce((acc, p) => acc + p.hotels*100 + p.houses*25, 0);

      player.money -= repairCost;
    }
  }),
  chanceCard({
    name: 'Poor tax',
    code: 'poor_tax',
    description: 'Pay Poor Tax of $15.',
    effect: (game, player) => {
      player.money -= 15;
    }
  }),
  chanceCard({
    name: 'Trip to King\'s Cross Station',
    code: 'rr_trip',
    description: 'Take a trip to King\'s Cross Station. If you pass Go, collect $200.',
    effect: (game, player) => {
      advanceToAndPassGo(game, player, 'rr_01');
    }
  }),
  chanceCard({
    name: 'A walk on Mayfair',
    code: 'mayfair_walk',
    description: 'Take a walk on Mayfair. Advance token to Mayfair.',
    effect: (game, player) => {
      advanceToAndPassGo(game, player, 'darkblue_02');
    }
  }),
  chanceCard({
    name: 'Chairman of the board',
    code: 'elected_chairman',
    description: 'You have been elected Chairman of the Board. Pay each player $50.',
    effect: (game, player) => {
      let otherPlayers = this.inGamePlayers.filter(p => p.id != player.id);
      otherPlayers.forEach(p => {
        p.money += 50;
        player.money -= 50;
      });
    }
  }),
  chanceCard({
    name: 'Building loan matures',
    code: 'loan_matures',
    description: 'Your building loan matures. Collect $150.',
    effect: (game, player) => {
      player.money += 150;
    }
  }),
  chanceCard({
    name: 'Crossword competition',
    code: 'crossword',
    description: 'You won a crossword competition. Collect $100.',
    effect: (game, player) => {
      player.money += 100;
    }
  })
];

const ukCommChestCardData = [
  commChestCard({
    name: 'Advance to GO',
    code: 'adv_to_go',
    description: 'Advance to GO. Collect $200.',
    effect: (game, player) => {
      let tile = game.findTileByType(BoardTileType.GO);

      game.advancePlayerToTile(player.id, tile.id);
      game.passGo(player.id);
    }
  }),
  commChestCard({
    name: 'Bank error',
    code: 'bank_error',
    description: 'Bank error in your favour. Collect $200.',
    effect: (game, player) => {
      player.money += 200;
    }
  }),
  commChestCard({
    name: 'Doctor\'s fees',
    code: 'doctors_fees',
    description: 'Doctor\'s fees. Pay $50.',
    effect: (game, player) => {
      player.money -= 50;
    }
  }),
  commChestCard({
    name: 'Stock sale',
    code: 'stock_sale',
    description: 'From sale of stock you gain $50.',
    effect: (game, player) => {
      player.money += 50;
    }
  }),
  commChestCard({
    name: 'Get out of jail free',
    code: 'get_out_of_jail',
    description: 'Get out of jail free. This card may be kept until needed, or traded/sold.',
    effect: (game, player) => {
    },
  }),
  commChestCard({
    name: 'Go to jail',
    code: 'go_to_jail',
    description: 'Go to jail. Go directly to jail. Do not pass Go, do not collect $200.',
    effect: (game, player) => {
      game.goToJail(player.id);
    }
  }),
  commChestCard({
    name: 'Grand Opera Night',
    code: 'opera_night',
    description: 'Grand Opera Night. Collect $50 from every player for opening night seats.',
    effect: (game, player) => {
      let otherPlayers = this.inGamePlayers.filter(p => p.id != player.id);
      otherPlayers.forEach(p => {
        p.money -= 50;
        player.money += 50;
      });
    }
  }),
  commChestCard({
    name: 'Holiday fund matures',
    code: 'holiday_fund_matures',
    description: 'Holiday fund matures. Collect $100.',
    effect: (game, player) => {
      player.money += 100;
    }
  }),
  commChestCard({
    name: 'Income tax refund',
    code: 'income_tax_refund',
    description: 'Income tax refund. Collect $20.',
    effect: (game, player) => {
      player.money += 20;
    }
  }),
  commChestCard({
    name: 'Birthday',
    code: 'birthday',
    description: 'Birthday. Collect $10 from every player.',
    effect: (game, player) => {
      let otherPlayers = this.inGamePlayers.filter(p => p.id != player.id);
      otherPlayers.forEach(p => {
        p.money -= 10;
        player.money += 10;
      });
    }
  }),
  commChestCard({
    name: 'Life insurance matures',
    code: 'life_insurance_matures',
    description: 'Life insurance matures. Collect $100.',
    effect: (game, player) => {
      player.money += 100;
    }
  }),
  commChestCard({
    name: 'Hospital fees',
    code: 'hospital_fees',
    description: 'Doctor\'s fees. Pay $50.',
    effect: (game, player) => {
      player.money -= 50;
    }
  }),
  commChestCard({
    name: 'School fees',
    code: 'school_fees',
    description: 'School fees. Pay $50.',
    effect: (game, player) => {
      player.money -= 50;
    }
  }),
  commChestCard({
    name: 'Consultancy fee',
    code: 'consultancy_fee',
    description: 'Receive $25 consultancy fee.',
    effect: (game, player) => {
      player.money += 25;
    }
  }),
  commChestCard({
    name: 'Street repairs',
    code: 'street_repairs',
    description: 'You are assessed for street repairs. For each house pay $40. For each ' +
      'hotel pay $115.',
    effect: (game, player) => {
      let playerProperties = game.getPlayerAssets(player.id).properties;
      let repairCost = playerProperties.reduce((acc, p) => acc + p.hotels*115 + p.houses*40, 0);

      player.money -= repairCost;
    }
  }),
];

export {
  ukChanceCardData,
  ukCommChestCardData
};
