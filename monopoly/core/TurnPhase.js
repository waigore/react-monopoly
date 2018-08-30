import { Enum } from 'enumify';

class TurnPhase extends Enum {}
TurnPhase.initEnum([
  'PRE_ROLL',
  'TRADE',
  'ROLL',
  'BUY',
  'POST_ROLL',
  'AUCTION'
])

export default TurnPhase;
