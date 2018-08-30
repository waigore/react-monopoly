import { Enum } from 'enumify';

class PlayerAction extends Enum {}
PlayerAction.initEnum([
  'NEXT_PHASE',
  'ROLL',
  'PAY_JAIL_FINE',
  'USE_JAIL_CARD',
  'INIT_TRADE',
  'ACCEPT_TRADE',
  'RENEGOTIATE_TRADE',
  'REJECT_TRADE',
  'MORTGAGE',
  'UNMORTGAGE',
  'DEVELOP',
  'SELL',
  'BUY',
  'AUCTION',
  'END_TURN',
  'FORFEIT'
])

export default PlayerAction;
