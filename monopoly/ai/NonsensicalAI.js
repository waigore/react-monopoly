import TurnPhase from '../core/TurnPhase';
import PlayerAction from '../core/PlayerAction';

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
    else {
      return [{
        action: PlayerAction.NEXT_PHASE
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
    console.log(player.info.name, currentPhase.name, ': my possible actions are', possibleActions.map(a => a.name));
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
    else {
      throw new NonsensicalAIError('I do not understand what this phase is! ' + currentPhase.name);
    }

    return []
  }
}

export default NonsensicalAI;
