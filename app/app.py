#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from secrets import compare_digest, token_hex
from redis_utils import redis, rget_json, rset_json, rset, rget
import traceback
from functools import wraps
from engineio.payload import Payload
from player import Player, PlayerNumber, handle_turn, Result
from element import Element
from hero import default_heroes, heroes
from bot import take_ai_turn
from card import starting_wheels, Card
from cards import cards, starter_decks

Payload.max_decode_packets = 100

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")
CORS(app)

def recurse_to_json(obj):
    if isinstance(obj, dict):
        return {k: recurse_to_json(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [recurse_to_json(v) for v in obj]
    elif hasattr(obj, 'to_json'):
        return obj.to_json()
    else:
        return obj

# decorator that takes in an api endpoint and calls recurse_to_json on its result
def api_endpoint(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        try: 
            return func(*args, **kwargs)
        except Exception as e:
            print(traceback.print_exc())
            return jsonify({"error": "Unexpected error"}), 500

    return wrapper

def new_game_id():
    return token_hex(16)

def get_result(game_id):
    try:
        return Result(rget('result', game_id=game_id))
    except:
        return None

def set_result(result, game_id):
    rset('result', result.value, game_id=game_id)

def get_submitted(player_num, game_id):
    return rget(f"{player_num.value}:submitted", game_id=game_id)

def set_submitted(player, game_id):
    rset(f"{player.value}:submitted", 'true', game_id=game_id)

def clear_submitted(player_num, game_id):
    rset(f"{player_num.value}:submitted", '', game_id=game_id)

def get_player(number, game_id):
    if (player := rget_json(number.value, game_id=game_id)):
        return Player.of_json(player)

def set_player(player, number, game_id):
    rset_json(number.value, player.to_json(), game_id=game_id)

def get_log(game_id):
    return rget_json('log', game_id=game_id) or []

def set_log(log, game_id):
    rset_json('log', log, game_id=game_id)

def get_last_turn(game_id):
    return rget_json('last_turn', game_id=game_id)

def set_last_turn(cards, game_id):
    rset_json('last_turn', cards, game_id=game_id)

def add_deck(username, deckname):
    current_decks = rget_json(f"decks:{username}") or []
    if deckname not in current_decks:
        current_decks.append(deckname)
    rset_json(f"decks:{username}", current_decks)

def remove_deck(username, deckname):
    current_decks = rget_json(f"decks:{username}") or []
    current_decks.remove(deckname)
    rset_json(f"decks:{username}", current_decks)
    
def get_deck(username, deckname):
    if (starter_deck := starter_decks().get(deckname)):
        return [Card.to_json(card) for card in starter_deck[0]]
    return rget_json(f"decks:{username}:{deckname}")

def get_heroes(username, deckname):
    if (custom_heroes := rget_json(f"heroes:{username}:{deckname}")):
        return {Element(k): heroes[v] for k, v in custom_heroes.items()}
    if (starter_deck := starter_decks().get(deckname)):
        return starter_deck[1]
    return default_heroes

def get_all_decks(username):
    return list(starter_decks().keys()) + (rget_json(f"decks:{username}") or [])

@app.route("/cards", methods=["GET"])
@api_endpoint
def get_cards():
    return jsonify({
        "cards": [card.to_json() for card in cards()]
    })
    
@app.route("/rematch", methods=["GET"])
@api_endpoint
def rematch_params():
    game_id = request.args.get('gameId')
    player_num = request.args.get('player')
    try:
        player_num = PlayerNumber(int(player_num))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if player_num == PlayerNumber.ONE:
        rematch_params = rget_json(f'rematch:{PlayerNumber.ONE.value}', game_id=game_id)
    else:
        print('p2')
        rematch_params = rget_json(f'rematch:{PlayerNumber.TWO.value}', game_id=game_id)
    rematch_params['gameId'] = rget('rematch:game_id', game_id=game_id)
    return jsonify(rematch_params)

@app.route("/join_game", methods=["POST"])
@api_endpoint
def player_two():
    game_id = request.json.get('gameId') or new_game_id()
    username = request.json.get('username')
    deckname = request.json.get('deckname')
    ai = request.json.get('ai')
    deck = get_deck(username, deckname)
    heroes = get_heroes(username, deckname)
    if deck is None:
        return { "error": "Unable to find deck" }
    if get_player(PlayerNumber.ONE, game_id):
        if get_player(PlayerNumber.TWO, game_id):
            return { "error": "Game already full" }
        player_num = PlayerNumber.TWO
    else:
        player_num = PlayerNumber.ONE
    deck = [Card.of_json(card) for card in deck]
    player = Player(deck, starting_wheels(heroes), username)
    player.start_of_game()
    player.new_turn(True)
    set_player(player, player_num, game_id)
    if ai:
        player = Player(deck, starting_wheels(heroes), 'Jeeves')
        player.start_of_game()
        player.new_turn(True)
        set_player(player, player_num.other(), game_id)
        print('ai opponent')
        rset('ai', 'true', game_id=game_id)
    socketio.emit('update', {'gameId': game_id})
    rematch_params = {
        'username': username,
        'deckname': deckname,
    }
    if rget('rematch:game_id', game_id=game_id) is None:
        rset('rematch:game_id', new_game_id(), game_id=game_id)
    rset_json(f'rematch:{player_num.value}', rematch_params, game_id=game_id)
    return jsonify({
        "gameId": game_id,
        "player": player.to_json(),
        "playerNum": player_num.value, 
        })
    
@app.route("/state", methods=['GET'])
@api_endpoint
def state():
    game_id = request.args.get("gameId")
    try:
        player_num = PlayerNumber(int(request.args.get("player")))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    player = get_player(player_num, game_id)
    opponent = get_player(player_num.other(), game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    result = get_result(game_id)
    last_turn = get_last_turn(game_id)
    ret = {
        "player": player.to_json(),
        "opponent": opponent and opponent.to_json(),
        "submitted": get_submitted(player_num, game_id),
        "log": get_log(game_id),
        "lastTurn": last_turn, 
    }
    if result is not None:
        ret["result"] = result.to_description()
    return jsonify(ret)
 
@app.route("/spin", methods=["POST"])
@api_endpoint
def spin():
    game_id = request.json.get("gameId")
    try:
        player_num = PlayerNumber(request.json.get("player"))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    locks = request.json.get("locks")
    player = get_player(player_num, game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if locks is None:
        return make_response(jsonify({"error": "No locks"}), 400)
    if player.get('spins') <= 0:
        return make_response(jsonify({"error": "No spins left"}), 400)
    if get_submitted(player_num, game_id):
        return make_response(jsonify({"error": "Already submitted"}), 400) 
    player.add('spins', -1)
    for element, wheel in player.wheels.items():
        if element.value not in locks:
            wheel.spin()
    set_player(player, player_num, game_id)
    return jsonify({"player": player.to_json()})

@app.route("/play", methods=["POST"])
@api_endpoint
def play():
    game_id = request.json.get("gameId")
    try:
        player_num = PlayerNumber(request.json.get("player"))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    card_index = request.json.get("cardIndex")
    wheel = request.json.get("wheel")
    player = get_player(player_num, game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if card_index is None:
        return make_response(jsonify({"error": "No card index"}), 400)
    if wheel is None:
        return make_response(jsonify({"error": "No wheel"}), 400)
    player.play(Element(wheel), card_index)
    set_player(player, player_num, game_id)
    return jsonify({"player": player.to_json()})

@app.route("/submit", methods=['POST'])
@api_endpoint
def submit():
    print('submitting')
    game_id = request.json.get("gameId")
    try:
        player_num = PlayerNumber(request.json.get("player"))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    player_one = get_player(PlayerNumber.ONE, game_id)
    player_two = get_player(PlayerNumber.TWO, game_id)
    player = player_one if player_num == PlayerNumber.ONE else player_two
    opponent = player_one if player_num == PlayerNumber.TWO else player_two
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if rget('ai', game_id=game_id):
        take_ai_turn(opponent)
        set_submitted(player_num.other(), game_id) 
    if get_submitted(player_num.other(), game_id):
        log = get_log(game_id)
        player_one_copy = get_player(PlayerNumber.ONE, game_id)
        player_two_copy = get_player(PlayerNumber.TWO, game_id)
        result, cards, new_logs = handle_turn(player_one, player_two)
        log.extend(new_logs)
        set_log(log, game_id)
        for card in cards:
            if (card['card'] is not None):
                card['card'] = card['card'].to_json()
        last_turn = {
            'cards': cards,
            'player1Diff': player_one.diff(player_one_copy),
            'player2Diff': player_two.diff(player_two_copy),
        }
        set_last_turn(last_turn, game_id)
        clear_submitted(player_num.other(), game_id)
        result and set_result(result, game_id)
        set_player(player_one, PlayerNumber.ONE, game_id)
        set_player(player_two, PlayerNumber.TWO, game_id)
        socketio.emit('update', {'gameId': game_id})
    else:
        set_submitted(player_num, game_id)
    return jsonify({
        "player": player.to_json(),
        "opponent": opponent and opponent.to_json(),
    })
    
@app.route('/starter_decks', methods=['GET'])
@api_endpoint
def get_starter_decks():
    return jsonify({
        "decks": list(starter_decks().keys())
    }) 
    
@app.route('/decks', methods=['POST'])
@api_endpoint
def push_deck():
    username = request.json.get('username')
    deckname = request.json.get('deckname')
    deck = request.json.get('deck')
    heroes = request.json.get('heroes')
    if username is None:
        return { "error": "No username" }
    if not deckname:
        return { "error": "No deckname" } 
    if deck is None:
        return { "error": "No deck" }
    if deckname in starter_decks():
        return { "error": "Can't overwrite starter deck" }
    rset_json(f"decks:{username}:{deckname}", deck)
    rset_json(f"heroes:{username}:{deckname}", heroes)
    add_deck(username, deckname)
    return jsonify({"success": True})

@app.route('/decks/<deckname>', methods=['GET'])
@api_endpoint
def see_deck(deckname):
    username = request.args.get('username')
    if username is None:
        return { "error": "No username" }
    return jsonify({
        "deck": get_deck(username, deckname),
        "heroes": {k.value: v.to_json() for k, v in get_heroes(username, deckname).items()}
    })

@app.route('/decks/delete/<deckname>', methods=['POST'])
@api_endpoint
def delete_deck(deckname):
    username = request.json.get('username')
    if username is None:
        return { "error": "No username" }
    if deckname in starter_decks():
        return { "error": "Can't delete starter deck" }
    remove_deck(username, deckname)
    redis.delete(f"decks:{username}:{deckname}")
    redis.delete(f"heroes:{username}:{deckname}")
    return jsonify({"success": True})

@app.route('/decks', methods=['GET'])
@api_endpoint
def get_decknames():
    username = request.args.get('username')
    if username is None:
        return { "error": "No username" }
    return jsonify({
        "decks": get_all_decks(username)
    })
    
    
@app.route('/hero', methods=['GET'])
@api_endpoint
def get_hero():
    hero = request.args.get('hero')
    if hero is None:
        return { "error": "No hero" }
    return jsonify({
        "hero": heroes[hero].to_json()
    })

@app.route('/heroes', methods=['GET'])
@api_endpoint
def get_heroes_list():
    element = request.args.get('element')
    if element is None:
        return jsonify({
            "defaultHeroes": {k.value: v.to_json() for k, v in default_heroes.items()}, 
            "heroes": {k: v.to_json() for k, v in heroes.items()}
        })
    return jsonify({
        "defaultHeroes": {k.value: v.to_json() for k, v in default_heroes.items() if k == Element(element)},
        "heroes": {k: v.to_json() for k, v in heroes.items() if v.element == Element(element)}
    })

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
     
@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5010, debug=True)
