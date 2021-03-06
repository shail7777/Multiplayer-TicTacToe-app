import './Board.css';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Squares } from './square.js';
import { ListItem } from './ListItem.js';
import { Table } from './table.js';
import io from 'socket.io-client';

const socket = io();
var currentUser;
export function Board(props) {
  
  const [board, setBoard] = useState([" "]);
  const [turn, setTurn] = useState("");
  const [stateO, setStateO] = useState(0);
  const [player, setPlayer] = useState([]);
  const [spectator, setSpectator] = useState([]);
  const inputRef = useRef(null);
  const [showBoard, setShowBoard] = useState(false);
  const [showWinner, setShowWinner] = useState(false);
  const [winner, setWinner] = useState("");
  const [loser, setLoser] = useState("");
  const [showdraw, setDraw] = useState(false);
  const [count, setCount] = useState(0);
  const [db_user, setDB_user] = useState([]);
  const [db_rank, setDB_rank] = useState([]);

  function assigneUser(){
    const inp = inputRef.current.value;
    if(inp.length != 0 || currentUser == 0){
      if(!player.includes(inp) && !spectator.includes(inp)){
        setShowBoard(true);
        const inp = inputRef.current.value;
        currentUser = inp;
        console.log("user input: " + inp);
        socket.emit('assigne', {val: inp});
      }
      else{
        setShowBoard(false);
        console.log("already in list");
        return;
      }
    }
    else{
      setShowBoard(false);
      return;
    }
  }
  
  function reset(){
    if(player.includes(currentUser)){
      socket.emit('reset', {user:currentUser});
      console.log('Reseting ' + currentUser);
    }
    return;
  }

  function calculateWinner(squares) {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
  return null;
  }

  function onClickButton(i) {
    if(calculateWinner(board)){
      return;
    }
    if(turn != currentUser || currentUser == null){
      return;
    }
    if(board[i] == 'X' || board[i] == 'O'){
      return;
    }
    if(stateO == 1){
      board[i] = 'O';
      setStateO((prevStateO) => prevStateO - 1);
    }
    if(stateO == 0){
      board[i] = 'X';
      setStateO((prevStateO) => prevStateO + 1);
    }
    
    const newboard = [...board];
    setBoard(newboard);
    
    if(calculateWinner(board)){
      socket.emit('clicked', {board: newboard, val: newboard[i], count:num});
      if(currentUser == player[0]){
        socket.emit('winner', {winner:player[0], loser:player[1]});
      }
      if(currentUser == player[1]){
        socket.emit('winner', {winner:player[1], loser:player[0]});
      }
      return;
    }
    
    if(currentUser == player[0] && player[1] != null){
      socket.emit('turns_update', {user:player[1]});
    }
    else{
      socket.emit('turns_update', {user:player[0]});
    }
    
    var num = count + 1;
    setCount(num);
    console.log(num);
    if(num == 9){
      console.log("its a draw");
      setDraw(true);
      socket.emit('draw', {draw:showdraw});
    }
    
    socket.emit('clicked', {board: newboard, val: newboard[i], count:num});
    return newboard;
  }
  
  useEffect(() => {
    
    socket.on('assigne_players', (server_players) => {
      const pl = [...server_players];
      setPlayer(pl);
    });
    
    socket.on('assigne_spectator', (server_spectator) => {
      const sp = [...server_spectator];
      setSpectator(sp);
    });
    
    socket.on('first_turns', (data) => {
      setTurn(data);
      console.log("First turn: " + data);
    });
    
    socket.on('turns_update', (data) => {
      var x = data.user;
      setTurn(x);
      console.log("Turn updaed to: " + x);
      console.log("after update turn: " + turn);
    });
    
    socket.on('winner', (data) =>{
      console.log("winner is desided")
      var win = data.winner;
      var los = data.loser;
      setWinner(win);
      setLoser(los);
      setShowWinner(true);
    });
    
    socket.on('draw', (data) => {
      setDraw(true);
    });
    
    socket.on('reset', (data) => {
      console.log("Reseting the game now");
      setBoard([""]);
      setDraw(false);
      setShowWinner(false);
      setCount(0);
    });
    
    socket.on('clicked', (data) => {
      const newboard = [...data.board];
      const no = data.count;
      setCount(no);
      console.log("count set to: " + no);
      if(data.val == 'X'){
        setStateO(1);
      }
      else{
        setStateO(0);
      }
      setBoard(newboard);
    });
    
    socket.on('user_list', (data) => {
      setDB_user(data.user);
      setDB_rank(data.rank);
      console.log(data);
    });
    
    socket.on('connect', (data) => {
      setPlayer(data.server_players);
      setSpectator(data.server_spectator);
    });
    
  }, []);
  
  return (
    <div>
      Enter your username: <input ref={inputRef} type='text' />
      <button onClick={assigneUser}>Submit</button>
      
      {showBoard === true ?(
      <div>
      
        <div class="right">
        Players:
          <ol>
          {player.map(users => <ListItem name={users} />)}
          </ol>
        </div>
      
        <div class="right1">
        Spectator:
          <ol>
          {spectator.map(users => <ListItem name={users} />)}
          </ol>
        </div>
        
        <p>Turn: {turn}</p>
        
        {showdraw === true ?(
        <div>
        <p>This game is a draw.</p>
        <button onClick={reset}>Reset</button>
        </div>
        ) : null}
        
        {showWinner === true ?(
        <div>
        <p>Winner of the game is {winner}.</p>
        <p>Losser of the game is {loser}.</p>
        <button onClick={reset}>Reset</button>
        </div>
        ) : null}
        
        {db_user != null ?(
        <div class="right2">
        Leader Board:
        <table>
        <tr>
          <th>Users</th>
          <th>Ranks</th>
        </tr>
        
        
        {db_user.map((users, index) => <Table name={users} rank={db_rank[index]} />)}
        
        </table>
        
        </div>
        ) : null}
        
        <Squares onClickButton={onClickButton} val={board} />
      </div>
      ) : null}
    </div>
    
  );
}

//{db_user.map(users => <Table name={users} />)}
//{db_rank.map(rank => <Table name={rank} />)}