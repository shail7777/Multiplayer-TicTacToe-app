import './Board.css';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Squares } from './square.js';
import { ListItem } from './ListItem.js';
import io from 'socket.io-client';

const socket = io();

export function Board(props) {
  
  const [board, setBoard] = useState([" "]);
  const [stateO, setStateO] = useState(0);
  const [playerCount, setplayerCount] = useState(1);
  const [player, setPlayer] = useState([]);
  const [spectator, setSpectator] = useState([]);
  const inputRef = useRef(null);

  function assigneUser(){
    if(inputRef != null){
    
      const inp = inputRef.current.value;
      console.log(inp);
      console.log("player count: " + playerCount);
      
      if(playerCount < 2){
        setPlayer(prePlayers => [...prePlayers, inp]);
        //setPlayer(...player, inp);
        setplayerCount((prev) => prev + 1);
      }
      
      else{
        setSpectator(preSpectator => [...preSpectator, inp]);
      }
      
      console.log("spectator: " + spectator);
      console.log("player: " + player);
      socket.emit('assigne', {val: inp, count: playerCount});
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


  function onClickButton(i) {
    //console.log("Before onclick function borad: " + board);
    //console.log("Before onclick function sateO: " + stateO);
    //console.log("board.length: " + board.length);
    //console.log("board[i]: " + board[i]);
    if(board[i] == 'X' || board[i] == 'O'){
      return null;
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
    
    socket.emit('clicked', {board: newboard, val: newboard[i]});
    //console.log("After onclick function borad: " + newboard);
    //console.log("After onclick function sateO: " + stateO);
    
    return newboard;
  };
  
  useEffect(() => {
    
    socket.on('assigne', (data) => {
      const user = data.val;
      const count = data.count;
      
      if(count < 2){
        setPlayer(prePlayers => [...prePlayers, user]);
      }
      
      else{
         setSpectator(preSpectator => [...preSpectator, user]);
      }
      
      console.log("useEffect Spectator: " + spectator);
      console.log("useEffect Players: " + player);
    })
    
    socket.on('clicked', (data) => {
      //console.log("Before useEffect borad: " + board);
      //console.log("Before useEffect sateO: " + stateO);
    
      const newboard = [...data.board];
      if(data.val == 'X'){
        setStateO(1);
      }
      else{
        setStateO(0);
      }
      setBoard(newboard);
      
      //console.log("After useEffect borad: " + newboard);
      //console.log("After useEffect sateO: " + stateO);
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
      
      <Squares onClickButton={onClickButton} val={board} />
    </div>
    
  );
}