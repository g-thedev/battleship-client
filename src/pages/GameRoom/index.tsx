import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
// import './style.css';

const GameRoom = () => {

    return (
        <div className="game-room">
            <h1>Game Room</h1>
        </div>
    );
};

export default GameRoom;

  //TODO: Add state for tracking hits and misses

  //TODO: Add state for tracking ship locations   

  //TODO: Add state to determine if ship is sunk

  //TODO: Add state to determine if board is player map or enemy map
