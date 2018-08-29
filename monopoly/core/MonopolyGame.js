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

class InvalidOperationError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'InvalidOperationError';
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
  'PLAYER_PAID_RENT',
  'PLAYER_PAID_TAX',
  'PLAYER_PASSED_GO'
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
const INCOME_TAX_AMT = 200;
const SUPER_TAX_PCT = 10;

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
          hotels: 0,
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

  emitPlayerAdvance(playerId, pos, tileId) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);
    this.emitEvent(GameEventType.PLAYER_ADVANCE, [{player, pos, tile}]);
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

  emitPlayerPaidRent(playerId, tileId, rent) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);
    this.emitEvent(GameEventType.PLAYER_PAID_RENT, [{player, tile, rent}]);
  }

  emitPlayerPaidTax(playerId, taxType, amt) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PLAYER_PAID_TAX, [{player, taxType, amt}]);
  }

  emitPlayerPassedGo(playerId) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PLAYER_PASSED_GO, [{player}]);
  }

  rollDice() {
    let die1 = Math.floor(Math.random()*6)+1;
    let die2 = Math.floor(Math.random()*6)+1;

    return {die1, die2};
  }

  roll(playerId) {
    let player = this.getPlayerById(playerId);
    let {die1, die2} = this.rollDice();
    if (die1 == die2) {
      this.turnPlayerData.doubleRolls++;
    }
    if (player.inJail)
    {
      if (player.inJailTurns < MAX_JAIL_TURNS)
      {
        if (die1 == die2)
        {
          //player is out of jail! yay!
          player.inJail = false;
          player.inJailTurns = 0;
          this.turnPlayerData.releasedFromJail = true;
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

      if (newTile.info.type == BoardTileType.GO_TO_JAIL) {
        this.goToJail(playerId);
      }
      else if (newTile.info.type == BoardTileType.INCOME_TAX) {
        this.deductIncomeTax(playerId);
      }
      else if (newTile.info.isBuyable()) {
        if (newTile.ownedPlayerId != null && newTile.ownedPlayerId != player.id)
        {
          //player owes rent
          let rent = this.calculateRent(newTile.id);
          let ownedPlayer = this.getPlayerById(newTile.ownedPlayerId);
          if (player.money >= rent)
          {
            player.money -= rent;
            ownedPlayer.money += rent;
            this.emitPlayerPaidRent(player.id, newTile.id, rent);
          }
          else
          {
            this.turnPlayerData.outstandingRent = rent;
          }
        }
      }
    }

    this.turnPlayerData.hasRolled = true;
  }

  deductIncomeTax(playerId) {
    let player = this.getPlayerById(playerId);
    player.money -= INCOME_TAX_AMT;
    this.emitPlayerPaidTax(player.id, 'Income', INCOME_TAX_AMT);
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

    this.emitPlayerAction(player.id, PlayerAction.BUY, {tile, price});

  }

  advancePlayer(playerId, pos) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(player.onTileId);
    let tileIndex = this.getTileIndex(player.onTileId);

    let newTileIndex = tileIndex + pos;

    if (newTileIndex >= this.board.length) {
      newTileIndex = newTileIndex - this.board.length;
      this.passGo(playerId);
    }
    player.onTileId = this.board[newTileIndex].id;
    /*console.log('new tile id for player:', player.info.name, ' ', player.onTileId,
        ' tileIndex:', this.board[tileIndex],
        ' newTileIndex:', this.board[newTileIndex]);*/

    this.emitPlayerAdvance(player.id, pos, player.onTileId);
  }

  advancePlayerToTile(playerId, tileId) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);

    player.onTileId = this.getTileById(tile.id).id;
  }

  passGo(playerId) {
    let player = this.getPlayerById(playerId);
    player.money += 200;

    this.emitPlayerPassedGo(player.id);
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

  getTileIndex(tileId) {
    let tileIndex = null;
    this.board.forEach((t, index) => {
      if (t.id == tileId) {
        tileIndex = index;
      }
    });
    if (tileIndex == null) {
      throw new InvalidOperationError("No such tile id:" + tileId);
    }
    return tileIndex;
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

  calculateRent(tileId, diceRoll) {
    let tile = this.getTileById(tileId);
    if (tile.ownedPlayerId == null) {
      throw new InvalidOperationError("Tile " + tile.info.name + " is not owned by anyone!");
    }

    let ownedPlayer = this.getPlayerById(tile.ownedPlayerId);
    let ownedPlayerAssets = this.getPlayerAssets(ownedPlayer.id);

    if (tile.info.type == BoardTileType.PROPERTY) {
      let sameColorTiles = this.board.filter(t => t.info.color == tile.info.color);
      let ownedSameColorCount = ownedPlayerAssets.properties
            .filter(t => t.info.type == BoardTileType.PROPERTY
                        && t.info.color == tile.info.color).length;
      if (tile.hotels > 0) {
        return tile.info.rent['h'];
      }
      else if (tile.houses == 0 && sameColorTiles.length == ownedSameColorCount) {
        return tile.info.rent['0']*2;
      }
      else {
        return tile.info.rent[tile.houses+''];
      }
    }
    else if (tile.info.type == BoardTileType.RAILROAD) {
      let ownedRailroadCount = ownedPlayerAssets.properties
                .filter(t => t.info.type == BoardTileType.RAILROAD)
                .length;
      if (ownedRailroadCount <= 0 || ownedRailroadCount > 4) {
        throw new InvalidBoardConfigError("Player has an invalid number of owned railroads! =" + ownedRailroadCount);
      }
      return tile.info.rent[ownedRailroadCount+'r'];
    }
    else if (tile.info.type == BoardTileType.UTILITY) {
      let ownedUtilityCount = ownedPlayerAssets.properties
                .filter(t => t.info.type == BoardTileType.UTILITY)
                .length;
      let {die1, die2} = diceRoll;
      if (ownedUtilityCount <= 0 || ownedUtilityCount > 2) {
        throw new InvalidBoardConfigError("Player has an invalid number of owned utilities! =" + ownedUtilityCount);
      }
      return ownedUtilityCount == 1 ? (die1 + die2) * 4 : (die1 + die2) * 10;
    }
    else {
      throw new InvalidOperationError("Cannot obtain rent on non-buyable tile!" + tile.info.name);
    }


    return 10;
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

  initTurnData() {
    this.turnPlayerData = {
      releasedFromJail: false,
      hasRolled: false,
      doubleRolls: 0,
      outstandingRent: 0
    };
  }

  startGame() {
    if (this.gameState != GameState.READY) {
      throw new InvalidGameStateError('Game is not ready to be started yet!');
    }

    this.gameState = GameState.RUNNING;
    this.currentPhase = TurnPhase.PRE_ROLL;
    this.initTurnData();
    this.emitGameStarted();

    let currentPlayerId = this.ingamePlayers[this.currentPlayerIndex].id;
    this.emitTurnStarted(currentPlayerId);
    this.emitPhaseStarted(currentPlayerId, this.currentPhase);
  }

  possibleActionsForPhase(phase) {
    let possibleActions;
    switch (phase) {
      case TurnPhase.PRE_ROLL:
        possibleActions = this.preRollPossibleActions();
        break;
      case TurnPhase.ROLL:
        possibleActions = this.rollPossibleActions();
        break;
      case TurnPhase.BUY:
        possibleActions = this.buyPossibleActions();
        break;
      case TurnPhase.POST_ROLL:
        possibleActions = this.postRollPossibleActions();
        break;
    }

    return possibleActions;
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
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = [];
    if (
        !this.turnPlayerData.hasRolled
        || (this.turnPlayerData.doubleRolls > 0
            && this.turnPlayerData.doubleRolls < MAX_DOUBLE_ROLLS
            && !this.turnPlayerData.releasedFromJail)
      )
    {
      possibleActions.push(PlayerAction.ROLL);
    }
    else {
      possibleActions.push(PlayerAction.NEXT_PHASE);
    }

    return possibleActions;
  }

  buyPossibleActions() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let tile = this.getTileById(player.onTileId);
    let possibleActions = [];

    if (!player.inJail && tile.info.isBuyable() && tile.ownedPlayerId == null) {
      if (player.money > tile.info.price) {
        possibleActions.push(PlayerAction.BUY);
      }
      possibleActions.push(PlayerAction.AUCTION);
    }
    else {
      possibleActions.push(PlayerAction.NEXT_PHASE);
    }

    return possibleActions;
  }

  postRollPossibleActions() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = [
      PlayerAction.NEXT_PHASE,
      PlayerAction.MORTGAGE,
      PlayerAction.UNMORTGAGE,
      PlayerAction.DEVELOP
    ];

    return possibleActions;
  }

  processPhase() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = this.possibleActionsForPhase(this.currentPhase);
    //console.log('process phase', possibleActions);
    if (possibleActions.every((a) => a == TurnPhase.NEXT_PHASE)) {
      return {
        phase: this.currentPhase,
        message: GameMessageType.PHASE_DONE,
        player
      }
    }

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
      if (aiActions.length == 0) {
        throw new InvalidMoveError('AI must make a move!');
      }
      if (aiActions.map(a => a.action).some(act => !possibleActions.includes(act))) {
        throw new InvalidMoveError('AI made an illegal move!');
      }
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
        tileId = action.tileId;
        this.mortgage(player.id, tileId);
        break;
      case PlayerAction.UNMORTGAGE:
        tileId = action.tileId;
        this.unmortgage(player.id, tileId);
        break;
      case PlayerAction.BUY:
        tileId = action.tileId;
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
          nextPhase = TurnPhase.BUY;
          break;
        case TurnPhase.BUY:
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
        this.initTurnData();
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
