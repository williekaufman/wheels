import random
from effect import Effect, EffectType
from element import Element
from hero import heroes, default_heroes
from enum import Enum

class Card():
    def __init__(self, mana_cost, name, effects, elements):
        self.mana_cost = mana_cost
        self.name = name
        self.effects = sorted(effects, key=lambda effect: effect.type.priority())
        self.elements = elements
        
    def to_json(self):
        return {
            "mana_cost": self.mana_cost,
            "name": self.name,
            "text": self.text(),
            "effects": [effect.to_json() for effect in self.effects],
            "elements": [element.value for element in self.elements]
        }
   
    def of_json(json):
        args = {
            'mana_cost': json['mana_cost'],
            'name': json['name'],
            'effects': [Effect.of_json(effect) for effect in json['effects']],
            'elements': [Element(element) for element in json['elements']]
        }
        return Card(**args)
   
    def text(self):
        return ' '.join([effect.text() for effect in self.effects])
   
    def resolve(self, player, opponent):
        logs = []
        if player.pay_mana(self.mana_cost):
            for effect in self.effects:
                logs.append(effect.resolve(player, opponent))
            return {
                "card": self,
                "animate": True,
                }, logs
        return {
            "card": self, 
            "animate": False, 
            "reason": "Not enough mana"
            }, ['Not enough mana']

class Wheel():
    def __init__(self, hero, cards, active=None):
        self.hero = hero
        assert len(cards) == 10
        self.cards = cards
        if active is not None:
            self.active = active
        else:
            self.spin()
        
    def play(self, card):
        if self.hero.element not in card.elements:
            return False
        if (locations := [i for i in range(len(self.cards)) if self.cards[i] == None]):
            self.hero.adjust_card(card)
            self.cards[random.choice(locations)] = card
            return True
        return False

    def spin(self):
        self.active = random.randint(0, 9)
        
    def to_json(self):
        return {
            'description': self.hero.description,
            'hero': self.hero.name,
            'cards': [card.to_json() if card else None for card in self.cards],
            'active': self.active
        }
        
    def of_json(json):
        hero = heroes[json['hero']]
        return Wheel(hero, [Card.of_json(card) if card else None for card in json['cards']], json['active'])
    
    def active_card(self):
        return self.cards[self.active]

    def resolve(self, player, opponent):
        if self.active_card():
            return self.active_card().resolve(player, opponent)
        else:
            return {
                "card": None,
                "animate": False,
                "reason": "No card"
            }, 'Empty card'
        
def channel(name="Channel"):
    return Card(0, name, [Effect(EffectType.MANA, 1)], [])

def fireblast(name="Fireblast"):
    return Card(0, name, [Effect(EffectType.DAMAGE, 1)], [])

def shield(name="Shield"):
    return Card(0, name, [Effect(EffectType.BLOCK, 2)], [])

# function so we get a fresh card, not a reference to the same card
def basic_cards():
    return {
        "channel": Card(0, "Channel", [Effect(EffectType.MANA, 1)], []),
        "fireblast": Card(0, "Fireblast", [Effect(EffectType.DAMAGE, 1)], []),
        "shield": Card(0, "Shield", [Effect(EffectType.BLOCK, 2)], [])    
    }
    
def starting_template(config):
    return [
        channel(config['channel']),
        channel(config['channel']),
        channel(config['channel']),
        fireblast(config['fireblast']),
        shield(config['shield']),
        None,
        None,
        None,
        None,
        None        
    ]

configs = {
    Element.AIR: {
        'channel': 'Spirit',
        'fireblast': 'Air Blast',
        'shield': 'Wind Wall'
    },
    Element.EARTH: {
        'channel': 'Vitalize',
        'fireblast': 'Rock Throw',
        'shield': 'Earth Wall'
    },
    Element.FIRE: {
        'channel': 'Inflame',
        'fireblast': 'Singe',
        'shield': 'Fire Wall'
    },
    Element.WATER: {
        'channel': 'Reservoir',
        'fireblast': 'Water Jet',
        'shield': 'Water Wall'
    }
}
    
def starting_cards():
    return {
        element: starting_template(configs[element]) for element in Element
    }

def starting_wheels(heroes):
    cards = starting_cards()
    return {
        element: Wheel(heroes[element], heroes[element].starting_cards() or cards[element]) for element in Element
    } 
