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

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

# When a client connects from this Socket connection, this function is run
@socketio.on('connect')
def on_connect():
    print('User connected!')

# When a client disconnects from this Socket connection, this function is run
@socketio.on('disconnect')
def on_disconnect():
    print('User disconnected!')

@socketio.on('assigne')
def assigne_users(data): 
    print(str(data))
    user = str(data['val'])
    
    if len(session_player) < 2:
        session_player.append(user)
        if session_player[0] == user:
            data = session_player[0]
            socketio.emit('first_turns', data, broadcast=True, include_self=True)
        socketio.emit('assigne_players', session_player, broadcast=True, include_self=True)
        
    else:
        session_spectator.append(user)
        print("session_spectator: " + str(session_spectator))
        socketio.emit('assigne_spectator', session_spectator, broadcast=True, include_self=True)

@socketio.on('turns_update')
def update(data):
    print("Updatig the turn: " + str(data))
    socketio.emit('turns_update', data, broadcast=True, include_self=True)


@socketio.on('clicked')
def on_clicked(data): # data is whatever arg you pass in your emit call on client
    #print(str(data.tile) + " : " + data.value)
    print("Server is sending index: " + str(data))
    socketio.emit('clicked', data, broadcast=True, include_self=False)

# Note that we don't call app.run anymore. We call socketio.run with app arg
socketio.run(
    app,
    host=os.getenv('IP', '0.0.0.0'),
    port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
)
