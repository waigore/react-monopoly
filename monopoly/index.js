import { MonopolyGame, GameEventType } from './core/MonopolyGame';
import { Player, PlayerType } from './core/Player';
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

var players = [
  new Player({
    name: 'Player 1',
    type: PlayerType.HUMAN
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
    type: PlayerType.HUMAN,
    level: AILevel.NONSENSICAL
  }),
];

var game = new MonopolyGame({players});
game.allPlayerNames = function() {
  return this.ingamePlayers.map(p => p.info.name);
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
  console.log('Turn started for player', player.info.name);
});
game.addEventListener(GameEventType.TURN_ENDED, (args) => {
  let {player} = args;
  console.log('Turn ended for player', player.info.name);
});
game.addEventListener(GameEventType.PHASE_STARTED, (args) => {
  let {player, phase} = args;
  console.log('Phase', phase.name, 'started for player', player.info.name);
});
game.addEventListener(GameEventType.PLAYER_ADVANCE, (args) => {
  let {player, tile} = args;
  console.log('Player', player.info.name, 'advances to tile', tile.info.name);
});
game.addEventListener(GameEventType.PLAYER_ACTION, (args) => {
  let {player, action} = args;
  if (action == PlayerAction.BUY) {
    let {tile} = args;
    console.log('Player', player.info.name, 'buys', tile.info.name);
  }
});

game.setupGame();
game.startGame();

var phaseOutput;

phaseOutput = game.run();
//console.log(phaseOutput); //player2, pre-roll

phaseOutput = game.run();
console.log(phaseOutput);
