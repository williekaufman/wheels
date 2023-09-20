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
    card, log = wheel.resolve(player, opponent)
    time = datetime.datetime.now().strftime("%H:%M:%S")
    return card, f'{time}:{player.username}:{element.value}:{log}'


def check_game_over(player, opponent):
    if player.get('life') <= 0:
        return Result.TIE if opponent.get('life') <= 0 else Result.PLAYER_TWO
    return Result.PLAYER_ONE if opponent.get('life') <= 0 else None

def handle_turn(player, opponent):
    logs = []
    cards = []
    for element in Element:
        args = [player, opponent]
        r = False
        if random.random() > .5:
            args = [opponent, player]
            r = True
        card, log = resolve_wheel(*args, element)
        card['player'] = 'playerOne' if r else 'playerTwo'
        card['log'] = log
        cards.append(card)
        logs.append(log)
        card, log = resolve_wheel(*reversed(args), element)
        cards.append(card)
        card['player'] = 'playerTwo' if r else 'playerOne'
        card['log'] = log
        logs.append(log)
        if (result := check_game_over(player, opponent)):
            logs.append(result.to_description())
            return result, cards, logs 
    player.new_turn()
    opponent.new_turn()
    return None, cards, logs

class PlayerNumber(Enum):
    ONE = 1
    TWO = 2
    
    def other(self):
        return PlayerNumber(3 - self.value)

def fresh_state():
    return {
        'spell_damage': 0,
        'damage_reduction': 0,
        'block': 0,
        'spins': 3,
    }

class Player():
    def __init__(
        self, 
        deck, 
        wheels, 
        username, 
        hand=[], 
        permanent_state={
            'life': 20,
            'mana': 0,
            'experience': 0,
            'focus': 0,
            }, 
        state=fresh_state()):
        deck = [card for card in deck]
        random.shuffle(deck)
        self.deck = deck
        self.hand = [card for card in hand]
        self.wheels = wheels.copy()
        self.permament_state = permanent_state
        self.state = state
        self.username = username

    def get(self, key):
        if self.state.get(key) is not None:
            return self.state[key]
        return self.permament_state.get(key) or 0
    
    def set(self, key, value):
        if self.state.get(key) is not None:
            self.state[key] = value
        else:
            self.permament_state[key] = value
    
    def add(self, key, value):
        if self.state.get(key) is not None:
            self.state[key] += value
        else:
            self.permament_state[key] += value
            
    def add_nonnegative(self, key, value):
        if self.state.get(key) is not None:
            self.state[key] = max(0, self.state[key] + value)
        else:
            self.permament_state[key] = max(0, self.permament_state[key] + value)
    
    def diff(self, other):
        return {
            'life': self.get('life') - other.get('life'),
            'mana': self.get('mana') - other.get('mana'),
            'focus': self.get('focus') - other.get('focus'),
            'experience': self.get('experience') - other.get('experience'),
        }
   
    def to_json(self):
        return {
            "deck": [card.to_json() for card in self.deck],
            "hand": [card.to_json() for card in self.hand],
            "wheels": {e.value: wheel.to_json() for e, wheel in self.wheels.items()},
            "username": self.username,
            "state": self.state,
            "permanentState": self.permament_state,
        }
        
    def of_json(json):
        args = {
            "deck": [Card.of_json(card) for card in json["deck"]], 
            "hand": [Card.of_json(card) for card in json["hand"]], 
            "wheels": {Element(e): Wheel.of_json(wheel) for e, wheel in json["wheels"].items()},
            "username": json["username"],
            "state": json["state"],
            "permanent_state": json["permanentState"],
        }
        return Player(**args)
    
    def play(self, wheel, card_index):
        if self.wheels[wheel].play(self.hand[card_index]):
            self.hand = self.hand[:card_index] + self.hand[card_index + 1:]
    
    def draw(self, n = 1):
        for i in range(n):
            self.deck and self.hand.append(self.deck.pop())

    def start_of_game(self):
        self.draw()
        self.draw()
        for wheel in self.wheels.values():
            wheel.hero.start_of_game and wheel.hero.start_of_game(self)
      
    def new_turn(self, first_turn=False):
        self.permament_state['mana'] += self.get('focus')
        self.state = fresh_state()
        self.state['spins'] = 3 + self.get('experience') 
        self.draw()
        for wheel in self.wheels.values():
            wheel.spin()
            if not first_turn:
                wheel.hero.every_turn and wheel.hero.every_turn(self)
 
    def finish_turn(self, opponent):
        log = []
        for wheel in self.wheels.values():
            log.append(wheel.resolve(self, opponent))
            wheel.spin()
        self.new_turn()
        return log

    def gain(self, key, amount):
        if self.state.get(key) is not None:
            self.state[key] += amount
        else:
            self.permament_state[key] += amount

    def take_damage(self, amount):
        amount = max(0, amount - self.get('damage_reduction'))
        if self.get('block') >= amount:
            self.add('block', -amount)
            return amount
        else:
            ret = self.get('block')
            self.add('life', -(amount - ret))
            self.set('block', 0)
            return ret
    
    def pay_mana(self, amount):
        if self.get('mana') >= amount:
            self.add('mana', -amount)
            return True
        else:
            return False