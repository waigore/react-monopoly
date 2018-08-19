import { Enum } from 'enumify';

class PlayerAIAction extends Enum {}
PlayerAIAction.initEnum([
  'DO_NOTHING',
  'INIT_TRADE',
  'ACCEPT_TRADE',
  'RENEGOTIATE_TRADE',
  'REJECT_TRADE',
  'MORTGAGE',
  'DEVELOP',
  'AUCTION',
  'FORFEIT'
])

export default PlayerAIAction;
