#!/usr/bin/python3

from flask import Flask, jsonify, request, make_response, render_template
from flask_socketio import SocketIO, send, emit, join_room, leave_room
from flask_cors import CORS, cross_origin
from secrets import compare_digest, token_hex
from redis_utils import rget_json, rset_json, rset, rget
import traceback
from functools import wraps
from player import Player, PlayerNumber, handle_turn, Result
from card import starting_wheels, Element
from cards import cards

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
    return Player.of_json(rget_json(number.value, game_id=game_id))

def set_player(player, number, game_id):
    rset_json(number.value, player.to_json(), game_id=game_id)

def get_log(game_id):
    return rget_json('log', game_id=game_id) or []

def set_log(log, game_id):
    rset_json('log', log, game_id=game_id)

@app.route("/new_game", methods=["POST"])
@api_endpoint
def new_game():
    game_id = request.json.get('gameId') or new_game_id()
    player1 = Player(cards(), starting_wheels(), 'player1')
    player2 = Player(cards(), starting_wheels(), 'player2')
    player1.new_turn()
    player2.new_turn()
    set_player(player1, PlayerNumber.ONE, game_id)
    set_player(player2, PlayerNumber.TWO, game_id)
    return jsonify({
        "gameId": game_id,
        "player": player1.to_json(),
        })
    
@app.route("/join_game", methods=["POST"])
@api_endpoint
def join_game():
    game_id = request.json.get('gameId')
    player = get_player(PlayerNumber.TWO, game_id)
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
        "opponent": opponent.to_json(),
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
        "opponent": opponent.to_json(),
    })

@socketio.on('join')
def on_join(data):
    room = data['room']
    join_room(room)
    print('joined room')
     
@socketio.on('leave')
def on_leave(data):
    room = data['room']
    leave_room(room)
    print('left room')
    
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)