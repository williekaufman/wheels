from card import Card, Wheel
from effect import Effect, EffectType
from element import Element
from local_settings import LOCAL
from hero import heroes, default_heroes

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
        7,
        "Inner Peace",
        [Effect(EffectType.MANA, 4), Effect(EffectType.FOCUS, 1), Effect(EffectType.SPELL_DAMAGE, 2)],
        [Element.AIR]
    ),
]

fire_spells = [
    Card(
        1,
        "Fireball",
        [Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE],
    ),
    Card(
        5,
        "Fireblast",
        [Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE],
    ),
    Card(
        8,
        "Firestorm",
        [Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1), Effect(EffectType.DAMAGE, 1)],
        [Element.FIRE], 
    ),
    Card(
        12,
        "Conflagration",
        [Effect(EffectType.DAMAGE, 2), Effect(EffectType.DAMAGE, 2), Effect(EffectType.DAMAGE, 2)],
        [Element.FIRE],
    ),
    Card(
        4,
        "Inner Fire",
        [Effect(EffectType.SPELL_DAMAGE, 6)],
        [Element.FIRE],
    ),
    Card(
        2,
        "All Out Attack",
        [Effect(EffectType.DAMAGE, 3), Effect(EffectType.DAMAGE_REDUCTION, -2)],
        [Element.FIRE]
    ),
    Card(
        3,
        "Fiery Passion",
        [Effect(EffectType.HEAL, -3), Effect(EffectType.MANA, 10)],
        [Element.FIRE],
    ),
    Card(
        5,
        "Cauterize",
        [Effect(EffectType.HEAL, 3), Effect(EffectType.EXPERIENCE, 1)],
        [Element.FIRE],
    )
]

earth_spells = [
    Card(
        3,
        "Close Combat",
        [Effect(EffectType.HEAL, -2), Effect(EffectType.DAMAGE, 5)],
        [Element.EARTH] 
    ),
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
    ),
    Card(
        4,
        "Sanctuary",
        [Effect(EffectType.BLOCK, 4), Effect(EffectType.FOCUS, 1)],
        [Element.EARTH]
    ),
    Card(
        2,
        "Trip",
        [Effect(EffectType.SPELL_DAMAGE, 2)],
        [Element.EARTH]
    ),
    Card(
        3,
        "Overextend",
        [Effect(EffectType.MANA, 8), Effect(EffectType.DAMAGE_REDUCTION, -2)],
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
        7,
        "Tsunami",
        [Effect(EffectType.DAMAGE, 4)],
        [Element.WATER]
    ),
    Card(
        2,
        "Scrying",
        [Effect(EffectType.DRAW, 1), Effect(EffectType.EXPERIENCE, 1)],
        [Element.WATER] 
    ),
    Card(
        0,
        "Splash",
        [Effect(EffectType.DAMAGE, 0), Effect(EffectType.DAMAGE, 0)],
        [Element.WATER]
    ),
]

two_color_spells = [
    Card(
        3,
        "Leap",
        [Effect(EffectType.DAMAGE_REDUCTION, 1), Effect(EffectType.BLOCK, 2), Effect(EffectType.SPELL_DAMAGE, 1)],
        [Element.AIR, Element.EARTH]
    ),
    Card(
        6,
        "Ferrous Wheel",
        [Effect(EffectType.DAMAGE, 2), Effect(EffectType.DAMAGE, 2)],
        [Element.AIR, Element.EARTH]
    ),
    Card(
        8,
        "Eruption",
        [Effect(EffectType.DAMAGE, 4), Effect(EffectType.EXPERIENCE, 1)],
        [Element.FIRE, Element.EARTH]
    ),
    Card(
        3,
        "Mud Bath",
        [Effect(EffectType.HEAL, 2), Effect(EffectType.BLOCK, 3)],
        [Element.EARTH, Element.WATER]
    ),
    Card(
        4,
        "Fan the Flames",
        [Effect(EffectType.DAMAGE, 0), Effect(EffectType.SPELL_DAMAGE, 2)],
        [Element.FIRE, Element.AIR]
    ),
    Card(
        4,
        "Geyser",
        [Effect(EffectType.DAMAGE, 2), Effect(EffectType.HEAL, 2)],
        [Element.FIRE, Element.WATER] 
    ),
    Card(
        5,
        "Like Water",
        [Effect(EffectType.DAMAGE_REDUCTION, 1), Effect(EffectType.HEAL, 1), Effect(EffectType.FOCUS, 1)],
        [Element.WATER, Element.AIR]
    ) 
]

