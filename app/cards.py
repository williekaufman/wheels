from card import Card, Wheel
from effect import Effect, EffectType
from element import Element
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
        [Effect(EffectType.DAMAGE_REDUCTION, 3)],
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
        3,
        "Fireblast",
        [Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE],
    ),
    Card(
        5,
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
]



water_spells = [
    Card(
        2,
        "Mending Waters",
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

def cards():
    return air_spells + fire_spells + earth_spells + water_spells