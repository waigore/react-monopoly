..import PlayerAIAction from './PlayerAIAction';

class NonsensicalAI {
  constructor() {

  }

  considerPreRoll(game, self) {
    let assets = game.getPlayerAssets(self.id);

    if (assets.properties.length > 0) {
    }

    /*
    return {
      aiAction: PlayerAIAction.DO_NOTHING
    }
    */
  }

  considerOffer(game, from_player, self, p1Offer, p2Offer) {

  }
}
