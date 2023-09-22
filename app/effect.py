from enum import Enum

class Synergy(Enum):
    POSITIVE = 'positive'
    NEGATIVE = 'negative' 
    NEUTRAL = 'neutral'
    
    def to_prefix(self):
        return {
            Synergy.POSITIVE: "SYNERGY:",
            Synergy.NEGATIVE: "ANTI:",
            Synergy.NEUTRAL: ""
        }[self]
        
class Effect():
    def __init__(self, type, value, element=None, synergy=Synergy.NEUTRAL):
        self.type = type
        self.value = value
        self.synergy = synergy      

    def copy(self):
        return Effect(self.type, self.value, self.synergy)

    def text(self):
        synergy_prefix = self.synergy.to_prefix()
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
            "synergy": self.synergy.value
        }
        
    def of_json(json):
        return Effect(
            EffectType(json["type"]),
            json["value"],
            Synergy(json["synergy"])
        )
        
    def resolve(self, player, opponent):
        if self.type == EffectType.HEAL:
            player.gain('life', self.value)
            return f"Healed {self.value}"
        elif self.type == EffectType.DAMAGE:
            blocked_damage = opponent.take_damage(self.value + player.get('spell_damage'))
            return f"Dealt {self.value} base, {player.get('spell_damage')} spell damage, of which {blocked_damage} was blocked"
        elif self.type == EffectType.BLOCK:
            player.gain('block', self.value)
            return f"Blocked for {self.value}"
        elif self.type == EffectType.DAMAGE_REDUCTION:
            player.gain('damage_reduction', self.value)
            return f"Gained {self.value} damage reduction"
        elif self.type == EffectType.MANA:
            player.gain('mana', self.value)
            return f"Gained {self.value} mana"
        elif self.type == EffectType.SPELL_DAMAGE:
            player.gain('spell_damage', self.value)
            return f"Gained {self.value} spell damage"
        elif self.type == EffectType.EXPERIENCE:
            player.gain('experience', self.value)
            return f"Gained {self.value} experience"
        elif self.type == EffectType.FOCUS:
            player.gain('focus', self.value)
            return f"Gained {self.value} focus"
        elif self.type == EffectType.DRAW:
            for i in range(self.value):
                player.draw()
            return f"Drew {self.value}{'' if self.value == 1 else 's'} cards"
        
    def worth(self):
        return self.type.worth() * self.value          
   
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

    def worth(self):
        return {
            EffectType.SPELL_DAMAGE: 1,
            EffectType.DAMAGE: 1.5,
            EffectType.HEAL: 1.5,
            EffectType.DAMAGE_REDUCTION: 1,
            EffectType.BLOCK: .8,
            EffectType.MANA: 1,
            EffectType.EXPERIENCE: 1.5,
            EffectType.DRAW: 2.5,
            EffectType.FOCUS: 3,
        }[self]