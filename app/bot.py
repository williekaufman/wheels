import random
from element import Element
from effect import Effect, EffectType

def play_hand(player):
    for i in reversed(range(len(player.hand))):
        num_cards = {e: len([c for c in player.wheels[e].cards if c]) for e in Element}
        card = player.hand[i]
        element = sorted(card.elements, key=lambda e: num_cards[e])[0]
        player.play(element, 0)  

def should_lock(player, wheel):
    scores = [score(player, card) for card in wheel.cards]
    avg, max_score = sum(scores) / 10, max(scores)
    percentile = (player.get('spins') - 1) / (player.get('spins') + 1)
    return scores[wheel.active] >= avg + percentile * (max_score - avg)

def make_locks(player):
    return [k for k, v in player.wheels.items() if should_lock(player, v)]

def score(player, card):
    if not card or card.mana_cost > player.get('mana'):
        return 0
    return sum(e.worth() for e in card.effects) - card.mana_cost

def take_ai_turn(player):
    play_hand(player)
    while player.get('spins') > 0:
        locks = make_locks(player)
        for element, wheel in player.wheels.items():
            if element not in locks:
                wheel.spin()
        player.add('spins', -1)