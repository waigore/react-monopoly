import { Enum } from 'enumify';

class CardType extends Enum {}
CardType.initEnum([
  'CHANCE',
  'COMM_CHEST'
]);

class MonopolyCard {
  constructor({type, name, code, description, effect, keepable = false}) {
    this.type = type;
    this.name = name;
    this.code = code;
    this.description = description;
    this.effect = effect;
    this.keepable = keepable;
  }
}

function chanceCard({...args}) {
  return new MonopolyCard({type: CardType.CHANCE, ...args});
}

function commChestCard({...args}) {
  return new MonopolyCard({type: CardType.COMM_CHEST, ...args});
}

export {
  CardType,
  MonopolyCard,
  chanceCard,
  commChestCard
};
