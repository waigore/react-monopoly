class UnsupportedAIError extends Error {
  constructor(msg) {
    super(msg);
    this.name = 'UnsupportedAIError';
  }
}

class AILevel extends Enum {}
PlayerLevel.initEnum([
  'NONSENSICAL',
  'BASIC',
  'NORMAL'
])

class PlayerAI {
  constructor({level}) {
    this.level = level;

    if (level == PlayerLevel.NONSENSICAL) {
      this.aiModule = new NonsensicalAI();
    }
    else {
      throw new UnsupportedAIError(level + " AI not implemented yet!");
    }
  }

  considerPreRoll(game, player) {
    this.aiModule.considerPreRoll(game, player);
  }

  roll(game, player) {
    //the AI always proceeds with the roll
    return;
  }

  considerOffer(game, player1, player2, p1Offer, p2Offer) {
    this.aiModule.considerOffer(game, player1, player2, p1Offer, p2Offer);
  }
}

export {
  AILevel,
  PlayerAI
};
