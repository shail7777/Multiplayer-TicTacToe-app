# Multiplayer Tic Tac Toe app

## Requirements
1. `npm install`
2. `pip install -r requirements.txt`

## Setup
1. Run `echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" > .env.development.local` in the project directory
2. Create a new heroku app: `heroku create`

## Run Application:
1. Run command in terminal (in your project directory): `python app.py`
2. Run command in another terminal, `cd` into the project directory, and run `npm run start`
3. Preview web page in browser '/'
4. Create a new remote DB on your Heroku app: `heroku addons:create heroku-postgresql:hobby-dev`
5. Run `heroku config` and copy the DATABASE_URL.
6. Go to environment file and insert `export DATABASE_URL='copy-paste-value-in-here'`

## Test Database:
In a termenal run `python` and follow thses steps.
```
>> from app import db
>> import models
>> db.create_all()
>> admin = models.Leaderboard(username='admin', rank=100)
>> guest = models.Leaderboard(username='guest', rank=150)
>> db.session.add(admin)
>> db.session.add(guest)
>> db.session.commit()
```
In the same pyhton session if run `models.Person.query.all()` it should print out:
`[<Leaderboard u'admin'>, <Leaderboard u'guest'>]`
To make sure that the database is updated on the Heroku we can run `heroku pg:psql`
If we run `\d` it should show us a table in which leaderboard should be in it.
Run `SELECT * FROM leaderboard;` and it should print out the data inside the table. 

## Bug in the code
1. One of the problem with this code is that only the first two players who have joined first can play the game. There is no rotation of players and spectators implemented in the code. 
2. When a user disconnects the server will not remove their name from the list. So the first two players who joined can only play. Unless the server restarts which will result in a new empty list.

## Problems I faced during this project:
1. When I first made the database with diffrent name and changed the name in models.py nothing was happning. The solution worked for me was to deleate the table and make a new table. If we change something in models.py than it will not update the table itself. We have to deleate the old table and make a new one. 
2. When I wanted to map two arrays at the same time in board.js so that I can diplay the leaderboard. Solution I found was in one of the demos where you map one array and pass in index which you can use to call the other array. 
