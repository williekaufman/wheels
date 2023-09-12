#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from secrets import compare_digest, token_hex
from redis_utils import rget_json, rset_json, rset, rget
import traceback
from functools import wraps
from player import Player
from card import starting_wheels, Element
from cards import cards

app = Flask(__name__)
socketio = SocketIO(app)
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

@app.route("/new_game", methods=["POST"])
@api_endpoint
def new_game():
    game_id = request.json.get('gameId') or new_game_id()
    player1 = Player(cards(), starting_wheels())
    player2 = Player(cards(), starting_wheels())
    player1.new_turn()
    player2.new_turn()
    rset_json("player1", player1.to_json(), game_id)
    rset_json("player2", player2.to_json(), game_id)
    return jsonify({
        "gameId": game_id,
        "player": player1.to_json(),
        "opponent": player2.to_json()
        })

@app.route("/state", methods=['GET'])
@api_endpoint
def state():
    game_id = request.json.get("gameId")
    playerNum = 'player' + str(request.json.get("player"))
    player = Player.of_json(rget_json(playerNum, game_id))
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    return jsonify({"player": player.to_json()})
 
@app.route("/spin", methods=["POST"])
@api_endpoint
def spin():
    game_id = request.json.get("gameId")
    playerNum = 'player' + str(request.json.get("player"))
    locks = request.json.get("locks")
    player = Player.of_json(rget_json(playerNum, game_id))
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if locks is None:
        return make_response(jsonify({"error": "No locks"}), 400)
    for element, wheel in player.wheels.items():
        if element.value not in locks:
            wheel.spin()
    rset_json(playerNum, player.to_json(), game_id)
    return jsonify({"player": player.to_json()})

@app.route("/play", methods=["POST"])
@api_endpoint
def play():
    game_id = request.json.get("gameId")
    playerNum = 'player' + str(request.json.get("player"))
    card_index = request.json.get("cardIndex")
    wheel = request.json.get("wheel")
    player = Player.of_json(rget_json(playerNum, game_id))
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if card_index is None:
        return make_response(jsonify({"error": "No card index"}), 400)
    if wheel is None:
        return make_response(jsonify({"error": "No wheel"}), 400)
    player.play(Element(wheel), card_index)
    rset_json(playerNum, player.to_json(), game_id)
    return jsonify({"player": player.to_json()})

@app.route("/submit", methods=['POST'])
@api_endpoint
def submit():
    game_id = request.json.get("gameId")
    playerNum = 'player' + str(request.json.get("player"))
    player = Player.of_json(rget_json(playerNum, game_id))
    opponent = Player.of_json(rget_json('player' + str(3 - request.json.get("player")), game_id))
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    log = player.finish_turn(opponent)
    rset_json(playerNum, player.to_json(), game_id)
    rset_json('player' + str(3 - request.json.get("player")), opponent.to_json(), game_id) 
    return jsonify({
        "player": player.to_json(),
        "opponent": opponent.to_json(),
        "log": log
    })


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)