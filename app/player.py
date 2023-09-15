import random
import datetime
from enum import Enum
from card import Card, Element, Wheel

class Result(Enum):
    PLAYER_ONE = "player_one"
    PLAYER_TWO = "player_two"
    TIE = "tie"
    
    def to_description(self):
        return {
            Result.PLAYER_ONE: "Player One Wins",
            Result.PLAYER_TWO: "Player Two Wins",
            Result.TIE: "Tie"
        }[self]
        

def resolve_wheel(player, opponent, element):
    wheel = player.wheels[element]
    log = wheel.resolve(player, opponent)
    time = datetime.datetime.now().strftime("%H:%M:%S")
    return f'{time}:{player.username}:{element.value}:{log}'

def check_game_over(player, opponent):
    if player.life <= 0 and opponent.life <= 0:
        return Result.TIE
    elif player.life <= 0:
        return Result.PLAYER_TWO
    elif opponent.life <= 0:
        return Result.PLAYER_ONE
    else:
        return None 

def handle_turn(player, opponent):
    log = []
    for element in Element:
        if (result := check_game_over(player, opponent)):
            log.append(result.to_description())
            return result, log
        args = [player, opponent]
        if random.random() > .5:
            args = [opponent, player]
        log.append(resolve_wheel(*args, element))
        log.append(resolve_wheel(*reversed(args), element))
    player.new_turn()
    opponent.new_turn()
    return None, log

class PlayerNumber(Enum):
    ONE = 1
    TWO = 2
    
    def other(self):
        return PlayerNumber(3 - self.value)

class Player():
    def __init__(self, deck, wheels, username, life=20, mana=0, block=0, damage_reduction=0, experience=0, focus=0, spell_damage=0, hand=[], spins=3):
        deck = [card for card in deck]
        random.shuffle(deck)
        self.wheels = wheels.copy()
        self.username = username
        self.life = life
        self.mana = mana
        self.block = block
        self.damage_reduction = damage_reduction
        self.experience = experience
        self.focus = focus
        self.spell_damage = spell_damage
        self.hand = [card for card in hand]
        self.deck = deck
        self.spins = spins
   
    def to_json(self):
        return {
            "life": self.life,
            "mana": self.mana,
            "block": self.block,
            "damage_reduction": self.damage_reduction,
            "experience": self.experience,
            "focus": self.focus,
            "spell_damage": self.spell_damage,
            "hand": [card.to_json() for card in self.hand],
            "deck": [card.to_json() for card in self.deck],
            "wheels": {e.value: wheel.to_json() for e, wheel in self.wheels.items()},
            "username": self.username,
            "spins": self.spins
        }
        
    def of_json(json):
        args = {
            "username": json["username"],
            "life": json["life"],
            "mana": json["mana"],
            "block": json["block"],
            "damage_reduction": json["damage_reduction"],
            "experience": json["experience"],
            "focus": json["focus"],
            "spell_damage": json["spell_damage"],
            "hand": [Card.of_json(card) for card in json["hand"]],
            "deck": [Card.of_json(card) for card in json["deck"]],
            "wheels": {Element(e): Wheel.of_json(wheel) for e, wheel in json["wheels"].items()},
            "spins": json["spins"]
        }
        return Player(**args)
    
    def play(self, wheel, card_index):
        if self.wheels[wheel].play(self.hand[card_index]):
            self.hand = self.hand[:card_index] + self.hand[card_index + 1:]
    
    def draw(self, n = 1):
        for i in range(n):
            self.deck and self.hand.append(self.deck.pop())
      
    def new_turn(self):
        self.block = 0
        self.damage_reduction = 0
        for wheel in self.wheels.values():
            wheel.spin()
        self.spins = 3 + self.experience
        self.mana += self.focus
        self.draw()
   
    def finish_turn(self, opponent):
        log = []
        for wheel in self.wheels.values():
            log.append(wheel.resolve(self, opponent))
            wheel.spin()
        self.new_turn()
        return log
       
    def gain_life(self, amount):
        self.life += amount
        
    def take_damage(self, amount):
        amount = max(0, amount - self.damage_reduction)
        if self.block >= amount:
            self.block -= amount
            return amount
        else:
            ret = self.block
            self.life -= amount - self.block
            self.block = 0
            return ret
    
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
        
    def gain_damage_reduction(self, amount):
        self.damage_reduction += amount
       
    def gain_experience(self, amount):
        self.experience += amount
        
    def gain_focus(self, amount):
        self.focus += amount
         
    def gain_spell_damage(self, amount):
        self.spell_damage += amount