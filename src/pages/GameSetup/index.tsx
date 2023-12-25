import { useEffect, useState, useRef, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Grid from '../../components/Grid';
import Button from '../../components/button';
import './style.css';

interface SocketData {
    message?: string;
  }


const GameSetup = () => {
    const { socket, roomId } = useSocket();
    const navigate = useNavigate();
    const location = useLocation();
    const intervalIdRef = useRef<number | null>(null);
    const [countdown, setCountdown] = useState(5);
    const currentUserId = localStorage.getItem('user_id');
    const [gameCancelled, setGameCancelled] = useState<string>('');
    const [opponentReady, setOpponentReady] = useState<string>('');
    const [opponentReset, setOpponentReset] = useState<boolean>(false);

    const shipTypes: { [key: string]: number } = {
        carrier: 5,
        battleship: 4,
        cruiser: 3,
        submarine: 3,
        destroyer: 2
    };

    const initialShipsState = {
        carrier: [],
        battleship: [],
        cruiser: [],
        submarine: [],
        destroyer: []
    };

    const [ships, setShips] = useState(initialShipsState);


    const [currentShip, setCurrentShip] = useState('');

    const handleShipSelection = (shipType: string) => {
        setCurrentShip(shipType);
    };

    const handleShipPlacement = (coordinates: string[]) => {
        if (!currentShip) return;

        setShips(prevShips => ({
            ...prevShips,
            [currentShip]: coordinates
        }));
    };

    const resetShips = () => {
        setShips(initialShipsState);
        socket?.emit('reset_ships', { playerId: currentUserId, roomId });
    };

    const handleGameCancelled = useCallback((data: SocketData) => {
        setGameCancelled(data.message || '');
        setOpponentReady('');

        socket?.emit('leave_game', {roomId, playerId: currentUserId, currentRoom: location.pathname });

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
    }, [navigate]);

    useEffect(() => {
        if (socket) {
            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            socket.on('opponent_ready', (data) => {
                setOpponentReady(data.username);
                setOpponentReset(false);
            }
            );

            socket.on('all_players_ready', (data) => {
                sessionStorage.setItem('isFirstTransition', 'true');
                const currentPlayerTurn = data.currentPlayerTurn
                navigate(`/game-room?roomId=${roomId}`, { state: { ships, currentPlayerTurn} });
            });

            socket.on('opponent_reset', (data) => {
                setOpponentReset(true);
            });

            socket.on('game_cancelled', handleGameCancelled);

            // Cleanup when component unmounts
            return () => {
                if (intervalIdRef.current) {
                    clearInterval(intervalIdRef.current);
                }

                socket.off('connect_error');
                socket.off('opponent_ready');
                socket.off('all_players_ready');
                socket.off('game_cancelled');
                socket.off('opponent_reset');
            };
        }
    }, [ships, handleGameCancelled]);

    const handleReady = () => {
        socket?.emit('player_ready', { playerId: currentUserId, roomId, ships });
    }

    return (
        <div className="game-setup-container">
            <div className='button-container'>
                {Object.keys(shipTypes).map((shipType) => {
                    const isPlaced = ships[shipType as keyof typeof ships].length > 0;
                    const buttonText = isPlaced ? `Reset ${shipType}` : `Set ${shipType}`;
                    const buttonClass = isPlaced ? "button-placed" : "button-default";
                    const handleClick = () => {
                        if (isPlaced) {
                            // Reset only this specific ship
                            setShips(prevShips => ({
                                ...prevShips,
                                [shipType]: []
                            }));
                        } else {
                            // Handle ship selection
                            handleShipSelection(shipType);
                        }
                    };

                    return (
                        <Button className={buttonClass} key={shipType} text={buttonText} onClick={handleClick} />
                    );
                })}
            </div>
            <div>
                <div className="status-bar">
                    {opponentReady && !opponentReset && <p>{opponentReady} is ready!</p>}
                    {opponentReset && <p>{opponentReady} has reset their ships!</p>}
                    {gameCancelled && <p>{gameCancelled}</p>}
                    {gameCancelled && <p>Redirecting to home page in {countdown} seconds...</p>}
                </div>
                <Grid
                    setCurrentShip = {setCurrentShip}
                    currentShipSize={currentShip ? shipTypes[currentShip as keyof typeof shipTypes] : 0}
                    ships={ships}
                    onShipPlacement={handleShipPlacement}
                />
            </div>
            <div className='button-container'>
                <Button 
                    className='button-ready' 
                    text="Ready" 
                    onClick={handleReady} 
                    disabled={!Object.values(ships).every(ship => ship.length > 0)}
                />
                <Button 
                    className='button-placed' 
                    text="Reset All Ships" 
                    onClick={resetShips} 
                    disabled={!Object.values(ships).some(ship => ship.length > 0)}
                />
            </div>

        </div>
    );
}

export default GameSetup;
