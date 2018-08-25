import { Enum } from 'enumify';
import EventEmitter from 'wolfy87-eventemitter';

import tileData from './BoardData';
import { BoardTileType } from './BoardTile';
import { PlayerType, Player } from './Player';
import PlayerAction from './PlayerAction';
import TurnPhase from './TurnPhase';
import { PlayerAI } from '../ai/PlayerAI';

class InvalidBoardConfigError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'InvalidBoardConfigError';
  }
}

class InvalidGameStateError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'InvalidGameStateError';
  }
}

class InvalidMoveError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'InvalidMoveError';
  }
}

class GameMessageType extends Enum {}
GameMessageType.initEnum([
  'PHASE_DONE',
  'HUMAN_INPUT_REQUIRED',
  'AI_ACTION_PROCESSED'
]);

class GameEventType extends Enum {}
GameEventType.initEnum([
  'GAME_READY',
  'GAME_STARTED',
  'GAME_ENDED',
  'TURN_STARTED',
  'TURN_ENDED',
  'PHASE_STARTED',
  'PHASE_ENDED',
  'PLAYER_ACTION',
  'PLAYER_ADVANCE',
  'PLAYER_IN_JAIL',
  'PLAYER_OUT_OF_JAIL',
  'PLAYER_PAID_RENT'
]);

class GameState extends Enum {}
GameState.initEnum([
  'INIT',
  'READY',
  'RUNNING',
  'OVER'
]);

const MAX_DOUBLE_ROLLS = 3;
const MAX_JAIL_TURNS = 3;
const JAIL_FINE = 50;

class MonopolyGame {
  constructor({players}) {
    this.board = [];
    this.ingamePlayers = [];
    this.currentPlayerIndex = -1;
    this.gameState = GameState.INIT;
    this.ee = new EventEmitter();

    tileData.forEach((list, listIndex) => {
      list.forEach((tile, tileIndex) => {
        this.board.push({
          id: listIndex + "-" + tileIndex,
          pos: { list: listIndex, seq: tileIndex },
          info: tile,
          mortgaged: false,
          houses: 0,
          ownedPlayerId: null
        });
      });
    });

    players.forEach((player, playerIndex) => {
      this.ingamePlayers.push({
        id: playerIndex,
        info: player,
        ai: player.type == PlayerType.AI ? new PlayerAI({level: player.level}) : null,
        onTileId: null,
        rollSequence: 0,
        inJail: false,
        inJailTurns: 0,
        getOutOfJailCard: false,
        money: 1500
      })
    });

    if (this.board[0].info.type != BoardTileType.GO) {
      throw new InvalidBoardConfigError('The first tile is not GO!');
    }
  }

  addEventListener(eventName, callback) {
    this.ee.addListener(eventName, callback);
  }

  removeEventListener(eventName, callback) {
    this.ee.removeEventListener(eventName, callback);
  }

  emitEvent(eventName, args) {
    this.ee.emitEvent(eventName, args);
  }

  emitGameReady() {
    this.emitEvent(GameEventType.GAME_READY, null);
  }

  emitGameStarted() {
    this.emitEvent(GameEventType.GAME_STARTED, null);
  }

