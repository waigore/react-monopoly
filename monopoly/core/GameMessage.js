import { Enum } from 'enumify';

class GameMessageType extends Enum {}
GameMessageType.initEnum([
  'EVENT',
  'HUMAN_INPUT_REQUIRED'
])

export {
  GameMessageType
};
