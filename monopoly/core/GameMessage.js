import { Enum } from 'enumify';

class GameMessageType extends Enum {}
GameMessageType.initEnum([
  'PHASE_DONE',
  'HUMAN_INPUT_REQUIRED'
])

export {
  GameMessageType
};
