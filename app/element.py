from enum import Enum
from effect import Effect, EffectType    

class Element(Enum):
    AIR = "air"
    EARTH = "earth"
    FIRE = "fire"
    WATER = "water"

    def description(self):
        return {
            Element.AIR: "1 (Mana) discount",
            Element.EARTH: "+1 (Block)",
            Element.FIRE: "+1 (Damage)",
            Element.WATER: "+1 (Heal)"
        }[self]