import os
from flask import Flask, send_from_directory, json, session
from flask_socketio import SocketIO
from flask_cors import CORS
import json

app = Flask(__name__, static_folder='./build/static')

cors = CORS(app, resources={r"/*": {"origins": "*"}})

socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)

session_player = []
session_spectator = []
reset_game = {
    "p1" : False,
    "p2" : False
}

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

@socketio.on('connect')
def on_connect():
    print('User connected!')

@socketio.on('disconnect')
def on_disconnect():
    print('User disconnected!')

@socketio.on('assigne')
def assigne_users(data): 
    user = str(data['val'])
    
    if len(session_player) < 2:
        session_player.append(user)
        if session_player[0] == user:
            data = session_player[0]
            socketio.emit('first_turns', data, broadcast=True, include_self=True)
        socketio.emit('assigne_players', session_player, broadcast=True, include_self=True)
        
    else:
        session_spectator.append(user)
        socketio.emit('assigne_spectator', session_spectator, broadcast=True, include_self=True)

@socketio.on('turns_update')
def update(data):
    socketio.emit('turns_update', data, broadcast=True, include_self=True)

@socketio.on('clicked')
def on_clicked(data): 
    socketio.emit('clicked', data, broadcast=True, include_self=False)

@socketio.on('winner')
def winner_user(data):
    socketio.emit('winner', data, broadcast=True, include_self=True)

@socketio.on('draw')
def draw(data):
    socketio.emit('draw', data, broadcast=True, include_self=False)

@socketio.on('reset')
def reset(data):
    user = str(data['user'])
    if user == session_player[0]:
        reset_game["p1"] = True
    if user == session_player[1]:
        reset_game["p2"] = True
    if reset_game["p1"] == True and reset_game["p2"] == True:
        reset_game["p1"] = False
        reset_game["p2"] = False
        socketio.emit('reset', data, broadcast=True, include_self=True)

socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)
