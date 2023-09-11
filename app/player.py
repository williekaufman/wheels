import random
from card import Card, Element, Wheel

class Player():
    def __init__(self, deck, wheels, life=20, mana=0, block=0, spell_damage=0, hand=[]):
        deck = deck.copy()
        random.shuffle(deck)
        self.wheels = wheels
        self.life = 20
        self.mana = 0
        self.block = 0
        self.spell_damage = 0
        self.hand = []
        self.deck = deck
   
    def to_json(self):
        return {
            "life": self.life,
            "mana": self.mana,
            "block": self.block,
            "spell_damage": self.spell_damage,
            "hand": [card.to_json() for card in self.hand],
            "deck": [card.to_json() for card in self.deck],
            "wheels": {e.value: wheel.to_json() for e, wheel in self.wheels.items()}
        }
        
    def of_json(json):
        return Player(
            [Card.of_json(card) for card in json["deck"]],
            {Element(e): Wheel.of_json(wheel) for e, wheel in json["wheels"].items()},
            json["life"],
            json["mana"],
            json["block"],
            json["spell_damage"],
            [Card.of_json(card) for card in json["hand"]]
        )
    
    def draw(self):
        self.deck and self.hand.append(self.deck.pop())
      
    def new_turn(self):
        self.block = 0
        self.spell_damage = 0
        self.draw()
   
    def finish_turn(self, opponent):
        for wheel in self.wheels.values():
            wheel.resolve(self, opponent)
            wheel.spin()
        self.new_turn()
       
    def gain_life(self, amount):
        self.life += amount
        
    def take_damage(self, amount):
        if self.block >= amount:
            self.block -= amount
        else:
            self.life -= amount - self.block
            self.block = 0
    
    def pay_mana(self, amount):
        if self.mana >= amount:
            self.mana -= amount
            return True
        else:
            return False
    
    def gain_mana(self, amount):
        self.mana += amount
        
    def gain_block(self, amount):
        self.block += amount
        
    def gain_spell_damage(self, amount):
        self.spell_damage += amount