import React from 'react';

export function Table(props){
    return <tr>
        <td>{props.name}</td>
        <td>{props.rank}</td>
    </tr>
}