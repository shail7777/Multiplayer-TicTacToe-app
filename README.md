# Multiplayer Tic Tac Toe app

## Requirements
1. `npm install`
2. `pip install -r requirements.txt`

## Setup
1. Run `echo "DANGEROUSLY_DISABLE_HOST_CHECK=true" > .env.development.local` in the project directory

## Run Application:
1. Run command in terminal (in your project directory): `python app.py`
2. Run command in another terminal, `cd` into the project directory, and run `npm run start`
3. Preview web page in browser '/'

## Bug in the code
1. One of the problem with this code is that only the first two players who have joined first can play the game. There is no rotation of players and spectators implemented in the code. 
2. When a user disconnects the server will not remove their name from the list. So the first two players who joined can only play. Unless the server restarts which will result in a new empty list.

## Problems I faced during this project
1. When I was trying to update the board it was having trouble updating. One of the way I found to fix this problem is to store the old State value in a new variable and then set that as a newState. I was using setBoard(board) which I had trouble updating. 
2. Another problem I had was deciding whether or not the board is full or not. Before I was checking each tile if there is either 'X' or 'O'. For some reason it was not working so I just made a new useState called count. Everytime a click registers on the board the count will go up and it will be updated in all the clients. When the count hits 9 it will determine the game as a draw.
