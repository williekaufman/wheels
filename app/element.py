from enum import Enum
from effect import Effect, EffectType

class Element(Enum):
    AIR = "air"
    EARTH = "earth"
    WATER = "water"
    FIRE = "fire"

    def description(self):
        return {
            Element.AIR: "1 (Mana) discount",
            Element.EARTH: "+1 (Block)",
            Element.FIRE: "+1 (Damage)",
            Element.WATER: "+1 (Heal)"
        }[self]
    
    def specialty(self):
        return {
            Element.AIR: None,
            Element.EARTH: EffectType.BLOCK,
            Element.FIRE: EffectType.DAMAGE,
            Element.WATER: EffectType.HEAL 
        }[self]
        
    def adjust_effect(self, effect):
        if effect.type == self.specialty():
            effect.value += 1
            effect.synergy = True 
        
    def adjust_card(self, card):
        if self == Element.AIR and card.mana_cost > 0:
            card.mana_cost -= 1
        else:
            for effect in card.effects:
                self.adjust_effect(effect)