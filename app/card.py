import random
from effect import Effect, EffectType
from enum import Enum

class Element(Enum):
    AIR = "air"
    EARTH = "earth"
    FIRE = "fire"
    WATER = "water"

class Card():
    def __init__(self, mana_cost, name, effects):
        self.mana_cost = mana_cost
        self.name = name
        self.effects = effects
        
    def to_json(self):
        return {
            "manaCost": self.mana_cost,
            "name": self.name,
            "text": self.text(),
            "effects": [effect.to_json() for effect in self.effects]
        }
   
    def of_json(json):
        return Card(
            json["manaCost"],
            json["name"],
            [Effect.of_json(effect) for effect in json["effects"]]
        )
   
    def text(self):
        return ' '.join([effect.text() for effect in self.effects])
    
    def starting_wheel():
        channel = Card(0, "Channel", [Effect(EffectType.MANA, 1)])
        fireblast = Card(0, "Fireblast", [Effect(EffectType.DAMAGE, 1)])
        shield = Card(0, "Shield", [Effect(EffectType.BLOCK, 2)])
        return [channel, channel, channel, fireblast, shield, None, None, None, None, None]
    
    def resolve(self, player, opponent):
        ret = []
        if player.pay_mana(self.mana_cost):
            for effect in self.effects:
                ret.append(effect.resolve(player, opponent))
        return ret

class Wheel():
    def __init__(self, element, cards = None):
        self.element = element
        if cards:
            assert len(cards) == 10
            self.cards = cards
        else:    
            self.cards = Card.starting_wheel()
            self.spin()
        
    def play(self, card):
        if (locations := [i for i in range(len(self.cards)) if self.cards[i] == None]):
            self.cards[random.choice(locations)] = card
            return True
        return False

    def spin(self):
        self.active = random.randint(0, 9)
        
    def to_json(self):
        return {
            'element': self.element.value,
            'cards': [card.to_json() if card else None for card in self.cards],
            'active': self.active
        }
        
    def of_json(json):
        element = Element(json['element'])
        wheel = Wheel(element, [Card.of_json(card) if card else None for card in json['cards']])
        wheel.active = json['active']
        return wheel
    
    def active_card(self):
        return self.cards[self.active]

    def resolve(self, player, opponent):
        if self.active_card():
            return ','.join(self.active_card().resolve(player, opponent))
        else:
            return 'Empty card'


def starting_wheels():
    return {
        e: Wheel(e) for e in Element
    } 