all_elements = [Element.AIR, Element.EARTH, Element.FIRE, Element.WATER]

mana_spells = [
    Card(
        3,
        "Attune",
        [Effect(EffectType.FOCUS, 1)],
        all_elements
    ),
    Card(
        6,
        "Channel",
        [Effect(EffectType.FOCUS, 2)],
        all_elements
    ),
    Card(
        8,
        "One With Nature",
        [Effect(EffectType.FOCUS, 3)],
        all_elements
    ),
    Card(
        2,
        "Infuse",
        [Effect(EffectType.MANA, 4)],
        all_elements
    ),
   Card(
        4,
        "Gather Energy",
        [Effect(EffectType.MANA, 8)],
        all_elements
    ),
       Card(
        6,
        "Burst With Power",
        [Effect(EffectType.MANA, 12)],
        all_elements
    ),
]

exp_spells = [
    Card(
        3, 
        "Practice",
        [Effect(EffectType.EXPERIENCE, 1)],
        all_elements
    ),
    Card(
        6,
        "Perfect",
        [Effect(EffectType.EXPERIENCE, 2)],
        all_elements
    ),
]

draw_spells = [
    Card(
        1, 
        "Research",
        [Effect(EffectType.DRAW, 1)],
        all_elements
    ),
    Card(
        2,
        "Meditate",
        [Effect(EffectType.DRAW, 2)],
        all_elements
    ),
        Card(
        3,
        "Concentrate",
        [Effect(EffectType.DRAW, 3)],
        all_elements
    )
]


neutral_spells = [
    Card(
        4,
        "Indomitable",
        [Effect(EffectType.DAMAGE_REDUCTION, 3)],
        all_elements
    ),
    Card(
        4,
        "Elemental Blast",
        [Effect(EffectType.DAMAGE, 2)],
        all_elements
    ),
    Card(
        6,
        "One-Two Punch",
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
    return air_spells + earth_spells + fire_spells + water_spells + two_color_spells + neutral_spells + exp_spells + mana_spells + draw_spells

def cards_by_name():
    return {card.name: card for card in cards()}

def cards():
    if LOCAL:
        # return mana_spells
        pass
    return default_cards()

def big_mana():
    cards = cards_by_name()
    return mana_spells * 3 + draw_spells * 2 + [
        cards['Firestorm'],
        cards['Firestorm'],
        cards['Firestorm'],
        cards['Conflagration'],
        cards['Conflagration'],
        cards['Earth Cocoon'],
        cards['Earth Cocoon'],
        cards['Scrying'],
        cards['Scrying'],
        cards['Mending'],
        cards['Mending'],
        cards['Inner Peace'],
        cards['Inner Peace'], 
    ] * 2, make_heroes({
        Element.AIR: 'Aang',
        Element.WATER: 'Katara',
        })
    
def burn():
    cards = cards_by_name()
    return mana_spells + [
        cards['Overextend'],
        cards['Overextend'],
        cards['Fiery Passion'],
        cards['Fiery Passion'],
        cards['All Out Attack'],
        cards['All Out Attack'],
        cards['Firestorm'],
        cards['Firestorm'],
        cards['Firestorm'],
        cards['Inner Peace'],
        cards['Inner Peace'], 
    ] * 2, make_heroes({
        Element.FIRE: 'Zuko',
        Element.AIR: 'Aang',
        })

def spell_damage():
    cards = cards_by_name()
    return mana_spells * 2 + draw_spells + [
        cards['Inner Peace'],
        cards['Inner Peace'],
        cards['Inner Peace'],
        cards['Inner Peace'],
        cards['Trip'],
        cards['Trip'],
        cards['Sanctuary'],
        cards['Sanctuary'],
        cards['Inner Fire'],
        cards['Inner Fire'],
        cards['Splash'],
        cards['Splash'],
        cards['Splash'],
        cards['Splash'],
        cards['Splash'],
        cards['Splash'],
    ], make_heroes({
        Element.FIRE: 'Iroh',
    })

def make_heroes(config={}):
    return {
        e: heroes.get(config.get(e)) or default_heroes[e] for e in Element
    }

def starter_decks():
    return {
        "big mana": big_mana(),
        "burn": burn(),
        "spell damage": spell_damage(),
    } 