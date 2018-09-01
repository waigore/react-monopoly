import * as chai from 'chai';
var assert = chai.assert;

import { MonopolyGame } from './core/MonopolyGame';
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
  var roller = simpleDiceRoller(
    playerOrderArr.concat([
      {die1: 1, die2: 2},
      {die1: 1, die2: 2},
    ])
  );
  var rollFunc = () => roller.next().value;
  var game = new MonopolyGame({players, shuffleDecks: false, diceRollFunc: rollFunc});
  game.setupGame();
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
});
