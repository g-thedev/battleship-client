import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Grid from '../../components/Grid';
import { useLocation } from 'react-router-dom';
// import './style.css';

const GameRoom = () => {
    const location = useLocation();
    const shipsState = location.state.ships;

    console.log(shipsState);

    return (
        <div className="game-room">
            <h1>Game Room</h1>
            <Grid />
            <Grid ships={shipsState} currentPlayersBoard={true}/>
        </div>
    );
};

export default GameRoom;

  //TODO: Add state for tracking hits and misses

  //TODO: Add state for tracking ship locations   

  //TODO: Add state to determine if ship is sunk

  //TODO: Add state to determine if board is player map or enemy map
