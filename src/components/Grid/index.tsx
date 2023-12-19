import React, { useState } from 'react';
import './style.css';

interface GridProps {
  setCurrentShip: (shipType: string) => void;
  currentShipSize: number;
  ships: { [key: string]: string[] };
  onShipPlacement: (coordinates: string[]) => void;
}

const Grid: React.FC<GridProps> = ({ setCurrentShip, currentShipSize, ships, onShipPlacement }) => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [startSquare, setStartSquare] = useState<string | null>(null);
  const [isFirstClick, setIsFirstClick] = useState(true);

  const isOverlapping = (coordinates: string[]) => {
      return coordinates.some(coordinate => 
          Object.values(ships).flat().includes(coordinate)
      );
  };

  const isWithinBounds = (coordinates: string[]) => {
      return coordinates.every(coordinate => {
          const row = coordinate.charAt(0);
          const col = parseInt(coordinate.substring(1));
          return rows.includes(row) && col >= 1 && col <= cols.length;
      });
  };

  const calculateShipCoordinates = (endSquare: string) => {
      if (!startSquare || currentShipSize === 0) return;

      const startRow = startSquare.charAt(0);
      const startCol = parseInt(startSquare.substring(1));
      const endRow = endSquare.charAt(0);
      const endCol = parseInt(endSquare.substring(1));

      let coordinates = [];
      const isHorizontal = Math.abs(endCol - startCol) > Math.abs(rows.indexOf(endRow) - rows.indexOf(startRow));
      const isIncrement = isHorizontal ? endCol > startCol : rows.indexOf(endRow) > rows.indexOf(startRow);

      if (isHorizontal) {
          for (let i = 0; i < currentShipSize; i++) {
              const col = isIncrement ? startCol + i : startCol - i;
              if (col >= 1 && col <= cols.length) {
                  coordinates.push(`${startRow}${col}`);
              }
          }
      } else {
          let startRowIndex = rows.indexOf(startRow);
          for (let i = 0; i < currentShipSize; i++) {
              const rowIndex = isIncrement ? startRowIndex + i : startRowIndex - i;
              if (rowIndex >= 0 && rowIndex < rows.length) {
                  coordinates.push(`${rows[rowIndex]}${startCol}`);
              }
          }
      }

      if (coordinates.length === currentShipSize && isWithinBounds(coordinates) && !isOverlapping(coordinates)) {
          onShipPlacement(coordinates);
      } else {
          console.log("Invalid ship placement.");
      }
  };

  const handleMouseDown = (square: string) => {
    console.log(`Mouse down on ${square}`);
    if (isFirstClick) {
      setStartSquare(square);
      setIsFirstClick(false);
    } else {
      calculateShipCoordinates(square);
      setIsFirstClick(true);
      setStartSquare(null);
      setCurrentShip('');
    }
  };

  return (
    <div className="grid-container">
      <div className="header">
        {cols.map((col) => (
          <div key={col} className="header-cell">{col}</div>
        ))}
      </div>
      {rows.map((row) => (
        <div key={row} className="row">
          <div className="side-label">{row}</div>
          {cols.map((col) => {
            const square = `${row}${col}`;
            const isShipSquare = Object.values(ships).flat().includes(square);
            const squareClass = isShipSquare ? "square ship-square" : "square";
            return (
              <div
                key={col}
                className={squareClass}
                onMouseDown={() => handleMouseDown(square)}
              />
            );
          })}
          <div className="side-label">{row}</div>
        </div>
      ))}
      <div className="footer">
        {cols.map((col) => (
          <div key={col} className="footer-cell">{col}</div>
        ))}
      </div>
    </div>
  );  
};

export default Grid;
