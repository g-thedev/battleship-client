import React, { useState, useEffect } from 'react';
import Grid from '../../components/Grid';

const Homepage: React.FC = () => {
    const [data, setData] = useState(null);

    useEffect(() => {
      fetch('/api/data')
          .then(response => response.json())
          .then(data => setData(data))
          .catch(error => console.error('Error fetching data:', error));
  }, []); // Empty dependency array means this effect runs once on mount


    return (
        <>
            <h1>BATTLESHIP</h1>
            <Grid />

            <h1>API Data</h1>
            <div>
                {data ? <div>{JSON.stringify(data)}</div> : <div>Loading...</div>}
            </div>
        </>
    );
}

export default Homepage;