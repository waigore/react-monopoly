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

  mortgage(tileId) {
    let tile = this.getTileById(tileId);
    let player = this.getPlayerById(tile.ownedPlayerId);
    if (!tile.info.isMortgageable())
      {
        throw new InvalidMoveError(tile.info.name + " cannot mortgage: is of type " + tile.info.type + "!");
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

  unmortgage(tileId) {
    let tile = this.getTileById(tileId);
    if (!tile.info.isMortgageable())
    {
      throw new InvalidMoveError(tile.info.name + " cannot unmortgage: is of type " + tile.info.type + "!");
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

  handleJailTimeInput(playerId, input) {

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

  preRollPossibleActions() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = [
      PlayerAction.ROLL,
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

  preRollPhase() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = this.preRollPossibleActions();

    if (player.info.type == PlayerType.HUMAN) {
      return {
        phase: TurnPhase.PRE_ROLL,
        message: GameMessageType.HUMAN_INPUT_REQUIRED,
        player,
        possibleActions
      }
    }
    else {
      let aiActions = player.ai.considerPreRoll(this, player);
      aiActions.forEach(action => this.handleAction(action));
      return {
        phase: TurnPhase.ROLL,
        message: GameMessageType.EVENT,
        player
      }
    }
  }

  handleAction(action) {

  }

  handleInput(input, possibleActions) {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let action = input.action;
    if (!possibleActions.include(action)) {
      raise InvalidMoveError('Move ' + action + ' is not possible for phase ' + this.currentPhase + '!');
    }

    switch (action) {
      case PlayerAction.MORTGAGE:
        let tileId = input.tileId;
        this.mortgage(tileId);
        break;
    }
  }

  run(humanInput = null) {
    let phaseOutput;
    switch (this.currentPhase) {
      case TurnPhase.PRE_ROLL:
        phaseOutput = humanInput ?
          this.handleInput(humanInput, this.preRollPossibleActions()) :
          this.preRollPhase();
      break;
      case TurnPhase.ROLL:
        this.rollPhase();
      break;
      case TurnPhase.POST_ROLL:
        this.postRollPhase();
      break;
      case TurnPhase.AUCTION:
        this.rollPhase();
      break;
    }


    if (phaseOutput.endTurn) {
      this.currentPlayerIndex++;
      if (this.currentPlayerIndex >= this.ingamePlayers.length) {
        this.currentPlayerIndex = 0;
      }

      this.currentPhase = TurnPhase.PRE_ROLL;

      /*
      this.playerTurnData = Object.assign(
        {},
        { turnEnded: false }
      );
      */
    }
    else if (phaseOutput.phase != this.currentPhase) {
      this.currentPhase = phaseOutput.phase;
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
