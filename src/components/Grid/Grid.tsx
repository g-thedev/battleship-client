// import React from 'react';
import './Grid.css';

const Grid = () => {
  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  const handleSquareClick = (row : string, col :number) => {
    console.log(`Square clicked: ${row}${col}`);
    // Add your click handling logic here
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
          {cols.map((col) => (
            <div key={col} className="square" onClick={() => handleSquareClick(row, col)} />
          ))}
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



