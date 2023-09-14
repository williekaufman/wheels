from card import Card, Wheel
from effect import Effect, EffectType
from element import Element
from local_settings import LOCAL
import random

air_spells = [
    Card(
        2,
        "Air Swipe",
        [Effect(EffectType.BLOCK, 2), Effect(EffectType.DAMAGE, 1)],
        [Element.AIR]    
    ),
    Card(
        4,
        "Take Flight",
        [Effect(EffectType.DAMAGE_REDUCTION, 2)],
        [Element.AIR]
    ),
    Card(
        6,
        "Air Blast",
        [Effect(EffectType.DAMAGE, 3)],
        [Element.AIR]
    ),
    Card(
        6,
        "Inner Peace",
        [Effect(EffectType.MANA, 3), Effect(EffectType.SPELL_DAMAGE, 2)],
        [Element.AIR]
    )
]

fire_spells = [
    Card(
        1,
        "Fireball",
        [Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE],
    ),
    Card(
        4,
        "Fireblast",
        [Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE],
    ),
    Card(
        6,
        "Firestorm",
        [Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE], 
    ),
    Card(
        5,
        "Inner Fire",
        [Effect(EffectType.SPELL_DAMAGE, 6)],
        [Element.FIRE],
    )
]

earth_spells = [
    Card(
        2,
        "Earth Cocoon",
        [Effect(EffectType.BLOCK, 2), Effect(EffectType.DAMAGE_REDUCTION, 1)],
        [Element.EARTH]
    ),
    Card(
        4, 
        "Rockslide",
        [Effect(EffectType.DAMAGE, 3)],
        [Element.EARTH]
    )
]



water_spells = [
    Card(
        2,
        "Mending",
        [Effect(EffectType.HEAL, 2)],
        [Element.WATER]
    ),
    Card(
        4,
        "Drain Life",
        [Effect(EffectType.HEAL, 2), Effect(EffectType.DAMAGE, 2)],
        [Element.WATER]
    ),
    Card(
        7,
        "Tsunami",
        [Effect(EffectType.DAMAGE, 4)],
        [Element.WATER]
    )
]

two_color_spells = [
    Card(
        6,
        "Tornado",
        [Effect(EffectType.DAMAGE, 2), Effect(EffectType.DAMAGE, 2)],
        [Element.AIR, Element.EARTH]
    ),
    Card(
        8,
        "Eruption",
        [Effect(EffectType.DAMAGE, 3), Effect(EffectType.DAMAGE, 3)],
        [Element.FIRE, Element.EARTH]
    ),
]

all_elements = [Element.AIR, Element.EARTH, Element.FIRE, Element.WATER]

mana_spells = [
    Card(
        3,
        "Attune",
        [Effect(EffectType.MANA, 5)],
        all_elements
    ),
    Card(
        8,
        "One With Nature",
        [Effect(EffectType.MANA, 12)],
        all_elements
    ),
    Card(
        5,
        "Channel",
        [Effect(EffectType.MANA, 8)],
        all_elements
    )
]

exp_spells = [
    Card(
        3, 
        "Training",
        [Effect(EffectType.EXPERIENCE, 1)],
        all_elements
    ),
    Card(
        6,
        "Vigorous Training",
        [Effect(EffectType.EXPERIENCE, 2)],
        all_elements
    ),
]

draw_spells = [
    Card(
        2, 
        "Research",
        [Effect(EffectType.DRAW, 1)],
        all_elements
    )
]


neutral_spells = [
    Card(
        6,
        "Indomitable",
        [Effect(EffectType.DAMAGE_REDUCTION, 3)],
        all_elements
    ),
    Card(
        5,
        "Elemental Blast",
        [Effect(EffectType.DAMAGE, 2)],
        all_elements
    ),
    Card(
        6,
        "1-2 Punch",
        [Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1)],
        all_elements
    ),
    Card(
        3,
        "Fortress",
        [Effect(EffectType.BLOCK, 6)],
        all_elements
    )
]

def default_cards():
    return air_spells + earth_spells + fire_spells + water_spells + two_color_spells + neutral_spells + exp_spells + mana_spells * 4

def cards():
    if LOCAL:
        pass
        # return 3
    return default_cards()

     