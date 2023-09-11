import random
from effect import Effect, EffectType
from enum import Enum

class Element(Enum):
    AIR = "air"
    EARTH = "earth"
    FIRE = "fire"
    WATER = "water"

class Card():
    def __init__(self, mana_cost, name, text, effects):
        self.mana_cost = mana_cost
        self.name = name
        self.text = text
        self.effects = effects
        
    @property
    def mana_cost(self):
        return self._mana_cost
   
    @mana_cost.setter
    def mana_cost(self, value):
        self._mana_cost = value
    
    @property
    def name(self):
        return self._name
    
    @name.setter
    def name(self, value):
        self._name = value
    
    @property
    def text(self):
        return self._text
    
    @text.setter
    def text(self, value):
        self._text = value
    
    @property
    def effects(self):
        return self._effects
    
    @effects.setter
    def effects(self, value):
        self._effects = value

    def to_json(self):
        return {
            "manaCost": self.mana_cost,
            "name": self.name,
            "text": self.text,
            "effects": [effect.to_json() for effect in self.effects]
        }
   
    def of_json(json):
        return Card(
            json["manaCost"],
            json["name"],
            json["text"],
            [Effect.of_json(effect) for effect in json["effects"]]
        )
    
    def starting_wheel():
        channel = Card(0, "Channel", "Gain 1 mana", [Effect(EffectType.MANA, 1)])
        fireblast = Card(0, "Fireblast", "Deal 1 damage", [Effect(EffectType.DAMAGE, 1)])
        shield = Card(0, "Shield", "Gain 2 block", [Effect(EffectType.BLOCK, 2)])
        return [channel, channel, channel, fireblast, shield, None, None, None, None, None]
    
    def resolve(self, player, opponent):
        if player.pay_mana(self.mana_cost):
            for effect in self.effects:
                effect.resolve(player, opponent)
            return True
        else:
            return False 


class Wheel():
    def __init__(self, cards = None):
        if cards:
            assert len(cards) == 10
            self.cards = cards
        else:    
            print("Generating new wheel")
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
            'cards': [card.to_json() if card else None for card in self.cards],
            'active': self.active
        }
        
    def of_json(json):
        wheel = Wheel([Card.of_json(card) if card else None for card in json['cards']])
        wheel.active = json['active']
        return wheel
    
    def active_card(self):
        return self.cards[self.active]

    def resolve(self, player, opponent):
        self.active_card() and self.active_card().resolve(player, opponent)

def starting_wheels():
    return {
        e: Wheel() for e in Element
    } 