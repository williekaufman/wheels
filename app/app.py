#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from secrets import compare_digest, token_hex
from redis_utils import rget_json, rset_json, rset, rget
from player import Player
from card import Wheels
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
    game_id = new_game_id()
    player = Player(cards, Wheels())
    rset_json("player1", player.to_json(), game_id)
    rset_json("player2", player.to_json(), game_id)
    return jsonify({"game_id": game_id})

@app.route("/spin", methods=["POST"])
def spin():
    game_id = request.json.get("game_id")
    player = request.json.get("player")
    locks = request.json.get("locks")
    player = rget_json(player, game_id)
    if player is None:
        return make_response(jsonify({"error": "Invalid player"}), 400)
    if locks is None:
        return make_response(jsonify({"error": "No locks"}), 400)
    for element, wheel in player.wheels.items():
        if element.value not in locks:
            wheel.spin()
    rset_json(player, game_id)
    return jsonify({"player": player}) 