from enum import Enum

class Effect():
    def __init__(self, type, value):
        self.type = type
        self.value = value
       
    def text(self):
        if self.type == EffectType.HEAL:
            return f"{self.value} (Heal)"
        if self.type == EffectType.DAMAGE:
            return f"{self.value} (Damage)"
        if self.type == EffectType.BLOCK:
            return f"{self.value} (Block)"
        if self.type == EffectType.MANA:
            return f"{self.value} (Mana)"
        if self.type == EffectType.SPELL_DAMAGE:
            return f"{self.value} (Spell Damage)"
        
 

    def to_json(self):
        return {
            "type": self.type.value,
            "value": self.value
        }
        
    def of_json(json):
        return Effect(
            EffectType(json["type"]),
            json["value"]
        )
              

    def resolve(self, player, opponent):
        if self.type == EffectType.HEAL:
            player.gain_life(self.value)
            return f"Healed {self.value}"
        elif self.type == EffectType.DAMAGE:
            blocked_damage = opponent.take_damage(self.value + player.spell_damage)
            return f"Dealt {self.value} base, {player.spell_damage} spell damage, of which {blocked_damage} was blocked"
        elif self.type == EffectType.BLOCK:
            player.gain_block(self.value)
            return f"Blocked for {self.value}"
        elif self.type == EffectType.MANA:
            player.gain_mana(self.value)
            return f"Gained {self.value} mana"
        elif self.type == EffectType.SPELL_DAMAGE:
            player.gain_spell_damage(self.value)
            return f"Gained {self.value} spell damage"
   
class EffectType(Enum):
    HEAL = "heal"
    DAMAGE = "damage"
    BLOCK = "block"
    MANA = "mana"
    SPELL_DAMAGE = "spell_damage"