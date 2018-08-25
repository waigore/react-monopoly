import { Enum } from 'enumify';

class TurnPhase extends Enum {}
TurnPhase.initEnum([
  'PRE_ROLL',
  'ROLL',
  'POST_ROLL',
  'AUCTION'
])

export default TurnPhase;
