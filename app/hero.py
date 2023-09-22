from element import Element
from card import Effect, EffectType
from effect import Synergy

class Hero():
    def __init__(self, name, element, description, adjust_card, starting_cards=(lambda : None), start_of_game=None, every_turn=None):
        self.name = name
        self.element = element
        self.description = description
        self.start_of_game = start_of_game
        self.every_turn = every_turn
        self.adjust_card = adjust_card
        self.starting_cards = starting_cards
        
    def to_json(self):
        return {
            'name': self.name,
            'element': self.element.value,
            'description': self.description
        }
        
def adjust_mana(card, amount):
    card.mana_cost = max(0, card.mana_cost + amount)
    
def adjust_effects(card, params):
    for type, value in params:
        for effect in card.effects:
            if effect.type == type:
                effect.value = max(0, effect.value + value)
                effect.synergy = Synergy.POSITIVE if value > 0 else Synergy.NEGATIVE

def adjust_card(card, mana_cost, effects):
    adjust_mana(card, mana_cost)
    adjust_effects(card, effects)

def make_adjust(mana_cost, effects):
    return lambda card: adjust_card(card, mana_cost, effects)

def every_turn(player, params):
    for key, value in params:
        player.add_nonnegative(key, value)

def make_every_turn(params):
    return lambda player: every_turn(player, params)

def start_of_game(player, params):
    for key, value in params:
        player.add_nonnegative(key, value)
        
def make_start_of_game(params):
    return lambda player: start_of_game(player, params)

air_heroes = [
    Hero(
        name="Aeromancer",
        element=Element.AIR,
        description='''Spells: -1 (Mana) cost''',
        adjust_card=make_adjust(-1, [])
    ),
    Hero(
        name="Aang",
        element=Element.AIR,
        description='''Spells: -1 (Mana) cost +1 (Heal) -1 (Damage)''',
        adjust_card=make_adjust(-1, [(EffectType.HEAL, 1), (EffectType.DAMAGE, -1)]),
    )
]

earth_heroes = [
    Hero(
        name="Geomancer",
        element=Element.EARTH,
        description='''Every turn: +1 (Block)''',
        adjust_card=make_adjust(0, []),
        every_turn=make_every_turn([('block', 1)])
    ),
    Hero(
        name="Toph",
        element=Element.EARTH,
        description='''Spells: +1 (Mana) cost +2 (Damage)''',
        adjust_card=make_adjust(1, [(EffectType.DAMAGE, 2)])
    ),
]

fire_heroes = [
    Hero(
        name="Pyromancer",
        element=Element.FIRE,
        description='''Spells: +1 (Damage)''',
        adjust_card=make_adjust(0, [(EffectType.DAMAGE, 1)])
    ),
    Hero(
        name="Zuko",
        element=Element.FIRE,
        description='''Every turn: -1 (Heal)
        Spells: -1 (Mana) cost +1 (Damage)''',
        adjust_card=make_adjust(-1, [(EffectType.DAMAGE, 1)]),
        every_turn=make_every_turn([('life', -1)])
    ),
    Hero(
        name="Iroh",
        element=Element.FIRE,
        description='''Start of game: +1 (Focus) +1 (Experience)
        Spells: -1 (Damage)''',
        adjust_card=make_adjust(0, [(EffectType.DAMAGE, -1)]),
        start_of_game=make_start_of_game([('focus', 1), ('experience', 1)])
    )
]

water_heroes = [
    Hero(
        name="Hydromancer",
        element=Element.WATER,
        description='''Spells: +1 (Heal)''',
        adjust_card=make_adjust(0, [(EffectType.HEAL, 1)])
    ),
    Hero(
        name="Katara",
        element=Element.WATER,
        description='''Start of game: +1 (Focus) 
        Spells: -1 (Damage)''',
        adjust_card=make_adjust(0, [(EffectType.DAMAGE, -1)]),
        start_of_game=make_start_of_game([('focus', 1)])
    ),
]

heroes_list = air_heroes + earth_heroes + fire_heroes + water_heroes
 
heroes = {hero.name: hero for hero in heroes_list}

default_heroes = {
    Element.AIR: heroes['Aeromancer'],
    Element.EARTH: heroes['Geomancer'],
    Element.FIRE: heroes['Pyromancer'],
    Element.WATER: heroes['Hydromancer']
}