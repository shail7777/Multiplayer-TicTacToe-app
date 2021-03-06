import os
from flask import Flask, send_from_directory, json, session
from flask_socketio import SocketIO
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from dotenv import load_dotenv, find_dotenv
import json

load_dotenv(find_dotenv())

app = Flask(__name__, static_folder='./build/static')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
import models
db.create_all()

cors = CORS(app, resources={r"/*": {"origins": "*"}})
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    json=json,
    manage_session=False
)

session_player = []
session_spectator = []
user_db = []
rank_db = []
board = []

reset_game = {
    "p1" : False,
    "p2" : False
}

@app.route('/', defaults={"filename": "index.html"})
@app.route('/<path:filename>')
def index(filename):
    return send_from_directory('./build', filename)

# When a client connects from this Socket connection, this function is run
@socketio.on('connect')
def on_connect():
    print('User connected!')
    all_data = db.session.query(models.Leaderboard).order_by(models.Leaderboard.rank.desc()).all()
    
    for people in all_data:
        if people.username not in user_db:
            user_db.append(people.username)
            rank_db.append(people.rank)
            
    socketio.emit('user_list', {'user' : user_db, 'rank' : rank_db})
    
    if session_player:
        print("emiting connet")
        socketio.emit('connect', {'player' : session_player, 'spectator' : session_spectator})

# When a client disconnects from this Socket connection, this function is run
@socketio.on('disconnect')
def on_disconnect():
    print('User disconnected!')

@socketio.on('assigne')
def assigne_users(data): 
    print(str(data))
    user = str(data['val'])
    
    if user not in user_db:
        #add the user to the database
        new_player = models.Leaderboard(username = user, rank = 100)
        db.session.add(new_player)
        db.session.commit()
        
        all_data = db.session.query(models.Leaderboard).order_by(models.Leaderboard.rank.desc()).all()
        print(all_data)
        user_db.clear()
        rank_db.clear()
    
        for people in all_data:
            if people.username not in user_db:
                user_db.append(people.username)
                rank_db.append(people.rank)
        socketio.emit('user_list', {'user' : user_db, 'rank' : rank_db})   
    
    if len(session_player) < 2:
        session_player.append(user)
        if session_player[0] == user:
            data = session_player[0]
            socketio.emit('first_turns', data, broadcast=True, include_self=True)
        socketio.emit('assigne_players', session_player, broadcast=True, include_self=True)
        
    elif len(session_player) >= 2:
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
    socketio.emit('clicked', data, broadcast = True, include_self = False)

@socketio.on('winner')
def winner_user(data):
    print(str(data))
    
    winner = db.session.query(models.Leaderboard).filter_by(username=data['winner']).first()
    loser = db.session.query(models.Leaderboard).filter_by(username=data['loser']).first()
    
    winner.rank = winner.rank + 1
    loser.rank = loser.rank - 1
    
    db.session.commit()
    
    all_data = db.session.query(models.Leaderboard).order_by(models.Leaderboard.rank.desc()).all()
    print(all_data)
    user_db.clear()
    rank_db.clear()
    
    for people in all_data:
        if people.username not in user_db:
            user_db.append(people.username)
            rank_db.append(people.rank)
            
    socketio.emit('user_list', {'user' : user_db, 'rank' : rank_db})    
    socketio.emit('winner', data, broadcast=True, include_self=True)

@socketio.on('draw')
def draw(data):
    socketio.emit('draw', data, broadcast=True, include_self=False)

@socketio.on('reset')
def reset(data):
    user = str(data['user'])
    if user == session_player[0]:
        reset_game["p1"] = True
        print("p1 is true")
    if user == session_player[1]:
        reset_game["p2"] = True
        print("p2 is true")
    if reset_game["p1"] == True and reset_game["p2"] == True:
        print("in the elif reset")
        reset_game["p1"] = False
        reset_game["p2"] = False
        socketio.emit('reset', data, broadcast=True, include_self=True)
        print("Reseting the game now")
    print("reset function")
    

# Note we need to add this line so we can import app in the python shell
if __name__ == "__main__":
# Note that we don't call app.run anymore. We call socketio.run with app arg
    socketio.run(
        app,
        host=os.getenv('IP', '0.0.0.0'),
        port=8081 if os.getenv('C9_PORT') else int(os.getenv('PORT', 8081)),
    )