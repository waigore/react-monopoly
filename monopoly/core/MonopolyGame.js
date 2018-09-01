import { Enum } from 'enumify';
import EventEmitter from 'wolfy87-eventemitter';

import tileData from './BoardData';
import { ukChanceCardData, ukCommChestCardData } from './CardData';
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
  'PLAYER_PASSED_GO',
  'PLAYER_DREW_CARD'
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
const MAX_HOUSES = 32;
const MAX_HOTELS = 12;
const MAX_HOUSE_DEV = 4;
const MAX_HOTEL_DEV = 1;
const AUCTION_INCREMENT = 10;
const JAIL_FINE = 50;
const INCOME_TAX_AMT = 200;
const SUPER_TAX_PCT = 10;

function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}

class MonopolyGame {
  constructor({players, shuffleDecks = true, diceRollFunc = null}) {
    this.board = [];
    this.ingamePlayers = [];
    this.chanceCardDeck = [];
    this.commChestCardDeck = [];
    this.currentPlayerIndex = -1;
    this.gameState = GameState.INIT;
    this.ee = new EventEmitter();
    this.housesAvailable = MAX_HOUSES;
    this.hotelsAvailable = MAX_HOTELS;
    this.diceRollFunc = diceRollFunc;

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

    if (this.board[0].info.type != BoardTileType.GO) {
      throw new InvalidBoardConfigError('The first tile is not GO!');
    }

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
      });
    });

    ukChanceCardData.forEach((card, cardIndex) => {
      this.chanceCardDeck.push({
        info: card,
        deckName: 'CHANCE'
      });
    });
    if (shuffleDecks) {
      shuffle(this.chanceCardDeck);
    }


    ukCommChestCardData.forEach((card, cardIndex) => {
      this.commChestCardDeck.push({
        info: card,
        deckName: 'COMM_CHEST'
      });
    });
    if (shuffleDecks) {
      shuffle(this.commChestCardDeck);
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

  emitPlayerDrewCard(playerId, card) {
    let player = this.getPlayerById(playerId);
    this.emitEvent(GameEventType.PLAYER_DREW_CARD, [{player, card}]);
  }

  drawCardFromDeck(playerId, deck) {
    let card = deck.shift();
    this.turnPlayerData.drawnCard = card;
    deck.push(card);
    this.emitPlayerDrewCard(playerId, card);
    return card;
  }

  drawChanceCard(playerId) {
    return this.drawCardFromDeck(playerId, this.chanceCardDeck);
  }

  drawCommChestCard(playerId) {
    return this.drawCardFromDeck(playerId, this.commChestCardDeck);
  }

  rollDice(die1=null, die2=null) {
    if (this.diceRollFunc != null) {
      ({die1, die2} = this.diceRollFunc());
      return {die1, die2};
    }
    if (die1 == null) {
      die1 = Math.floor(Math.random()*6)+1;
    }
    if (die2 == null) {
      die2 = Math.floor(Math.random()*6)+1;
    }

    return {die1, die2};
  }

  roll(playerId) {
    let player = this.getPlayerById(playerId);
    this.turnPlayerData.hasRolled = true;

    let {die1, die2} = this.rollDice();
    if (die1 == die2) {
      this.turnPlayerData.doubleRolls++;
      if (this.turnPlayerData.doubleRolls >= MAX_DOUBLE_ROLLS)
      {
        this.goToJail(playerId);
        return;
      }
    }
    else {
      this.turnPlayerData.doubleRolls = 0;
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
      else if (newTile.info.type == BoardTileType.CHANCE) {
        let card = this.drawChanceCard(playerId);
        card.info.effect(this, this.getPlayerById(playerId));
      }
      else if (newTile.info.type == BoardTileType.COMM_CHEST) {
        let card = this.drawCommChestCard(playerId);
        card.info.effect(this, this.getPlayerById(playerId));
      }
      else if (this.isRentDue(playerId, newTile.id)) {
        //player owes rent
        this.payRent(playerId, newTile.id);
      }
    }
  }

  isRentDue(playerId, tileId) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);

    return tile.info.isBuyable() &&
          tile.ownedPlayerId != null &&
          tile.ownedPlayerId != playerId &&
          !tile.mortgaged;
  }

  payRent(playerId, tileId, multiplier=1) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(tileId);

    let rent = this.calculateRent(tile.id, multiplier);
    let ownedPlayer = this.getPlayerById(tile.ownedPlayerId);
    if (player.money >= rent)
    {
      player.money -= rent;
      ownedPlayer.money += rent;
      this.emitPlayerPaidRent(player.id, tile.id, rent);
    }
    else
    {
      this.turnPlayerData.outstandingRent = rent;
    }
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

    let mortgage = tile.info.mortgageValue;
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

    let mortgage = tile.info.mortgageValue;
    if (player.money < mortgage) {
      throw new InvalidMoveError(player.info.name + " does not have enough money to unmortgage tile!");
    }

    player.money -= mortgage;
    tile.mortgaged = false;
  }

  develop(playerId, tileId) {
    let tile = this.getTileById(tileId);
    let player = this.getPlayerById(playerId);
    if (!tile.info.isDevelopable())
    {
      throw new InvalidMoveError(tile.info.name + " cannot be developed: is of type " + tile.info.type + "!");
    }

    if (tile.ownedPlayerId != player.id) {
      throw new InvalidMoveError(tile.info.name + " is not owned by player " + player.info.name + "!");
    }

    let playerProperties = this.getPlayerAssets(playerId).properties;
    let allSameColorTiles = this.board.filter(t => t.info.color == tile.info.color);
    let ownedSameColorTiles = playerProperties
          .filter(t => t.info.type == BoardTileType.PROPERTY
                      && t.info.color == tile.info.color);
    if (allSameColorTiles.length != ownedSameColorTiles.length) {
      throw new InvalidMoveError("Player does not own all properties of color " + tile.info.color + "!");
    }

    if (ownedSameColorTiles.some(t => t.mortaged)) {
      throw new InvalidMoveError("Cannot develop! At least one property in the set is mortgaged.");
    }

    if (tile.hotels >= MAX_HOTEL_DEV) {
      throw new InvalidMoveError("Cannot develop this property! Maximum dev reached.");
    }

    let tileHouseNums = ownedSameColorTiles.map(t => t.hotels > 0 ? 5 : t.houses);
    if (tileHouseNums.some(n => (tile.houses+1)-n>1)) {
      throw new InvalidMoveError("Cannot develop this property! You must develop the others first.");
    }

    if (tile.houses >= MAX_HOUSE_DEV) {
      if (this.hotelsAvailable == 0) {
        throw new InvalidMoveError("No hotels left for development!");
      }
      tile.hotels += 1;
      this.hotelsAvailable -= 1;
    }
    else {
      if (this.housesAvailable == 0) {
        throw new InvalidMoveError("No houses left for development!");
      }
      tile.houses += 1;
      this.housesAvailable -= 1;
    }
    player.money -= tile.info.houseCost;

    this.emitPlayerAction(player.id, PlayerAction.DEVELOP, {tile});
  }

  sell(playerId, tileId) {
    let tile = this.getTileById(tileId);
    let player = this.getPlayerById(playerId);

    if (!tile.info.isDevelopable())
    {
      throw new InvalidMoveError(tile.info.name + " cannot be sold: is of type " + tile.info.type + "!");
    }

    if (tile.ownedPlayerId != player.id) {
      throw new InvalidMoveError(tile.info.name + " is not owned by player " + player.info.name + "!");
    }

    if (tile.hotels == 0 && tile.houses == 0) {
      throw new InvalidMoveError(tile.info.name + " is undeveloped!");
    }

    if (tile.hotels > 0) {
      tile.hotels -= 1;
      tile.houses = MAX_HOUSE_DEV;
    }
    else {
      tile.houses -= 1;
    }
    player.money += tile.info.houseCost/2;

    this.emitPlayerAction(player.id, PlayerAction.SELL, {tile});
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

  /* Allows the player to go back and forth on the board by {pos} spaces */
  advancePlayer(playerId, pos) {
    let player = this.getPlayerById(playerId);
    let tile = this.getTileById(player.onTileId);
    let tileIndex = this.getTileIndex(player.onTileId);

    let newTileIndex = tileIndex + pos;

    if (newTileIndex >= this.board.length) {
      newTileIndex = newTileIndex - this.board.length;
      this.passGo(playerId);
    }
    else if (newTileIndex < 0) {
      newTileIndex = newTileIndex + this.board.length;
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

  /* Clockwise distance i.e. the distance players travel if they
  go the usual way on the board */
  calcTileDistance(tile1Id, tile2Id) {
    let index1 = this.getTileIndex(tile1Id);
    let index2 = this.getTileIndex(tile2Id);

    if (index2 < index1) {
      index2 += this.board.length;
    }
    return index2 - index1;
  }

  /*
  getTileIndex(tileId) {
    this.board.forEach((tile, tileIndex) => {
      if (tile.id == tileId) {
        return tileIndex;
      }
    });
    return -1;
  }
  */

  getTileById(tileId) {
    return this.board.filter(t => t.id == tileId)[0];
  }

  getTileByCode(code) {
    return this.board.filter(t => t.info.code == code)[0];
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

  getPlayerIndex(playerId) {
    let playerIndex = null;
    this.inGamePlayers.forEach((p, index) => {
      if (p.id == playerId) {
        playerIndex = index;
      }
    });
    if (playerIndex == null) {
      throw new InvalidOperationError("No such player id:" + playerId);
    }
    return playerIndex;
  }

  getPlayerByName(name) {
    return this.ingamePlayers.filter(p => p.info.name == name)[0];
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

  calculateRent(tileId, diceRoll, multiplier=1) {
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
        return tile.info.rent['h']*multiplier;
      }
      else if (tile.houses == 0 && sameColorTiles.length == ownedSameColorCount) {
        return tile.info.rent['0']*2*multiplier;
      }
      else {
        return tile.info.rent[tile.houses+'']*multiplier;
      }
    }
    else if (tile.info.type == BoardTileType.RAILROAD) {
      let ownedRailroadCount = ownedPlayerAssets.properties
                .filter(t => t.info.type == BoardTileType.RAILROAD)
                .length;
      if (ownedRailroadCount <= 0 || ownedRailroadCount > 4) {
        throw new InvalidBoardConfigError("Player has an invalid number of owned railroads! =" + ownedRailroadCount);
      }
      return tile.info.rent[ownedRailroadCount+'r']*multiplier;
    }
    else if (tile.info.type == BoardTileType.UTILITY) {
      let ownedUtilityCount = ownedPlayerAssets.properties
                .filter(t => t.info.type == BoardTileType.UTILITY)
                .length;
      let {die1, die2} = diceRoll;
      if (ownedUtilityCount <= 0 || ownedUtilityCount > 2) {
        throw new InvalidBoardConfigError("Player has an invalid number of owned utilities! =" + ownedUtilityCount);
      }
      return ownedUtilityCount == 1 || multiplier > 1 ? (die1 + die2) * 4 : (die1 + die2) * 10;
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
      outstandingRent: 0,
      auctionRequested: false,
      drawnCard: null
    };
  }

  initAuction(playerId, tileId) {
    this.turnPlayerData.auctionRequested = true;
    this.turnAuctionData = {
      currentBiddingPlayerIndex: this.getPlayerIndex(playerId),
      lastBiddingPlayerIndex: null,
      tileId,
      currentPrice: 0,
      abstrainCount: 0,
      auctionOver: false
    };
  }

  auctionBid(playerId, increment) {
    let auctionData = this.turnAuctionData;

    auctionData.lastBiddingPlayerIndex =
        auctionData.currentBiddingPlayerIndex;
    auctionData.currentPrice += increment;
    auctionData.abstainCount = 0;

    auctionData.currentBiddingPlayerIndex += 1;
    if (auctionData.currentBiddingPlayerIndex >= this.ingamePlayers.length) {
      auctionData.currentBiddingPlayerIndex = 0;
    }
  }

  auctionAbstain(playerId) {
    let auctionData = this.turnAuctionData;

    if (auctionData.abstainCount >= this.ingamePlayers.length-1
        && auctionData.lastBiddingPlayerIndex != null ) {
      auctionData.auctionOver = true;
      let successfulPlayer = this.ingamePlayers[auctionData.lastBiddingPlayerIndex];
      this.buy(successfulPlayer.id, auctionData.tileId);
      return;
    }
    else if (auctionData.abstainCount >= this.ingamePlayers.length-1) {
      auctionData.auctionOver = true;
      return;
    }

    auctionData.abstainCount += 1;
    this.turnAuctionData.currentBiddingPlayerIndex += 1;
    if (auctionData.currentBiddingPlayerIndex >= this.ingamePlayers.length) {
      auctionData.currentBiddingPlayerIndex = 0;
    }
  }

  startGame() {
    if (this.gameState != GameState.READY) {
      throw new InvalidGameStateError('Game is not ready to be started yet!');
    }

    this.gameState = GameState.RUNNING;
    this.currentPhase = TurnPhase.PRE_ROLL;
    this.turnCounter = 1;
    this.initTurnData();
    this.emitGameStarted();

    let currentPlayerId = this.ingamePlayers[this.currentPlayerIndex].id;
    this.emitTurnStarted(currentPlayerId);
    this.emitPhaseStarted(currentPlayerId, this.currentPhase);
  }

  possibleActionsForPhase(phase) {
    let possibleActions, player;
    switch (phase) {
      case TurnPhase.PRE_ROLL:
        ({player, possibleActions} = this.preRollPossibleActions());
        break;
      case TurnPhase.ROLL:
        ({player, possibleActions} = this.rollPossibleActions());
        break;
      case TurnPhase.BUY:
        ({player, possibleActions} = this.buyPossibleActions());
        break;
      case TurnPhase.AUCTION:
        ({player, possibleActions} = this.auctionPossibleActions());
        break;
      case TurnPhase.POST_ROLL:
        ({player, possibleActions} = this.postRollPossibleActions());
        break;
    }

    return {player, possibleActions};
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
    return {player, possibleActions};
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

    return {player, possibleActions};
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

    return {player, possibleActions};
  }

  auctionPossibleActions() {
    let auctionData = this.turnAuctionData;
    let possibleActions = [];
    let player = this.ingamePlayers[auctionData.currentBiddingPlayerIndex];
    if (auctionData.auctionOver) {
      possibleActions.push(PlayerAction.NEXT_PHASE);
    }
    else {
      if (player.money >= auctionData.currentPrice + AUCTION_INCREMENT) {
          possibleActions.push(PlayerAction.BID);
      }
      possibleActions.push(PlayerAction.ABSTAIN);
    }

    return {player, possibleActions};
  }

  postRollPossibleActions() {
    let player = this.ingamePlayers[this.currentPlayerIndex];
    let possibleActions = [
      PlayerAction.NEXT_PHASE,
      PlayerAction.MORTGAGE,
      PlayerAction.UNMORTGAGE,
      PlayerAction.DEVELOP
    ];

    return {player, possibleActions};
  }

  processPhase() {
    //let player = this.ingamePlayers[this.currentPlayerIndex];
    let {player, possibleActions} = this.possibleActionsForPhase(this.currentPhase);
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
    let possibleActions = this.possibleActionsForPhase(this.currentPhase).possibleActions;
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
      case PlayerAction.AUCTION:
        tileId = action.tileId;
        this.initAuction(player.id, tileId);
        break;
      case PlayerAction.BID:
        this.auctionBid(player.id);
        break;
      case PlayerAction.ABSTAIN:
        this.auctionAbstain(player.id);
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
      case PlayerAction.AUCTION:
        tileId = action.tileId;
        this.initAuction(player.id, tileId);
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

  runTurns(turns = 1) {
    if (turns < 1) {
      throw new InvalidOperationError("Must run for at least 1 turn!");
    }

    let phaseOutput;
    let currTurnCounter = this.turnCounter;
    let upToTurn = currTurnCounter + turns;

    while (currTurnCounter < upToTurn) {
      phaseOutput = this.run();

      if (phaseOutput.message == GameMessageType.HUMAN_INPUT_REQUIRED) {
        return phaseOutput;
      }

      currTurnCounter = this.turnCounter;
    }

    return phaseOutput;
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
        case TurnPhase.AUCTION:
          if (this.turnPlayerData.auctionRequested) {
            nextPhase = TurnPhase.AUCTION;
            this.turnPlayerData.auctionRequested = false;
          }
          else if (this.turnPlayerData.hasRolled
            && this.turnPlayerData.doubleRolls > 0
            && this.turnPlayerData.doubleRolls < MAX_DOUBLE_ROLLS
            ) {
            nextPhase = TurnPhase.ROLL;
          }
          else {
            nextPhase = TurnPhase.POST_ROLL;
          }
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
        this.turnCounter++;
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
