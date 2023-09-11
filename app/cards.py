from card import Card
from effect import Effect, EffectType

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
    ("Block", 0, 1),
    ("Block II", 2, 3),
    ("Block III", 4, 5),
    ("Block IV", 6, 8),
], EffectType.BLOCK

spell_damage_spells = [
    ("Spell Damage", 0, 1),
    ("Spell Damage II", 2, 2),
    ("Spell Damage III", 4, 3),
], EffectType.SPELL_DAMAGE

mana_spells = [
    ("Channel", 1, 1),
    ("Channel II", 2, 5),
    ("Channel III", 6, 10),
], EffectType.MANA

cards = []

for config in [burn_spells, healing_spells, block_spells, spell_damage_spells, mana_spells]:
    for name, mana_cost, value in config[0]:
        cards.append(Card(
            mana_cost,
            name,
            f"{config[1].value.capitalize()} {value}",
            [Effect(config[1], value)]
        ))
 