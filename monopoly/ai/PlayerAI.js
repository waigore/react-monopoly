import { Enum } from 'enumify';

import NonsensicalAI from './NonsensicalAI';
import TurnPhase from '../core/TurnPhase';
import PlayerAction from '../core/PlayerAction';

class UnsupportedAIError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'UnsupportedAIError';
  }
}

class AILevel extends Enum {}
AILevel.initEnum([
  'NONSENSICAL',
  'BASIC',
  'NORMAL'
])

class PlayerAI {
  constructor({level}) {
    this.level = level;

    if (level == AILevel.NONSENSICAL) {
      this.aiModule = new NonsensicalAI();
    }
    else {
      throw new UnsupportedAIError(level + " AI not implemented yet!");
    }
  }

  considerAction(game, player, currentPhase, possibleActions) {
    if (currentPhase == TurnPhase.ROLL) {
      return [{
        action: PlayerAction.ROLL
      }]
    }

    return this.aiModule.considerAction(game, player, currentPhase, possibleActions);
  }
}

export {
  AILevel,
  PlayerAI
};
