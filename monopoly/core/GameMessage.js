import { Enum } from 'enumify';

class GameMessage extends Enum {}
GameMessage.initEnum([
  'EVENT',
  'HUMAN_INPUT_REQUIRED'
])

export default GameMessage;
