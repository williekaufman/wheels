#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from secrets import compare_digest, token_hex
from redis_utils import rget_json, rset_json, rset, rget
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

def new_game_id():
    return token_hex(16)

@app.route("/new_game", methods=["POST"])
def new_game():
    print(cards())
    game_id = request.json.get('gameId') or new_game_id()
    player = Player(cards(), starting_wheels())
    rset_json("player1", player.to_json(), game_id)
    rset_json("player2", player.to_json(), game_id)
    return jsonify({
        "gameId": game_id,
        "player": player.to_json() 
        })

@app.route("/state", methods=['GET'])
def state():
    game_id = request.json.get("gameId")
    playerNum = 'player' + str(request.json.get("player"))
    player = Player.of_json(rget_json(playerNum, game_id))
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    return jsonify({"player": player.to_json()})
 
@app.route("/spin", methods=["POST"])
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
    player.wheels[wheel].play(player.hand[card_index])
    rset_json(playerNum, player.to_json(), game_id)
    return jsonify({"player": player.to_json()})

@app.route("/submit", methods=['POST'])
def submit():
    game_id = request.json.get("gameId")
    playerNum = 'player' + str(request.json.get("player"))
    player = Player.of_json(rget_json(playerNum, game_id))
    opponent = Player.of_json(rget_json('player' + str(3 - request.json.get("player")), game_id))
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    player.finish_turn(opponent)
    rset_json(playerNum, player.to_json(), game_id)
    return jsonify({"player": player.to_json()}) 


if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)