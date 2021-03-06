import { MonopolyGame, GameEventType } from './core/MonopolyGame';
import { Player, PlayerType } from './core/Player';
import PlayerAction from './core/PlayerAction';
import { AILevel } from './ai/PlayerAI';

Math.seed = function(s) {
    return function() {
        s = Math.sin(s) * 10000;
        return s - Math.floor(s);
    };
};
var random1 = Math.seed(42);
var random2 = Math.seed(random1());
Math.random = Math.seed(random2());

var phaseCounter;
function phaseLog(...args) {
  if (phaseCounter > 0) {
    console.log(...args);
  }
}



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

var game = new MonopolyGame({players});
game.allPlayerNames = function() {
  return this.ingamePlayers.map(p => p.info.name);
}
game.allPlayerStates = function() {
  return this.ingamePlayers.map(p => {
    return {
      name: p.info.name,
      money: p.money,
      properties: this.getPlayerAssets(p.id).properties.map(t => t.info.name)
    }
  });
}
game.addEventListener(GameEventType.GAME_READY, () => {
  console.log('Game ready!');
});
game.addEventListener(GameEventType.GAME_STARTED, () => {
  console.log('Game started, gamestate = ', game.gameState);
  console.log('Players:', game.allPlayerNames());
});
game.addEventListener(GameEventType.TURN_STARTED, (args) => {
  let {player} = args;
  console.log('<=====Turn started for player', player.info.name, ', on tile', game.getTileById(player.onTileId).info.name);
});
game.addEventListener(GameEventType.TURN_ENDED, (args) => {
  let {player} = args;
  console.log('Turn ended for player', player.info.name);
  console.log('Players:', game.allPlayerStates());
});
game.addEventListener(GameEventType.PHASE_STARTED, (args) => {
  let {player, phase} = args;
  phaseLog('Phase', phase.name, 'started for player', player.info.name);
});
game.addEventListener(GameEventType.PLAYER_ADVANCE, (args) => {
  let {player, pos, tile} = args;
  phaseLog('Player', player.info.name, 'advances by', pos, 'pos to tile', tile.info.name);
});
game.addEventListener(GameEventType.PLAYER_ACTION, (args) => {
  let {player, action} = args;
  if (action == PlayerAction.BUY) {
    let {tile, price} = args;
    phaseLog('Player', player.info.name, 'buys', tile.info.name, 'for $', price);
  }
  else if (action == PlayerAction.DEVELOP) {
    let {tile} = args;
    phaseLog('Player', player.info.name, 'develops', tile.info.name, '! Dev is now houses:', tile.houses, 'hotels:', tile.hotels);
  }
  else if (action == PlayerAction.SELL) {
    let {tile} = args;
    phaseLog('Player', player.info.name, 'sells dev on', tile.info.name, '! Dev is now houses:', tile.houses, 'hotels:', tile.hotels);
  }
});
game.addEventListener(GameEventType.PLAYER_PAID_RENT, (args) => {
  let {player, tile, rent} = args;
  phaseLog('Player', player.info.name, 'paid rent $', rent, ' for a night\'s stay at', tile.info.name);
});
game.addEventListener(GameEventType.PLAYER_PAID_TAX, (args) => {
  let {player, taxType, amt} = args;
  phaseLog('Player', player.info.name, 'paid', taxType, 'Tax amounting to $', amt);
});
game.addEventListener(GameEventType.PLAYER_IN_JAIL, (args) => {
  let {player, turns} = args;
  phaseLog('Player', player.info.name, 'is in jail! This is the', turns, 'turn since they have been there.');
});
game.addEventListener(GameEventType.PLAYER_OUT_OF_JAIL, (args) => {
  let {player, method} = args;
  phaseLog('Player', player.info.name, 'is out of jail! Yay!');
});
game.addEventListener(GameEventType.PLAYER_PASSED_GO, (args) => {
  let {player} = args;
  phaseLog('Player', player.info.name, 'passed go!');
});
game.addEventListener(GameEventType.PLAYER_DREW_CARD, (args) => {
  let {player, card} = args;
  phaseLog('Player', player.info.name, 'drew card:', card.info.description);
})

game.setupGame({randomizePlayerOrder: false});
game.startGame();

var phaseOutput;

[...Array(61).keys()].forEach(x => {
  console.log(x);
  phaseCounter = x;
  phaseOutput = game.run();
})
//console.log(game.getPlayerById('1'));
//console.log(phaseOutput);
