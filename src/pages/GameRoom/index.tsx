import { useEffect, useState, useCallback, useRef } from 'react';
import Grid from '../../components/Grid';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSocket } from '../../context/SocketContext';
import './style.css';

interface SocketData {
    winner: string;
    winnerId: string;
    message?: string;
  }

const GameRoom = () => {
    const { socket } = useSocket();
    const location = useLocation();
    const navigate = useNavigate();
    const intervalIdRef = useRef<number | null>(null);
    const shipsState = location.state.ships;
    const currentUserId = localStorage.getItem('user_id');
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [winner, setWinner] = useState<{ username: string; winnerId: string; message?: string }>({ username: '', winnerId: '', message: '' });
    const [countdown, setCountdown] = useState(5);


    const updateCurrentPlayerTurn = (currentPlayer: string) => {
        if (currentPlayer === currentUserId) {
            setCurrentPlayerTurn(true);
        } else {
            setCurrentPlayerTurn(false);
        }
    };

    const handleGameOver = useCallback((data: SocketData) => {
        setWinner({ username: data.winner, winnerId: data.winnerId, message: data.message });
        setGameOver(true);

        setCountdown(5);
        intervalIdRef.current = window.setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(intervalIdRef.current as number);
                    localStorage.removeItem('gameRoomId');
                    navigate('/');
                }
                return prevCountdown - 1;
            });
        }, 1000);
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
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
            }

            socket.off('game_over');
            socket.off('connect_error');
        }
        }
    }, [socket, handleGameOver]);


    return (
        <div className="game-room">
            <div className='status-bar'>
                {currentPlayerTurn && !gameOver && <p>Your turn!</p>}
                {gameOver && <h2>{winner.message? winner.message: ''}{currentUserId === winner.winnerId? 'You win!' : `${winner.username} wins!`}</h2>}
                {gameOver && <p>Redirecting to home page in {countdown} seconds...</p>}
            </div>
            <Grid gameBoard={true} currentPlayerTurn={currentPlayerTurn} updateCurrentPlayerTurn={updateCurrentPlayerTurn} currentLocation={location.pathname} gameOver={gameOver} />
            <Grid ships={shipsState} currentPlayersBoard={true} currentPlayerTurn={currentPlayerTurn}/>
        </div>
    );
};

export default GameRoom;
