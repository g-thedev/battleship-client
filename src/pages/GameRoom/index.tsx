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
    const intervalSunkIdRef = useRef<number | null>(null);
    const shipsState = location.state.ships;
    const currentUserId = localStorage.getItem('user_id');
    const [currentPlayerTurn, setCurrentPlayerTurn] = useState<boolean>(false);
    const [gameOver, setGameOver] = useState<boolean>(false);
    const [winner, setWinner] = useState<{ username: string; winnerId: string; message?: string }>({ username: '', winnerId: '', message: '' });
    const [countdown, setCountdown] = useState(5);
    const [shipSunk, setShipSunk] = useState<string>('');


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
        intervalSunkIdRef.current = window.setInterval(() => {
            setCountdown((prevCountdown) => {
                if (prevCountdown === 1) {
                    clearInterval(intervalSunkIdRef.current as number);
                    localStorage.removeItem('gameRoomId');
                    navigate('/');
                }
                return prevCountdown - 1;
            });
        }, 1000);
    }, [setWinner, setGameOver, navigate]);

    useEffect(() => {
        const isFirstTransition = sessionStorage.getItem('isFirstTransition') === 'true';
        
        if (isFirstTransition && location.state && location.state.currentPlayerTurn) {
            console.log('Only update once when moving from Setup to Room');
            updateCurrentPlayerTurn(location.state.currentPlayerTurn);
            sessionStorage.removeItem('isFirstTransition');
        }
    }, []);

    useEffect(() => {
        if (shipSunk) {
            intervalIdRef.current = window.setTimeout(() => {
                setShipSunk('');
            }, 5000);
        }

        return () => {
            if (intervalIdRef.current) {
                clearTimeout(intervalIdRef.current);
            }
        };
    }, [shipSunk]);

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
        <div className='container'>
            <div className="side-bar">
                <div className="status-container">
                    <h2>Player Turn</h2>
                    <div className="player-status">
                        <div className="status-light" 
                            style={{
                                backgroundColor: currentPlayerTurn ? 'green' : 'red',
                                opacity: currentPlayerTurn ? 1 : 0.3
                            }}>
                        </div>
                        <p style={{ opacity: currentPlayerTurn ? 1 : 0.3 }}>You</p>
                    </div>
                    <div className="player-status">
                        <div className="status-light" 
                            style={{
                                backgroundColor: !currentPlayerTurn ? 'green' : 'red',
                                opacity: !currentPlayerTurn ? 1 : 0.3
                            }}>
                        </div>
                        <p style={{ opacity: !currentPlayerTurn ? 1 : 0.3 }}>Opponent</p>
                    </div>
                </div>
            </div>
            <div className="game-room">
                <div className='status-bar'>
                    {gameOver && <h2>{winner.message? winner.message: ''}{currentUserId === winner.winnerId? 'You win!' : `${winner.username} wins!`}</h2>}
                    {gameOver && <p>Redirecting to home page in {countdown} seconds...</p>}
                    {shipSunk && <p>{shipSunk}</p>}
                </div>
                <Grid gameBoard={true} currentPlayerTurn={currentPlayerTurn} updateCurrentPlayerTurn={updateCurrentPlayerTurn} currentLocation={location.pathname} gameOver={gameOver} setShipSunk={setShipSunk}/>
                <Grid ships={shipsState} currentPlayersBoard={true} currentPlayerTurn={currentPlayerTurn}/>
            </div>
            <div className="side-bar">

            </div>
        </div>

    );
};

export default GameRoom;
