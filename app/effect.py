from enum import Enum

class Effect():
    def __init__(self, type, value):
        self.type = type
        self.value = value
       
    @property
    def type(self):
        return self._type

    @type.setter
    def type(self, value):
        if isinstance(value, EffectType):
            self._type = value
        else:
            self._type = EffectType(value)
    
    @property
    def value(self):
        return self._value

    @value.setter
    def value(self, value):
        if isinstance(value, int):
            self._value = value
        else:
            self._value = int(value)

    def to_json(self):
        return {
            "type": self.type.value,
            "value": self.value
        }
        
    def of_json(json):
        return Effect(
            json["type"],
            json["value"]
        )

    def resolve(self, player, opponent):
        if self.type == EffectType.HEAL:
            player.gain_life(self.value)
        elif self.type == EffectType.DAMAGE:
            opponent.take_damage(self.value + player.spell_damage)
        elif self.type == EffectType.BLOCK:
            player.gain_block(self.value)
        elif self.type == EffectType.MANA:
            player.gain_mana(self.value)
        elif self.type == EffectType.SPELL_DAMAGE:
            player.gain_spell_damage(self.value)
   
class EffectType(Enum):
    HEAL = "heal"
    DAMAGE = "damage"
    BLOCK = "block"
    MANA = "mana"
    SPELL_DAMAGE = "spell_damage"