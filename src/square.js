import './Board.css';
import React from 'react';

export function Squares(props) {
  return (
    <div class="board">
        <div class="box" onClick={() => props.onClickButton(0)}>{props.val[0]}</div>
        <div class="box" onClick={() => props.onClickButton(1)}>{props.val[1]}</div>
        <div class="box" onClick={() => props.onClickButton(2)}>{props.val[2]}</div>
        <div class="box" onClick={() => props.onClickButton(3)}>{props.val[3]}</div>
        <div class="box" onClick={() => props.onClickButton(4)}>{props.val[4]}</div>
        <div class="box" onClick={() => props.onClickButton(5)}>{props.val[5]}</div>
        <div class="box" onClick={() => props.onClickButton(6)}>{props.val[6]}</div>
        <div class="box" onClick={() => props.onClickButton(7)}>{props.val[7]}</div>
        <div class="box" onClick={() => props.onClickButton(8)}>{props.val[8]}</div>
    </div>
  );
}