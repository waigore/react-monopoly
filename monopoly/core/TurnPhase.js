import { Enum } from 'enumify';

class TurnPhase extends Enum {}
TurnPhase.initEnum([
  'PRE_ROLL',
  'Pre_ROLL_TRADE',
  'ROLL',
  'BUY',
  'POST_ROLL',
  'AUCTION'
])

export default TurnPhase;