  emitTurnStarted(playerId) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.TURN_STARTED, [{player}]);
  }

  emitTurnEnded(playerId) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.TURN_ENDED, [{player}]);
  }

  emitPhaseStarted(playerId, phase) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PHASE_STARTED, [{player, phase}]);
  }

  emitPhaseEnded(playerId, phase) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PHASE_ENDED, [{player, phase}]);
  }

  emitPlayerAction(playerId, action, args) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PLAYER_ACTION, [{player, action, ...args}]);
  }

  emitPlayerAdvance(playerId, tileId) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);
    this.emitEvent(GameEventType.PLAYER_ADVANCE, [{player, tile}]);
  }

  /*
  'PLAYER_IN_JAIL',
  'PLAYER_OUT_OF_JAIL',
  'PLAYER_PAID_RENT'
  */
  emitPlayerInJail(playerId, turns) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PLAYER_IN_JAIL, [{player, turns}]);
  }

  emitPlayerOutOfJail(playerId, method) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PLAYER_OUT_OF_JAIL, [{player, method}]);
  }

  emitPlayerPaidRent(playerId, tileId) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTilebyId(tileId);
    this.emitEvent(GameEventType.PLAYER_PAID_RENT, [{player, tile}]);
  }

  rollDice() {
    let die1 = Math.floor(Math.random()*6)+1;
    let die2 = Math.floor(Math.random()*6)+1;

    return {die1, die2};
  }

  roll(playerId) {
    let player = this.getPlayerById(playerId);
    let {die1, die2} = this.rollDice();
    if (player.inJail)
    {
      if (player.inJailTurns < MAX_JAIL_TURNS)
      {
        if (die1 == die2)
        {
          //player is out of jail! yay!
          player.inJail = false;
          player.inJailTurns = 0;
          this.emitPlayerOutOfJail(player.id, 'double roll');
        }
        else
        {
          //player stays in jail. Boo...
          player.inJailTurns++;
          this.emitPlayerInJail(player.id, player.inJailTurns);
        }
      }

      if (player.inJailTurns >= MAX_JAIL_TURNS)
      {
        //player has been in jail for at least 3 turns. Make them pay a fine
        //and force them out
        player.money -= JAIL_FINE;
        player.inJail = false;
        player.inJailTurns = 0;
        this.emitPlayerOutOfJail(player.id, MAX_JAIL_TURNS + ' turns up');
      }
    }

    if (!player.inJail)
    {
      this.advancePlayer(player.id, die1+die2);

      let newTile = this.getTileById(player.onTileId);
      if (newTile.ownedPlayerId == null && newTile.info.isBuyable())
      {
        return {
          tileId: newTile.id,
          possibleActions: [PlayerAction.BUY, PlayerAction.AUCTION]
        };
      }
      else if (newTile.ownedPlayerId != null && newTile.ownedPlayerId != player.id)
      {
        //player owes rent
        let rent = newTile.info.calculateRent(newTile.houses);
        let ownedPlayer = this.getPlayerById(newTile.ownedPlayerId);
        if (player.money >= rent)
        {
          player.money -= rent;
          ownedPlayer.money += rent;

          return {
            tileId: newTile.id,
            possibleActions: [PlayerAction.NEXT_PHASE]
          }
        }
        else
        {
          //NOTE: the player should be allowed to trade away their properties
          //to pay rent, but this is a little too complex to take on now...
          return {
            tileId: newTile.id,
            possibleActions: [PlayerAction.FORFEIT]
          }
        }
      }
    }
    else
    {
      return {
        tileId: newTile.id,
        possibleActions: [PlayerAction.NEXT_PHASE]
      }
    }
  }

  mortgage(playerId, tileId) {
    let tile = this.getTileById(tileId);
    if (!tile.info.isMortgageable())
    {
      throw new InvalidMoveError(tile.info.name + " cannot mortgage: is of type " + tile.info.type + "!");
    }

    let player = this.getPlayerById(playerId);
    let ownedPlayer = this.getPlayerById(tile.ownedPlayerId);
    if (playerId != tile.ownedPlayerId)
    {
      throw new InvalidMoveError(tile.info.name + ": player " + player.info.name + " does not own tile!");
    }

    if (tile.mortgaged) {
      throw new InvalidMoveError(tile.info.name + " already mortgaged!")
    }

    if (tile.houses > 0 || tile.hotels > 0) {
      throw new InvalidMoveError(tile.info.name + " cannot mortgage: is developed!");
    }

    let mortgage = tile.info.mortgage;
    player.money += mortgage;
    tile.mortgaged = true;
  }

  unmortgage(playerId, tileId) {
    let tile = this.getTileById(tileId);
    if (!tile.info.isMortgageable())
    {
      throw new InvalidMoveError(tile.info.name + " cannot mortgage: is of type " + tile.info.type + "!");
    }

    let player = this.getPlayerById(playerId);
    let ownedPlayer = this.getPlayerById(tile.ownedPlayerId);
    if (playerId != tile.ownedPlayerId)
    {
      throw new InvalidMoveError(tile.info.name + ": player " + player.info.name + " does not own tile!");
    }

    if (!tile.mortgaged) {
      throw new InvalidMoveError(tile.info.name + " is not mortgaged!")
    }

    let mortgage = tile.info.mortgage;
    if (player.money < mortgage) {
      throw new InvalidMoveError(player.info.name + " does not have enough money to unmortgage tile!");
    }

    player.money -= mortgage;
    tile.mortgaged = false;
  }

  buy(playerId, tileId) {
    let tile = this.getTileById(tileId);
    let player = this.getPlayerById(playerId);
    if (!tile.info.isBuyable())
    {
      throw new InvalidMoveError(tile.info.name + " cannot mortgage: is of type " + tile.info.type + "!");
    }

    if (tile.ownedPlayerId != null) {
      throw new InvalidMoveError(tile.info.name + " is owned by player " + this.getPlayerById(tile.ownedPlayerId).info.name + "!");
    }

    let price = tile.info.price;
    if (player.money < price)
    {
      throw new InvalidMoveError(player.info.name + " does not have enough money for tile!");
    }

    player.money -= price;
    tile.houses = 0;
    tile.hotels = 0;
    tile.ownedPlayerId = playerId;
  }

  advancePlayer(playerId, pos) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(player.onTileId);
    let tileIndex = this.getTileIndex(player.onTileId);

    if (tileIndex < this.board.length - 1) {
      tileIndex = tileIndex + pos;
    }
    else {
      tileIndex = tileIndex + pos - this.board.length;
    }
    player.onTileId = this.board[tileIndex].id;
    //console.log('new tile id for player:', player.info.name, ' ', player.onTileId);

    this.emitPlayerAdvance(player.id, player.onTileId);

    let newTile = this.getTileById(player.onTileId);
    if (newTile.info.type == BoardTileType.GO_TO_JAIL) {
      this.gotoJail(playerId);
    }
  }

  advancePlayerToTile(playerId, tileId) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);

    player.onTileId = this.getTileIndex(tile.id);
  }

  goToJail(playerId) {
    let player = this.getPlayerById(playerId);
    player.inJail = true;
    player.inJailTurns = 0;
    let jailTile = this.findTileByType(BoardTileType.JAIL);
    this.advancePlayerToTile(playerId, jailTile.id);
    this.emitPlayerInJail(player.id, player.inJailTurns);
  }

  getTileIndex(tileId) {
    this.board.forEach((tile, tileIndex) => {
      if (tile.id == tileId) {
        return tileIndex;
      }
    });
    return -1;
  }

  getTileById(tileId) {
    return this.board.filter(t => t.id == tileId)[0];
  }

  findTileByType(tileType) {
    return this.board.filter(t => t.info.type == tileType)[0];
  }

  getPlayerById(playerId) {
    return this.ingamePlayers.filter(p => p.id == playerId)[0];
  }

  getPlayerAssets(playerId) {
    return {
      properties: this.board.filter(t => t.ownedPlayerId == playerId),
      money: this.getPlayerById(playerId).money
    }
  }

  /*
  * trade(p1Id, p2Id, p1Offer, p2Offer) {
    let player1 = getPlayerById(p1Id);
    let player2 = getPlayerById(p2Id);

    let tradeFinished = false;
    let currentParty = player1, counterParty = player2;
    let currentPartyOffer, counterPartyOffer;

    while (!tradeFinished) {
      if (currentParty.id == player1.id) {
        currentParty = player2;
        counterParty = player1;
      }
      else {
        currentParty = player1;
        counterParty = player2;
      }

      if (currentParty.type == PlayerType.AI) {
        let {action, newP1Offer, newP2Offer} =
          currentParty.ai.considerOffer(this, currentParty, counterParty, p1Offer, p2Offer);

        yield {action, p1Offer: newP1Offer, p2Offer: newP2Offer};
      } else {
        yield {
          humanPlayerInput: 'TRADE_OFFER',
          currentParty,

        };
      }
    }
  }
  */

  checkGetOutOfJailNeeded(playerId) {
    let player = this.getPlayerById(playerId);

    if (!player.inJail || player.inJailTurns < MAX_JAIL_TURNS) {
      return;
    }

    //player has been in jail for at least 3 turns. Make them pay a fine
    //and force them out
    player.money -= JAIL_FINE;
    player.inJail = false;
    player.inJailTurns = 0;
  }

  setupGame() {
    this.determinePlayerOrder();

    this.currentPlayerIndex = 0;
    this.gameState = GameState.READY;
    this.emitGameReady();
  }

  determinePlayerOrder() {
    this.ingamePlayers.forEach(player => {
      let {die1, die2} = this.rollDice();
      player.lastRoll = {die1, die2};
      player.rollSequence = die1 + die2;
      player.onTileId = this.board[0].id;
    });

    this.ingamePlayers.sort((p1, p2) => -(p1.rollSequence-p2.rollSequence));
  }

  startGame() {
    if (this.gameState != GameState.READY) {
      throw new InvalidGameStateError('Game is not ready to be started yet!');
    }

    this.gameState = GameState.RUNNING;
    this.currentPhase = TurnPhase.PRE_ROLL;
    this.playerTurnData = {
      hasRolled: false,
      doubleRolls: 0
    };
    this.emitGameStarted();

    let currentPlayerId = this.ingamePlayers[this.currentPlayerIndex].id;
    this.emitTurnStarted(currentPlayerId);
    this.emitPhaseStarted(currentPlayerId, this.currentPhase);
  }

  possibleActionsForPhase(phase) {
    switch (phase) {
      case TurnPhase.PRE_ROLL:
        return this.preRollPossibleActions();
        break;
      case TurnPhase.ROLL:
        return this.rollPossibleActions();
        break;
    }
  }

  preRollPossibleActions() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = [
      PlayerAction.NEXT_PHASE,
      PlayerAction.MORTGAGE,
      PlayerAction.UNMORTGAGE,
      PlayerAction.DEVELOP
    ];
    if (player.inJail) {
      if (player.money >= JAIL_FINE) {
          possibleActions.push(PlayerAction.PAY_JAIL_FINE);
      }
      if (player.getOutOfJailCard) {
          possibleActions.push(PlayerAction.USE_JAIL_CARD);
      }
    }
    return possibleActions;
  }

  rollPossibleActions() {
    let possibleActions = [
      PlayerAction.ROLL
    ];

    return possibleActions;
  }

  processPhase() {
    let player = this.ingamePlayers[this.currentPlayerIndex];

    /*
    switch (this.currentPhase) {
      case TurnPhase.PRE_ROLL:
        this.checkGetOutOfJailNeeded(player.id);
        break;
    }*/

    let possibleActions = this.possibleActionsForPhase(this.currentPhase);

    if (player.info.type == PlayerType.HUMAN) {
      return {
        phase: this.currentPhase,
        message: GameMessageType.HUMAN_INPUT_REQUIRED,
        player,
        possibleActions
      }
    }
    else {
      let aiActions = player.ai.considerAction(this, player, this.currentPhase, possibleActions);
      aiActions.forEach(action => this.handleAIAction(player.id, action));
      return {
        phase: this.currentPhase,
        message: GameMessageType.PHASE_DONE,
        player
      }
    }
  }

  handleAIAction(playerId, action) {
    let player = this.getPlayerById(playerId);
    let playerAction = action.action;
    let possibleActions = this.possibleActionsForPhase(this.currentPhase);
    if (!possibleActions.includes(playerAction)) {
      throw new InvalidMoveError('Move ' + playerAction.name + ' is not possible for phase ' + this.currentPhase + '!');
    }
    let tileId;

    switch (playerAction) {
      case PlayerAction.MORTGAGE:
        tileId = input.tileId;
        this.mortgage(player.id, tileId);
        break;
      case PlayerAction.UNMORTGAGE:
        tileId = input.tileId;
        this.unmortgage(player.id, tileId);
        break;
      case PlayerAction.BUY:
        tileId = input.tileId;
        this.buy(player.id, tileId);
        break;
      case PlayerAction.ROLL:
        this.roll(player.id);
        break;
      case PlayerAction.NEXT_PHASE:
        break;
    }

    return {
      phase: this.currentPhase,
      message: GameMessageType.AI_ACTION_PROCESSED,
      player
    }
  }

  handleHumanInput(playerId, input) {
    let player = this.getPlayerById(playerId);
    let action = input.action;
    let possibleActions = this.possibleActionsForPhase(this.currentPhase);
    if (!possibleActions.includes(action)) {
      throw new InvalidMoveError('Move ' + action + ' is not possible for phase ' + this.currentPhase + '!');
    }
    let furtherInputRequired = true;
    let tileId;

    switch (action) {
      case PlayerAction.MORTGAGE:
        tileId = input.tileId;
        this.mortgage(player.id, tileId);
        break;
      case PlayerAction.UNMORTGAGE:
        tileId = input.tileId;
        this.unmortgage(player.id, tileId);
        break;
      case PlayerAction.BUY:
        tileId = input.tileId;
        this.buy(player.id, tileId);
        break;
      case PlayerAction.ROLL:
        this.roll(player.id);
        break;
      case PlayerAction.NEXT_PHASE:
        furtherInputRequired = false;
        break;
    }

    if (furtherInputRequired) {
      return {
        phase: this.currentPhase,
        message: GameMessageType.HUMAN_INPUT_REQUIRED,
        player,
        possibleActions
      }
    }
    else {
      return {
        phase: this.currentPhase,
        message: GameMessageType.PHASE_DONE,
        player
      }
    }
  }

  run(humanInput = null) {
    let phaseOutput;
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let nextPhase = this.currentPhase;

    phaseOutput = humanInput ?
      this.handleHumanInput(playerId, humanInput) :
      this.processPhase();

    if (phaseOutput.message == GameMessageType.PHASE_DONE) {
      switch (this.currentPhase) {
        case TurnPhase.PRE_ROLL:
          nextPhase = TurnPhase.ROLL;
        break;
        case TurnPhase.ROLL:
          nextPhase = TurnPhase.POST_ROLL;
        break;
        case TurnPhase.POST_ROLL:
          nextPhase = null;
        break;
      }

      let oldPhase = this.currentPhase;
      this.emitPhaseEnded(player.id, oldPhase);

      if (nextPhase == null) {
        this.emitTurnEnded(player.id);
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.ingamePlayers.length) {
          this.currentPlayerIndex = 0;
        }

        this.currentPhase = TurnPhase.PRE_ROLL;
        phaseOutput.nextPhase = TurnPhase.PRE_ROLL;
        let newPlayer = this.ingamePlayers[this.currentPlayerIndex];
        this.emitTurnStarted(newPlayer.id);
      }
      else {
        this.currentPhase = nextPhase;
        phaseOutput.nextPhase = nextPhase;
      }

      player = this.ingamePlayers[this.currentPlayerIndex];
      this.emitPhaseStarted(player.id, this.currentPhase);
    }

    return phaseOutput;
  }
}


export {
  InvalidMoveError,
  InvalidGameStateError,
  InvalidBoardConfigError,
  GameMessageType,
  GameEventType,
  GameState,
  TurnPhase,
  MonopolyGame
}
