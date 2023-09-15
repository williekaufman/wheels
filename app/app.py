#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from secrets import compare_digest, token_hex
from redis_utils import rget_json, rset_json, rset, rget
import traceback
from functools import wraps
from engineio.payload import Payload
from player import Player, PlayerNumber, handle_turn, Result
from element import Element
from card import starting_wheels, Card
from cards import cards

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

def get_submitted(playerNum, game_id):
    return rget(f"{playerNum.value}:submitted", game_id=game_id)

def set_submitted(player, game_id):
    rset(f"{player.value}:submitted", 'true', game_id=game_id)

def clear_submitted(playerNum, game_id):
    rset(f"{playerNum.value}:submitted", '', game_id=game_id)

def get_player(number, game_id):
    if (player := rget_json(number.value, game_id=game_id)):
        return Player.of_json(player)

def set_player(player, number, game_id):
    rset_json(number.value, player.to_json(), game_id=game_id)

def get_log(game_id):
    return rget_json('log', game_id=game_id) or []

def set_log(log, game_id):
    rset_json('log', log, game_id=game_id)

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
    return rget_json(f"decks:{username}:{deckname}")

def get_all_decks(username):
    return rget_json(f"decks:{username}") or []

@app.route("/cards", methods=["GET"])
@api_endpoint
def get_cards():
    return jsonify({
        "cards": [card.to_json() for card in cards()]
    })

@app.route("/new_game", methods=["POST"])
@api_endpoint
def new_game():
    game_id = request.json.get('gameId') or new_game_id()
    username = request.json.get('username')
    deckname = request.json.get('deckname')
    deck = get_deck(username, deckname)
    if deck is None:
        return make_response(jsonify({"error": "Unable to find deck"}), 400)
    deck = [Card.of_json(card) for card in deck] 
    player1 = Player(deck, starting_wheels(), username)
    player1.new_turn()
    set_player(player1, PlayerNumber.ONE, game_id)
    return jsonify({
        "gameId": game_id,
        "player": player1.to_json(),
        })
   
@app.route("/join_game", methods=["POST"])
@api_endpoint
def player_two():
    game_id = request.json.get('gameId')
    username = request.json.get('username')
    deckname = request.json.get('deckname')
    deck = get_deck(username, deckname)
    if deck is None:
        return { "error": "Unable to find deck" }
    if get_player(PlayerNumber.ONE, game_id) is None:
        return { "error": "Invalid game id" }
    if get_player(PlayerNumber.TWO, game_id) is not None:
        return { "error": "Game already full" }
    player = Player([Card.of_json(card) for card in deck], starting_wheels(), username)
    player.new_turn()
    set_player(player, PlayerNumber.TWO, game_id)
    return jsonify({
        "gameId": game_id,
        "player": player.to_json(),
        })
    
@app.route("/state", methods=['GET'])
@api_endpoint
def state():
    game_id = request.args.get("gameId")
    try:
        playerNum = PlayerNumber(int(request.args.get("player")))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    player = get_player(playerNum, game_id)
    opponent = get_player(playerNum.other(), game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    result = get_result(game_id)
    ret = {
        "player": player.to_json(),
        "opponent": opponent and opponent.to_json(),
        "submitted": get_submitted(playerNum, game_id),
        "log": get_log(game_id)
    }
    if result is not None:
        ret["result"] = result.to_description()
    return jsonify(ret)
 
@app.route("/spin", methods=["POST"])
@api_endpoint
def spin():
    game_id = request.json.get("gameId")
    try:
        playerNum = PlayerNumber(request.json.get("player"))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    locks = request.json.get("locks")
    player = get_player(playerNum, game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if locks is None:
        return make_response(jsonify({"error": "No locks"}), 400)
    if player.spins <= 0:
        return make_response(jsonify({"error": "No spins left"}), 400)
    if get_submitted(playerNum, game_id):
        return make_response(jsonify({"error": "Already submitted"}), 400) 
    player.spins -= 1
    for element, wheel in player.wheels.items():
        if element.value not in locks:
            wheel.spin()
    set_player(player, playerNum, game_id)
    return jsonify({"player": player.to_json()})

@app.route("/play", methods=["POST"])
@api_endpoint
def play():
    game_id = request.json.get("gameId")
    try:
        playerNum = PlayerNumber(request.json.get("player"))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    card_index = request.json.get("cardIndex")
    wheel = request.json.get("wheel")
    player = get_player(playerNum, game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if card_index is None:
        return make_response(jsonify({"error": "No card index"}), 400)
    if wheel is None:
        return make_response(jsonify({"error": "No wheel"}), 400)
    player.play(Element(wheel), card_index)
    set_player(player, playerNum, game_id)
    return jsonify({"player": player.to_json()})

@app.route("/submit", methods=['POST'])
@api_endpoint
def submit():
    game_id = request.json.get("gameId")
    try:
        playerNum = PlayerNumber(request.json.get("player"))
    except:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    opponentNum = playerNum.other()
    player = get_player(playerNum, game_id)
    opponent = get_player(opponentNum, game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if get_submitted(playerNum.other(), game_id):
        log = get_log(game_id)
        result, new_logs = handle_turn(player, opponent)
        log.extend(new_logs)
        set_log(log, game_id)
        clear_submitted(playerNum.other(), game_id)
        result and set_result(result, game_id)
        socketio.emit('update', {'gameId': game_id})
    else:
        set_submitted(playerNum, game_id)
    set_player(player, playerNum, game_id)
    set_player(opponent, opponentNum, game_id)
    return jsonify({
        "player": player.to_json(),
        "opponent": opponent and opponent.to_json(),
    })
    
@app.route('/decks', methods=['POST'])
@api_endpoint
def push_deck():
    username = request.json.get('username')
    deckname = request.json.get('deckname')
    deck = request.json.get('deck')
    if username is None:
        return { "error": "No username" }
    if not deckname:
        return { "error": "No deckname" } 
    if deck is None:
        return { "error": "No deck" }
    rset_json(f"decks:{username}:{deckname}", deck)
    add_deck(username, deckname)
    return jsonify({"success": True})

@app.route('/decks/<deckname>', methods=['GET'])
@api_endpoint
def see_deck(deckname):
    username = request.args.get('username')
    if username is None:
        return { "error": "No username" }
    return jsonify({
        "deck": get_deck(username, deckname)
    })

@app.route('/decks/delete/<deckname>', methods=['POST'])
@api_endpoint
def delete_deck(deckname):
    username = request.json.get('username')
    if username is None:
        return { "error": "No username" }
    remove_deck(username, deckname)
    rset(f"decks:{username}:{deckname}", None)
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
