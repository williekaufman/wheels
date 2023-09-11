import random

class Player():
    def __init__(self, deck, wheels):
        deck = deck.copy()
        random.shuffle(deck)
        wheels = wheels
        self.life = 20
        self.mana = 0
        self.block = 0
        self.spell_damage = 0
        self.hand = []
        self.deck = deck
    
    def draw(self):
        self.deck and self.hand.append(self.deck.pop())
    
    def new_turn(self):
        self.block = 0
        self.spell_damage = 0
        self.draw()
        
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