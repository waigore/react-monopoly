import * as chai from 'chai';
var assert = chai.assert;

import { MonopolyGame } from './core/MonopolyGame';
import { BoardTileType } from './core/BoardTile';
import { Player, PlayerType } from './core/Player';
import PlayerAction from './core/PlayerAction';
import { AILevel } from './ai/PlayerAI';

function* simpleDiceRoller(arr) {
  let counter = 0;
  if (arr.length == 0) {
    return;
  }
  while (true) {
    yield arr[counter];
    counter++;
    if (counter == arr.length) {
      counter = 0;
    }
  }
}

var playerOrderArr = [
  {die1: 4, die2: 1},
  {die1: 3, die2: 1},
  {die1: 2, die2: 1},
  {die1: 1, die2: 1},
];

var players = [
  new Player({
    name: 'Player 1',
    type: PlayerType.AI,
    level: AILevel.NONSENSICAL
  }),
  new Player({
    name: 'Player 2',
    type: PlayerType.AI,
    level: AILevel.NONSENSICAL
  }),
  new Player({
    name: 'Player 3',
    type: PlayerType.AI,
    level: AILevel.NONSENSICAL
  }),
  new Player({
    name: 'Player 4',
    type: PlayerType.AI,
    level: AILevel.NONSENSICAL
  }),
];

describe('Buying property', () => {
  var roller = simpleDiceRoller([
    {die1: 1, die2: 2},
    {die1: 1, die2: 2},
    {die1: 2, die2: 3},
  ]);
  var rollFunc = () => roller.next().value;
  var game = new MonopolyGame({players, shuffleDecks: false, diceRollFunc: rollFunc});
  game.setupGame({randomizePlayerOrder: false});
  game.startGame();

  it('should advance to Whitechapel Road and buy it', () => {
    let phaseOutput = game.runTurns();
    assert.equal(phaseOutput.player.info.name, 'Player 1');
    let player1 = game.getPlayerByName('Player 1');
    let whitechapel = game.getTileByCode('brown_02');
    let assets = game.getPlayerAssets(player1.id);

    assert.equal(player1.onTileId, whitechapel.id);
    assert(assets.properties.some(p => p.info.code == 'brown_02'));

  });

  it('should advance to Whitechapel Road and pay rent', () => {
    let phaseOutput = game.runTurns();
    assert.equal(phaseOutput.player.info.name, 'Player 2');
    let player2 = phaseOutput.player;
    let whitechapel = game.getTileByCode('brown_02');

    assert.equal(player2.onTileId, whitechapel.id);
    assert.equal(player2.money, 1500-whitechapel.info.rent['0']);
  });

  it('should advance to King\'s Cross Station and buy property', () => {
    let phaseOutput = game.runTurns();
    assert.equal(phaseOutput.player.info.name, 'Player 3');
    let player3 = phaseOutput.player;
    let kingsCross = game.getTileByCode('rr_01');
    let assets = game.getPlayerAssets(player3.id);

    assert.equal(player3.onTileId, kingsCross.id);
    assert(assets.properties.some(p => p.info.code == 'rr_01'));
  });
});


describe('Going to jail', () => {
  var roller = simpleDiceRoller([
    {die1: 15, die2: 15},
    {die1: 2, die2: 1},
    {die1: 3, die2: 2},
    {die1: 1, die2: 5},
    //turn 2
    {die1: 2, die2: 3},
    {die1: 2, die2: 3},
    {die1: 2, die2: 3},
    {die1: 2, die2: 3},
  ]);
  var rollFunc = () => roller.next().value;
  var game = new MonopolyGame({players, shuffleDecks: false, diceRollFunc: rollFunc});
  game.setupGame({randomizePlayerOrder: false});
  game.startGame();

  it('should advance to Go to Jail and be thrown in jail', () => {
    let phaseOutput = game.runTurns();
    let player = phaseOutput.player;
    let tile = game.getTileById(player.onTileId);

    assert.equal(player.info.name, 'Player 1');
    assert.equal(tile.info.type, BoardTileType.JAIL);
    assert.equal(player.inJail, true);
    assert.equal(player.inJailTurns, 0);
  });

  it('should not be able to get out of jail by rolling non-doubles', () => {
    let phaseOutput = game.runTurns(4);
    let player = phaseOutput.player;

    assert.equal(player.info.name, 'Player 1');
    assert.equal(player.inJailTurns, 1);
  });


  it('should be able to get out of jail by rolling doubles', () => {
    let phaseOutput = game.runTurns(4);
    let player = phaseOutput.player;

    assert.equal(player.info.name, 'Player 1');
    assert.equal(player.inJail, false);
    assert.equal(player.inJailTurns, 0);
  });
});

describe('Drawing Community Chest cards', () => {
  var roller = simpleDiceRoller([
    {die1: 2, die2: 0}, //not possible in real monopoly!
  ]);
  var rollFunc = () => roller.next().value;
  var game = new MonopolyGame({players, shuffleDecks: false, diceRollFunc: rollFunc});
  game.setupGame({randomizePlayerOrder: false});
  game.startGame();

  it('should draw an Advance to Go card and advance to Go', () => {
    let phaseOutput = game.runTurns();
    let player = phaseOutput.player;
    let tile = game.getTileById(player.onTileId);

    assert.equal(player.info.name, 'Player 1');
    assert.equal(tile.info.type, BoardTileType.GO);
    assert.equal(player.money, 1700);
    assert.equal(game.commChestCardDeck[game.commChestCardDeck.length-1].info.code, 'adv_to_go');
  });

  it('should draw a Bank error card and gain $200', () => {
    let phaseOutput = game.runTurns();
    let player = phaseOutput.player;
    let tile = game.getTileById(player.onTileId);

    assert.equal(player.info.name, 'Player 2');
    assert.equal(tile.info.type, BoardTileType.COMM_CHEST);
    assert.equal(player.money, 1700);
    assert.equal(game.commChestCardDeck[game.commChestCardDeck.length-1].info.code, 'bank_error');
  });

  it('should draw a Get out of jail free card', () => {
    game.drawCommChestCard(null);
    game.drawCommChestCard(null);

    assert.equal(game.commChestCardDeck[0].info.code, 'get_out_of_jail');

    let phaseOutput = game.runTurns();
    let player = phaseOutput.player;
    let tile = game.getTileById(player.onTileId);

    assert.equal(player.info.name, 'Player 3');
    assert.equal(tile.info.type, BoardTileType.COMM_CHEST);
    assert.equal(player.inJail, false);
    assert.equal(player.cards.some(c => c.info.code == 'get_out_of_jail'), true);
  })

  it('should draw a Go to Jail card and go to jail', () => {

    assert.equal(game.commChestCardDeck[0].info.code, 'go_to_jail');

    let phaseOutput = game.runTurns();
    let player = phaseOutput.player;
    let tile = game.getTileById(player.onTileId);

    assert.equal(player.info.name, 'Player 4');
    assert.equal(tile.info.type, BoardTileType.JAIL);
    assert.equal(player.inJail, true);
    assert.equal(player.inJailTurns, 0);
  })
})
