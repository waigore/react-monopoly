import { Enum } from 'enumify';

import tileData from './BoardData';
import { GameMessage } from './GameMessage';
import { BoardTileType } from './BoardTile';
import { PlayerType, Player } from './Player';
import { PlayerAction } from './PlayerAction';

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

class GameState extends Enum {}
GameState.initEnum([
  'INIT',
  'READY',
  'RUNNING',
  'OVER'
])

class TurnPhase extends Enum {}
TurnPhase.initEnum([
  'PRE_ROLL',
  'ROLL',
  'POST_ROLL',
  'AUCTION'
])

const MAX_DOUBLE_ROLLS = 3;
const MAX_JAIL_TURNS = 3;
const JAIL_FINE = 50;

export class MonopolyGame {
  constructor({players}) {
    this.board = [];
    this.ingamePlayers = [];
    this.currentPlayerIndex = -1;
    this.gameState = GameState.INIT;

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
      ingamePlayers.push({
        id: playerIndex,
        info: player,
        ai: player.type == PlayerType.AI ? new PlayerAI(level) : null,
        onTileId: null,
        rollSequence: 0,
        inJail: false,
        inJailTurns: 0,
        getOutOfJailCard: false
        money: 1500
      })
    });

    if (this.board[0].info.type != BoardTileType.GO) {
      throw new InvalidBoardConfigError('The first tile is not GO!');
    }
  }

  rollDice() {
    let die1 = Math.floor(Math.random()*6)+1;
    let die2 = Math.floor(Math.random()*6)+1;

    return {die1, die2};
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
    let tile = this.getTilebyId(player.onTileId);
    let tileIndex = this.getTileIndex(player.onTileId);

    if (tileIndex < this.board.length - 1) {
      tileIndex = tileIndex + pos;
    }
    else {
      tileIndex = tileIndex + pos - this.board.length;
    }
    player.onTileId = this.board[tileIndex].id;

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
    this.advancePlayerToTile(playerId, this.findTileByType(BoardTileType.JAIL).id);
  }

  getTileIndex(tileId) {
    this.board.forEach((tile, tileIndex) => {
      if (tile.id == tileId) {
        return tileIndex;
      }
    })
    return -1;
  }

  getTilebyId(tileId) {
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
    };
  }

  possibleActionsForPhase(phase) {
    switch (phase) {
      case TurnPhase.PRE_ROLL:
        return this.preRollPossibleActions();
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
      let aiActions = player.ai.considerAction(this, player, this.currentPhase);
      aiActions.forEach(action => this.handleAIAction(player.id, action));
      return {
        phase: this.currentPhase,
        message: GameMessageType.PHASE_DONE,
        player
      }
    }
  }

  handleAIAction(playerId, action) {

  }

  handleHumanInput(playerId, input) {
    let player = this.getPlayerById(playerId);
    let action = input.action;
    let possibleActions = this.possibleActionsForPhase(this.currentPhase);
    if (!possibleActions.include(action)) {
      raise InvalidMoveError('Move ' + action + ' is not possible for phase ' + this.currentPhase + '!');
    }
    let furtherInputRequired = true;

    switch (action) {
      case PlayerAction.MORTGAGE:
        let tileId = input.tileId;
        this.mortgage(player.id, tileId);
        break;
      case PlayerAction.UNMORTGAGE:
        let tileId = input.tileId;
        this.unmortgage(player.id, tileId);
        break;
      case PlayerAction.BUY:
        let tileId = input.tileId;
        this.buy(player.id, tileId);
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
      phase: this.currentPhase,
      message: GameMessageType.PHASE_DONE,
      player
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

      if (nextPhase == null) {
        this.currentPlayerIndex++;
        if (this.currentPlayerIndex >= this.ingamePlayers.length) {
          this.currentPlayerIndex = 0;
        }

        this.currentPhase = TurnPhase.PRE_ROLL;
      }
      else {
        this.currentPhase = nextPhase;
      }
    }
  }

  nextPlayer() {

  }

  * run_old() {
    if (this.gameState != GameState.READY) {
      throw new InvalidGameStateError('Game is not ready to be started yet!');
    }

    while (this.gameState != GameState.OVER) {
      let currentPlayer = this.ingamePlayers[this.currentPlayerIndex];
      let currentPlayerInput;
      /*
      if (currentPlayer.type == PlayerType.AI) {
         currentPlayer.ai.preRoll(this, currentPlayer);
      }
      else {
        yield {
          humanPlayerInput: 'PRE_ROLL',
          currentPlayer
        };
      }
      */

      /* Check whether the player is in jail. If in jail the player can choose
      to pay $50 to get out. However, if the player has been in jail for 3 turns
      he must pay
      NOTE: handle negative money!!
       */
      if (currentPlayer.inJail) {
        currentPlayer.inJailTurns++;
        if (currentPlayer.inJailTurns >= MAX_JAIL_TURNS) {
          currentPlayer.money -= 50;
          yield {
            type: GameMessage.EVENT,
            action: 'BAILED_OUT_OF_JAIL',
            player: currentPlayer
          };
        }
        else {
          if (currentPlayer.type == Playertype.HUMAN) {
             currentPlayerInput = yield {
              type: GameMessage.HUMAN_INPUT_REQUIRED,
              action: 'IN_JAIL',
              player: currentPlayer
            }
          }
          else {
            currentPlayerInput = currentPlayer.ai.considerJailTime(this, currentPlayer);
          }
        }
      }


      if (currentPlayer.type == PlayerType.HUMAN) {
        currentPlayerInput = yield {
          type: GameMessage.HUMAN_INPUT_REQUIRED,
          action: 'ROLL',
          player: currentPlayer
        }
      } else {
        currentPlayer.ai.roll(this, currentPlayer);
      }

      /* Dice rolls
        Roll the dice for the current player. If player rolls doubles, roll again.
        If player rolls three doubles in a row it's off to jail they go.
      */
      let doubleRolls = 0;
      let anotherRollNeeded = true;
      while (anotherRollNeeded) {
        let {die1, die2} = this.rollDice();

        if (currentPlayer.inJail && die1 == die2 || !currentPlayer.inJail) {
          let origTile = this.getTileById(currentPlayer.onTileId);
          this.advancePlayer(player, die1+die2);
          let newTile = this.getTileById(currentPlayer.onTileId);

          yield {
            type: GameAction.EVENT,
            message: 'PLAYER_ADVANCE',
            diceRoll: {die1, die2},
            origTile,
            newTile
          };
        }



        anotherRollNeeded = !currentPlayer.inJail && die1 == die2;
        if (anotherRollNeeded) {
          doubleRolls += 1;
        }
        if (doubleRolls >= MAX_DOUBLE_ROLLS) {
          //Jail time!

        }
      }



    }
  }
}
