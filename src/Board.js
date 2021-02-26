import './Board.css';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Squares } from './square.js';
import { ListItem } from './ListItem.js';
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

  function assigneUser(){
    if(inputRef != null){
      const inp = inputRef.current.value;
      currentUser = inp;
      console.log("user input: " + inp);
      
      socket.emit('assigne', {val: inp});
    }
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

/*function check(){
  console.log("current: " + currentUser);
  var n = player.includes(currentUser);

  if(n == true){
    return true;
  }
  else{
    return false;
  }
}

function turns(){
  var x;
  console.log('Curruser: ' + currentUser);
  socket.emit('turns', {currentUser});
  socket.on('turns_check', (turn) => {
      x = turn;
      console.log("Turn: " + turn);
    })
  return x;
}
*/

  function onClickButton(i) {
    console.log("Current turn: " + turn);
    
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
    
    /*if(calculateWinner(board)){
      alert("You Won!!!");
      setBoard([]);
    }*/
    
    if(currentUser == player[0]){
      socket.emit('turns_update', {user:player[1]});
    }
    else{
      socket.emit('turns_update', {user:player[0]});
    }
    
    socket.emit('clicked', {board: newboard, val: newboard[i]});
    return newboard;
  };
  
  useEffect(() => {
    
    socket.on('assigne_players', (server_players) => {
      const pl = [...server_players];
      setPlayer(pl);
    })
    
    socket.on('assigne_spectator', (server_spectator) => {
      const sp = [...server_spectator];
      setSpectator(sp);
    })
    
    socket.on('first_turns', (data) => {
      setTurn(data);
      console.log("First turn: " + data);
    })
    
    socket.on('turns_update', (data) => {
      var x = data.user;
      setTurn(x);
      console.log("Turn updaed to: " + x);
      console.log("after update turn: " + turn);
    })
    
    socket.on('clicked', (data) => {
      const newboard = [...data.board];
      if(data.val == 'X'){
        setStateO(1);
      }
      else{
        setStateO(0);
      }
      setBoard(newboard);
    
    });
    
  }, []);
  
  return (
    <div>
      Enter your username: <input ref={inputRef} type='text' />
      <button onClick={assigneUser}>Submit</button>
      
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
      <Squares onClickButton={onClickButton} val={board} />
    </div>
    
  );
}