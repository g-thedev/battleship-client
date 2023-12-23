import { useEffect, useState, useCallback, useRef } from 'react';
import Grid from '../../components/Grid';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './style.css';

interface SocketData {
    winner: string;
  }

const GameRoom = () => {
    const { socket } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const timeoutRef = useRef<number | null>(null);
    const shipsState = location.state.ships;
    const currentUserId = localStorage.getItem('user_id');
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [winner, setWinner] = useState<string>('');

    const updateCurrentPlayerTurn = (currentPlayer: string) => {
        if (currentPlayer === currentUserId) {
            setCurrentPlayerTurn(true);
        } else {
            setCurrentPlayerTurn(false);
        }
    };

    const handleGameOver = useCallback((data: SocketData) => {
        setWinner(data.winner);
        setGameOver(true);

        timeoutRef.current = setTimeout(() => {
            navigate('/');
        }, 5000);
    }, [setWinner, setGameOver, navigate]);

    useEffect(() => {
        if(location.state && location.state.currentPlayerTurn) {
            updateCurrentPlayerTurn(location.state.currentPlayerTurn);
        }
    }, []);

    useEffect(() => {
        if (socket) {
            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });
            

        socket.on('game_over', handleGameOver);

          

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            socket.off('game_over');
            socket.off('connect_error');
        }
        }
    }, [socket, handleGameOver]);


    return (
        <div className="game-room">
            <h1>Game Room</h1>
            <div className='status-bar'>
                {currentPlayerTurn && <p>Your turn!</p>}
                {gameOver && <h2>{winner} wins!</h2>}
            </div>
            <Grid gameBoard={true} currentPlayerTurn={currentPlayerTurn} updateCurrentPlayerTurn={updateCurrentPlayerTurn} currentLocation={location.pathname} gameOver={gameOver} />
            <Grid ships={shipsState} currentPlayersBoard={true} currentPlayerTurn={currentPlayerTurn}/>
        </div>
    );
};

export default GameRoom;
