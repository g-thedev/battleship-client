import React, { useState } from 'react';
import './style.css';


interface GridProps {
  setCurrentShip?: (shipType: string) => void;
  currentShipSize?: number;
  ships?: { [key: string]: string[] };
  onShipPlacement?: (coordinates: string[]) => void;
  currentPlayersBoard?: boolean;
  gameBoard?: boolean;
}

const Grid: React.FC<GridProps> = ({ setCurrentShip, currentShipSize, ships, onShipPlacement, currentPlayersBoard, gameBoard }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [startSquare, setStartSquare] = useState<string | null>(null);
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [hoverSquare, setHoverSquare] = useState<string | null>(null);

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

  const handleMouseDown = (square: string) => {
    if (gameBoard) {

    } else if (currentPlayersBoard) {

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
  };

  const projectionCoordinates = hoverSquare && startSquare 
    ? getCoordinates(startSquare, hoverSquare) 
    : [];

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
              return (
                <div
                  key={col}
                  className={squareClass}
                  onMouseDown={() => handleMouseDown(square)}
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
