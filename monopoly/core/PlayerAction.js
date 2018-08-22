import { Enum } from 'enumify';

class PlayerAction extends Enum {}
PlayerAction.initEnum([
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
  'BUY',
  'AUCTION',
  'FORFEIT'
])

export default PlayerAction;
