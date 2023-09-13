from card import Card, Wheel
from effect import Effect, EffectType
from element import Element
import random

burn_spells = [
    ("Burn", 1, 1),
    ("Burn II", 3, 2),
    ("Burn III", 5, 3),
    ("Burn IV", 8, 4),
], EffectType.DAMAGE

healing_spells = [
    ("Heal", 1, 1),
    ("Heal II", 3, 2),
    ("Heal III", 5, 3),
    ("Heal IV", 8, 4),
], EffectType.HEAL

block_spells = [
    ("Wall", 0, 1),
    ("Wall II", 2, 3),
    ("Wall III", 4, 5),
    ("Wall IV", 6, 8),
], EffectType.BLOCK

spell_damage_spells = [
    ("Focus", 0, 1),
    ("Focus II", 2, 2),
    ("Focus III", 4, 3),
], EffectType.SPELL_DAMAGE

mana_spells = [
    ("Channel", 1, 1),
    ("Channel II", 2, 5),
    ("Channel III", 6, 10),
], EffectType.MANA

multiple_effects_cards = [
    Card(
        4,
        "Drain Life",
        [
            Effect(EffectType.HEAL, 2),
            Effect(EffectType.DAMAGE, 2)
        ],
        []
    )
]

def cards():
    ret = multiple_effects_cards
    for config in [burn_spells, healing_spells, block_spells, spell_damage_spells, mana_spells]:
        for name, mana_cost, value in config[0]:
            ret.append(Card(
                mana_cost,
                name,
                [Effect(config[1], value)],
                random.sample([Element.AIR, Element.EARTH, Element.FIRE, Element.WATER], 2)
            ))
    return ret 