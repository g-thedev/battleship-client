import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import Grid from '../../components/Grid';
import { useLocation } from 'react-router-dom';
// import './style.css';

const GameRoom = () => {
    const location = useLocation();
    const shipsState = location.state.ships;
    const currentUserId = localStorage.getItem('user_id');
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState<boolean>(false);

    const updateCurrentPlayerTurn = (currentPlayer: string) => {
        if (currentPlayer === currentUserId) {
            setCurrentPlayerTurn(true);
        } else {
            setCurrentPlayerTurn(false);
        }
    };

    useEffect(() => {
        if(location.state && location.state.currentPlayerTurn) {
            updateCurrentPlayerTurn(location.state.currentPlayerTurn);
        }
    }, []);

    return (
        <div className="game-room">
            <h1>Game Room</h1>
            <Grid gameBoard={true} currentPlayerTurn={currentPlayerTurn} updateCurrentPlayerTurn={updateCurrentPlayerTurn} currentLocation={location.pathname} />
            <Grid ships={shipsState} currentPlayersBoard={true} currentPlayerTurn={currentPlayerTurn}/>
        </div>
    );
};

export default GameRoom;
