import { Enum } from 'enumify';

import PlayerAI from '../ai/PlayerAI';

class PlayerType extends Enum {}
PlayerType.initEnum([
  'HUMAN',
  'AI'
])

class Player {
  constructor({name, type, level}) {
    this.name = name;
    this.type = type;
    this.level = level;
  }
}

export {
  PlayerType,
  Player
};
