import { useEffect, useState } from 'react';
import { useSocket } from '../../context/SocketContext';
import { useNavigate } from 'react-router-dom';
import Grid from '../../components/Grid';
import Button from '../../components/button';
import './style.css';

const GameSetup = () => {
    const { socket, roomId } = useSocket();
    const navigate = useNavigate();
    const currentUserId = localStorage.getItem('user_id');

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

    useEffect(() => {
        if (socket) {
            socket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            socket.on('opponent_ready', (data) => {
                console.log('Opponent is ready:', data);
            }
            );

            socket.on('all_players_ready', (data) => {
                console.log('All players are ready:', data);
                const currentPlayerTurn = data.currentPlayerTurn
                navigate(`/game-room?roomId=${roomId}`, { state: { ships, currentPlayerTurn} });
            });

            socket.on('opponent_reset', (data) => {
                console.log('Opponent reset:', data);
            });

            socket.on('opponent_left', (data) => {
                console.log('Opponent left:', data);
            });

            socket.on('game_cancelled', (data) => {
                console.log('Game cancelled:', data);
            });

            // Cleanup when component unmounts
            return () => {
                socket.off('connect_error');
                socket.off('opponent_ready');
                socket.off('all_players_ready');
            };
        }
    });

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
                <h1>Game Setup</h1>
                <Grid
                    setCurrentShip = {setCurrentShip}
                    currentShipSize={currentShip ? shipTypes[currentShip as keyof typeof shipTypes] : 0}
                    ships={ships}
                    onShipPlacement={handleShipPlacement}
                />
            </div>
            <div className='button-container'>
                {Object.values(ships).every(ship => ship.length > 0) && (
                    <>
                        <Button className='button-ready' text="Ready" onClick={handleReady} />
                        <Button className='button-placed' text="Reset All Ships" onClick={resetShips} />
                    </>
                )}
            </div>

        </div>
    );
}

export default GameSetup;
