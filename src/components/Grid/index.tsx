import React, { useEffect, useState, useCallback } from 'react';
import { useSocket } from '../../context/SocketContext';
import './style.css';


interface GridProps {
  setCurrentShip?: (shipType: string) => void;
  currentShipSize?: number;
  ships?: { [key: string]: string[] };
  onShipPlacement?: (coordinates: string[]) => void;
  currentPlayersBoard?: boolean;
  gameBoard?: boolean;
  currentPlayerTurn?: boolean;
  updateCurrentPlayerTurn?: (currentPlayer: string) => void;
  currentLocation?: string;
  gameOver?: boolean;
}

interface SocketData {
  square: string;
  currentPlayerTurn: string;
}


const Grid: React.FC<GridProps> = ({ 
  setCurrentShip, 
  currentShipSize, 
  ships, 
  onShipPlacement, 
  currentPlayersBoard, 
  gameBoard, 
  currentPlayerTurn ,
  updateCurrentPlayerTurn,
  currentLocation,
  gameOver
}) => {
  const { socket } = useSocket();
  const currentPlayerId = localStorage.getItem('user_id');
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [startSquare, setStartSquare] = useState<string | null>(null);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [hoverSquare, setHoverSquare] = useState<string | null>(null);
  const [shots, setShots] = useState({ hits: new Set(), misses: new Set() });
  
  const roomId = localStorage.getItem('gameRoomId');
  
  const isOverlapping = (coordinates: string[]) => {
    return coordinates.some(coordinate => 
        Object.values(ships ?? {}).flat().includes(coordinate)
    );
  };

  const isWithinBounds = (coordinates: string[]) => {
    return coordinates.every(coordinate => {
        const row = coordinate.charAt(0);
        const col = parseInt(coordinate.substring(1));
        return rows.includes(row) && col >= 1 && col <= cols.length;
    });
  };

  const getCoordinates = (startSquare: string, endSquare: string) => {
    if (!startSquare || currentShipSize === 0) return [];

    const startRow = startSquare.charAt(0);
    const startCol = parseInt(startSquare.substring(1));
    const endRow = endSquare.charAt(0);
    const endCol = parseInt(endSquare.substring(1));

    let coordinates = [];
    const isHorizontal = Math.abs(endCol - startCol) > Math.abs(rows.indexOf(endRow) - rows.indexOf(startRow));
    const isIncrement = isHorizontal ? endCol > startCol : rows.indexOf(endRow) > rows.indexOf(startRow);

    if (isHorizontal) {
        for (let i = 0; i < (currentShipSize as number); i++) {
            const col = isIncrement ? startCol + i : startCol - i;
            if (col >= 1 && col <= cols.length) {
                coordinates.push(`${startRow}${col}`);
            }
        }
    } else {
        let startRowIndex = rows.indexOf(startRow);
        for (let i = 0; i < (currentShipSize ?? 0); i++) {
            const rowIndex = isIncrement ? startRowIndex + i : startRowIndex - i;
            if (rowIndex >= 0 && rowIndex < rows.length) {
                coordinates.push(`${rows[rowIndex]}${startCol}`);
            }
        }
    }
    return coordinates;
  };

  const handleMouseDown = useCallback((square: string) => {
    if (gameBoard && currentPlayerTurn) {
      if (shots.hits.has(square) || shots.misses.has(square)) return;

      socket?.emit('shot_called', { square, roomId, currentPlayerId });

    } else if (currentPlayersBoard) {
      return;
    } else if (currentLocation === '/game-room') {
      return;
    } else {
      if (isFirstClick) {
        setStartSquare(square);
        setIsFirstClick(false);
      } else {
        const shipCoordinates = startSquare ? getCoordinates(startSquare, square) : [];
        if (shipCoordinates.length === currentShipSize && isWithinBounds(shipCoordinates) && !isOverlapping(shipCoordinates)) {
          if (onShipPlacement) {
            onShipPlacement(shipCoordinates);
          }
        } else {
          console.log("Invalid ship placement.");
        }
        setIsFirstClick(true);
        setStartSquare(null);
        setCurrentShip && setCurrentShip('');
      }
    }
  }, [
    gameBoard, 
    currentPlayerTurn, 
    shots, 
    socket, 
    roomId, 
    currentPlayerId, 
    currentPlayersBoard, 
    currentLocation, 
    isFirstClick, 
    startSquare, 
    getCoordinates, 
    currentShipSize, 
    isWithinBounds, 
    isOverlapping, 
    onShipPlacement, 
    setStartSquare, 
    setIsFirstClick, 
    setCurrentShip
  ]);

  const projectionCoordinates = hoverSquare && startSquare 
    ? getCoordinates(startSquare, hoverSquare) 
    : [];

    const handleShipSunk = useCallback((data: SocketData) => {
      if ((currentPlayerTurn && gameBoard) || (currentPlayersBoard && !currentPlayerTurn)) {
        setShots(prev => ({ hits: new Set(prev.hits).add(data.square), misses: prev.misses }));
      }
      updateCurrentPlayerTurn && updateCurrentPlayerTurn(data.currentPlayerTurn);
    }, [currentPlayerTurn, gameBoard, currentPlayersBoard, setShots, updateCurrentPlayerTurn]);
  
    const handleShotHit = useCallback((data: SocketData) => {
      if ((currentPlayerTurn && gameBoard) || (currentPlayersBoard && !currentPlayerTurn)) {
        setShots(prev => ({ hits: new Set(prev.hits).add(data.square), misses: prev.misses }));
      }
      updateCurrentPlayerTurn && updateCurrentPlayerTurn(data.currentPlayerTurn);
    }, [currentPlayerTurn, gameBoard, currentPlayersBoard, setShots, updateCurrentPlayerTurn]);
  
    const handleShotMiss = useCallback((data: SocketData) => {
      if ((currentPlayerTurn && gameBoard) || (currentPlayersBoard && !currentPlayerTurn)) {
        setShots(prev => ({ hits: prev.hits, misses: new Set(prev.misses).add(data.square) }));
      }
      updateCurrentPlayerTurn && updateCurrentPlayerTurn(data.currentPlayerTurn);
    }, [currentPlayerTurn, gameBoard, currentPlayersBoard, setShots, updateCurrentPlayerTurn]);
  
    useEffect(() => {
      if (socket) {
        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
        });
  
        socket.on('ship_sunk', handleShipSunk);
        socket.on('shot_hit', handleShotHit);
        socket.on('shot_miss', handleShotMiss);

        socket.on('rejoined_game_room', (data) => {
          if (updateCurrentPlayerTurn) {
            updateCurrentPlayerTurn(data.currentTurn);
            setShots({hits: new Set([]), misses: new Set([])})
            socket.emit('get_current_users_board', { roomId, playerId: currentPlayerId })
            socket.emit('get_opponents_board', { roomId, playerId: currentPlayerId })
          }
      });

      if (currentPlayersBoard && !gameBoard) {
        // socket.emit('get_current_users_board', { roomId, playerId: currentPlayerId })
        socket.on('current_users_board', (data) => {
          console.log('current_users_board', data)
          setShots({hits: new Set(data.hits), misses: new Set(data.misses)})
        });
      }

      if (gameBoard && !currentPlayersBoard) {
        // socket.emit('get_opponenets_board', { roomId, playerId: currentPlayerId })
        socket.on('opponents_board', (data) => {
          console.log('opponents_board', data)
          setShots({hits: new Set(data.hits), misses: new Set(data.misses)})
        });
      }
  
        socket.on('disconnect', (reason) => {
          console.log('Disconnected:', reason);
        });
  
        return () => {
          socket.off('ship_sunk', handleShipSunk);
          socket.off('shot_hit', handleShotHit);
          socket.off('shot_miss', handleShotMiss);
          socket.off('disconnect');
          socket.off('connect_error');
          socket.off('rejoined_game_room');
          socket.off('current_users_board');
          socket.off('opponents_board');
        };
      }
    }, [socket, handleShipSunk, handleShotHit, handleShotMiss, gameBoard, currentPlayersBoard ]);

  return (
    <div className={`grid-container${currentPlayersBoard ? " scale-down" : ""}`}>
      {!currentPlayersBoard && (
        <div className="header">
          {cols.map((col) => (
            <div key={col} className="header-cell">{col}</div>
          ))}
        </div>
      )}
      {rows.map((row) => (
        <div key={row} className="row">
          {!currentPlayersBoard && <div className="side-label">{row}</div>}
          {cols.map((col) => {
            const square = `${row}${col}`;
            const isShipSquare = ships && Object.values(ships).flat().includes(square);
            const isProjectionSquare = projectionCoordinates.includes(square);
            let squareClass = "square";
            if (isShipSquare) {
              squareClass += " ship-square";
            } else if (isProjectionSquare) {
              squareClass += " projection-square";
            }

            if (shots.hits.has(square)) {
              squareClass += " hit";
            } else if (shots.misses.has(square)) {
              squareClass += " missed";
            }

            if (gameOver) {
              squareClass += " disbaled";
            }

            return (
              <div
                key={col}
                className={squareClass}
                onClick={() => handleMouseDown(square)}
                onMouseOver={() => setHoverSquare(square)}
              />
            );
          })}
          {!currentPlayersBoard && <div className="side-label">{row}</div>}
        </div>
      ))}
      {!currentPlayersBoard && (
        <div className="footer">
          {cols.map((col) => (
            <div key={col} className="footer-cell">{col}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Grid;
