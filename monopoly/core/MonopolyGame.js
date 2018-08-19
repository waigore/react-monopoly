import { Enum } from 'enumify';

import tileData from './BoardData';
import { GameMessage } from './GameMessage';
import { BoardTileType } from './BoardTile';
import { PlayerType, Player } from './Player';

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

class GameState extends Enum {}
GameState.initEnum([
  'INIT',
  'READY',
  'RUNNING',
  'OVER'
])

const MAX_DOUBLE_ROLLS = 3;
const MAX_JAIL_TURNS = 3;

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
    player.onTileId = tileIndex;
  }

  advancePlayerToTile(playerId, tile) {
    this.advancePlayer(playerId, this.getTileIndex(tile.id));
  }

  goToJail(playerId) {
    let player = this.getPlayerById(playerId);
    player.inJail = true;
    player.inJailTurns = 0;
    this.advancePlayerToTile(playerId, this.findTileByType(BoardTileType.GO_TO_JAIL));
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
    return this.board.filter(t => t.info.type == BoardTileType.JAIL)[0];
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

  determinePlayerOrder() {
    this.ingamePlayers.forEach(player => {
      let {die1, die2} = this.rollDice();
      player.lastRoll = {die1, die2};
      player.rollSequence = die1 + die2;
      player.onTileId = this.board[0].id;
    });

    this.ingamePlayers.sort((p1, p2) => -(p1.rollSequence-p2.rollSequence));
    this.currentPlayerIndex = 0;
    this.gameState = GameState.READY;
  }

  * run() {
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
