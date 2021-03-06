import React from 'react';
import './Board.css';

export function Table(props){
    return <div>
    {props.name === props.curr ?(
        <div>
        <tr>
            <td class="names">{props.name}</td>
            <td class="names">{props.rank}</td>
        </tr>
        </div>
       ): 
        <div>
        <tr>
            <td>{props.name}</td>
            <td>{props.rank}</td>
        </tr>
        </div>}
    </div>
}
