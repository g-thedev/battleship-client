import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import Grid from '../../components/Grid';
// import './style.css';

const GameSetup = () => {
    const location = useLocation();

    // Function to parse query parameters
    const getQueryParam = (param: string) => {
        const queryParams = new URLSearchParams(location.search);
        return queryParams.get(param);
    };

    const roomId = getQueryParam('roomId');

    // ... use roomId as needed for your game setup logic

    // useEffect(() => {
    //     const socket: Socket = io(); // Create a socket instance

    //     // Set up listeners for game-related events
    //     socket.on('game-event', (data) => {
    //         // Handle game events
    //     });
        
    //     return () => {
    //         // Clean up listeners when component unmounts
    //         socket.off('game-event');
    //     };
    // }, []);


    // const socket: Socket = io(); // Create a socket instance

    // // ...

    // socket.emit('join-game', { roomId }); // Emit the 'join-game' event with the roomId

    return (
        <div className="game-setup">
            <h1>Game Setup</h1>
            <Grid />
        </div>
    );
}

export default GameSetup;