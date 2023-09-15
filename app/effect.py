from enum import Enum

class Effect():
    def __init__(self, type, value, synergy=False):
        self.type = type
        self.value = value
        self.synergy = synergy      
       
    def text(self):
        synergy_prefix = "SYNERGY:" if self.synergy else ""
        if self.type == EffectType.HEAL:
            return f"{synergy_prefix}{self.value} (Heal)"
        if self.type == EffectType.DAMAGE:
            return f"{synergy_prefix}{self.value} (Damage)"
        if self.type == EffectType.BLOCK:
            return f"{synergy_prefix}{self.value} (Block)"
        if self.type == EffectType.DAMAGE_REDUCTION:
            return f"{synergy_prefix}{self.value} (Damage Reduction)"
        if self.type == EffectType.MANA:
            return f"{synergy_prefix}{self.value} (Mana)"
        if self.type == EffectType.SPELL_DAMAGE:
            return f"{synergy_prefix}{self.value} (Spell Damage)"
        if self.type == EffectType.EXPERIENCE:
            return f"{synergy_prefix}{self.value} (Experience)"
        if self.type == EffectType.FOCUS:
            return f"{synergy_prefix}{self.value} (Focus)"
        if self.type == EffectType.DRAW:
            return f"{synergy_prefix}{self.value} (Draw)"

    def to_json(self):
        return {
            "type": self.type.value,
            "value": self.value,
            "synergy": self.synergy
        }
        
    def of_json(json):
        return Effect(
            EffectType(json["type"]),
            json["value"],
            json["synergy"]
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
        elif self.type == EffectType.DAMAGE_REDUCTION:
            player.gain_damage_reduction(self.value)
            return f"Gained {self.value} damage reduction"
        elif self.type == EffectType.MANA:
            player.gain_mana(self.value)
            return f"Gained {self.value} mana"
        elif self.type == EffectType.SPELL_DAMAGE:
            player.gain_spell_damage(self.value)
            return f"Gained {self.value} spell damage"
        elif self.type == EffectType.EXPERIENCE:
            player.gain_experience(self.value)
            return f"Gained {self.value} experience"
        elif self.type == EffectType.FOCUS:
            player.gain_focus(self.value)
            return f"Gained {self.value} focus"
        elif self.type == EffectType.DRAW:
            for i in range(self.value):
                player.draw()
            return f"Drew {self.value}{'' if self.value == 1 else 's'} cards"
            
   
class EffectType(Enum):
    HEAL = "heal"
    DAMAGE = "damage"
    BLOCK = "block"
    DAMAGE_REDUCTION = "damage_reduction"
    MANA = "mana"
    SPELL_DAMAGE = "spell_damage"
    EXPERIENCE = "experience"
    DRAW = "draw"
    FOCUS = "focus"
    
    def priority(self):
        return {
            EffectType.SPELL_DAMAGE: 0,
            EffectType.DAMAGE: 1,
            EffectType.HEAL: 2,
            EffectType.DAMAGE_REDUCTION: 3,
            EffectType.BLOCK: 4,
            EffectType.MANA: 5,
            EffectType.EXPERIENCE: 6,
            EffectType.DRAW: 7,
            EffectType.FOCUS: 8,
        }[self]