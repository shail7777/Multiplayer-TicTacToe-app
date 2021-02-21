import './Board.css';
import React from 'react';
import { useState, useEffect } from 'react';
import { Squares } from './square.js';
import io from 'socket.io-client';

const socket = io();

export function Board(props) {
  
  const [board, setBoard] = useState([]);
  const [stateO, setStateO] = useState(0);

  function onClickButton(i) {
    console.log("Before onclick function borad: " + board);
    console.log("Before onclick function sateO: " + stateO);
    
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
    socket.emit('clicked', {board: newboard, val: newboard[i]});
    console.log("After onclick function borad: " + newboard);
    console.log("After onclick function sateO: " + stateO);
    return newboard;
  };
  
  useEffect(() => {
    socket.on('clicked', (data) => {
      console.log("Before useEffect borad: " + board);
      console.log("Before useEffect sateO: " + stateO);
    
      const newboard = [...data.board];
      if(data.val == 'X'){
        setStateO(1);
      }
      else{
        setStateO(0);
      }
      setBoard(newboard);
      
      console.log("After useEffect borad: " + newboard);
      console.log("After useEffect sateO: " + stateO);
    });
  }, []);
  
  return (
    <div>
      <Squares onClickButton={onClickButton} val={board} />
    </div>
  );
}