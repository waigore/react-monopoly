import TurnPhase from '../core/TurnPhase';
import PlayerAction from '../core/PlayerAction';
import { BoardTileType } from '../core/BoardTile';

class NonsensicalAIError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'NonsensicalAIError';
  }
}

class NonsensicalAI {
  constructor() {

  }

  considerPreRoll(game, player, possibleActions)
  {
    return [{
      action: PlayerAction.NEXT_PHASE
      }];
  }

  considerRoll(game, player, possibleActions)
  {
    return [{
        action: PlayerAction.ROLL
      }];
  }

  considerBuy(game, player, possibleActions)
  {
    if (possibleActions.includes(PlayerAction.BUY)) {
      return [{
        action: PlayerAction.BUY,
        tileId: player.onTileId
      }];
    }
    else if (possibleActions.includes(PlayerAction.AUCTION)) {
      return [{
        action: PlayerAction.AUCTION,
        tileId: player.onTileId
      }];
    }
    else {
      return [{
        action: PlayerAction.NEXT_PHASE
        }];
    }
  }

  considerAuction(game, player, possibleActions)
  {
    let auctionedTile = game.getTileById(game.turnAuctionData.tileId);
    let currentPrice = game.turnAuctionData.currentPrice;
    let priceThreshold = auctionedTile.info.price;

    if (player.money < currentPrice ||
          player.money - currentPrice < 200) {
      return [{
        action: PlayerAction.ABSTAIN
      }]
    }

    let playerProperties = game.getPlayerAssets(player.id).properties;

    if (auctionedTile.info.type == BoardTileType.PROPERTY) {
      let sameColorTiles = playerProperties.filter(p => p.info.color == auctionedTile.info.color);
      if (sameColorTiles.length > 0) {
        priceThreshold = priceThreshold * (1+ 0.2*sameColorTiles.length);
      }
    }
    else {
      let sameTypeTiles = playerProperties.filter(p => p.info.type == auctionedTile.info.type);
      if (sameTypeTiles.length > 0) {
        priceThreshold = priceThreshold * (1+ 0.2*sameTypeTiles.length);
      }
    }

    if (currentPrice <= priceThreshold) {
      return [{
        action: PlayerAction.BID
      }];
    }
    else if (currentPrice <= priceThreshold + 50) {
      let bidProb = Math.random();
      if (bidProb <= 0.4) {
        return [{
          action: PlayerAction.BID
        }];
      }
      else {
        return [{
          action: PlayerAction.ABSTAIN
        }];
      }
    }
    else {
      return [{
        action: PlayerAction.ABSTAIN
      }];
    }
  }

  considerPostRoll(game, player, possibleActions)
  {
    return [{
      action: PlayerAction.NEXT_PHASE
      }];
  }

  considerAction(game, player, currentPhase, possibleActions) {
    //console.log(player.info.name, currentPhase.name, ': my possible actions are', possibleActions.map(a => a.name));
    if (currentPhase == TurnPhase.PRE_ROLL) {
      return this.considerPreRoll(game, player, possibleActions);
    }
    else if (currentPhase == TurnPhase.ROLL) {
      return this.considerRoll(game, player, possibleActions);
    }
    else if (currentPhase == TurnPhase.BUY) {
      return this.considerBuy(game, player, possibleActions);
    }
    else if (currentPhase == TurnPhase.POST_ROLL) {
      return this.considerPostRoll(game, player, possibleActions);
    }
    else if (currentPhase == TurnPhase.AUCTION) {
      return this.considerAuction(game, player, possibleActions);
    }
    else {
      throw new NonsensicalAIError('I do not understand what this phase is! ' + currentPhase.name);
    }

    return []
  }
}

export default NonsensicalAI;
