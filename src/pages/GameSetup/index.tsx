import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useLocation } from 'react-router-dom';
import Grid from '../../components/Grid';
import Button from '../../components/button';
// import './style.css';

const GameSetup = () => {
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
    };

    return (
        <div className="game-setup">
            <h1>Game Setup</h1>
            <Grid
                setCurrentShip = {setCurrentShip}
                currentShipSize={currentShip ? shipTypes[currentShip as keyof typeof shipTypes] : 0}
                ships={ships}
                onShipPlacement={handleShipPlacement}
            />
            <div>
                <div>
                    {Object.keys(shipTypes).map((shipType) => {
                        const isPlaced = ships[shipType as keyof typeof ships].length > 0;
                        const buttonText = isPlaced ? `Reset ${shipType}` : `Set ${shipType}`;
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
                            <Button key={shipType} text={buttonText} onClick={handleClick} />
                        );
                    })}
                </div>
                <Button text="Reset All Ships" onClick={resetShips} />

                {Object.values(ships).every(ship => ship.length > 0) && (
                    <Button text="Ready" onClick={() => console.log('Ready')} />
                )}
            </div>

        </div>
    );
}

export default GameSetup;





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