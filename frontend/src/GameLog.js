import React from 'react';
import Paper from '@mui/material/Paper';

function GameLog({ log }) {
  return (
    <Paper elevation={3} style={{ position: 'absolute', bottom: '10px', left: '10px', width: '400px', height: '400px', overflowY: 'scroll' }}>
      <ul>
        <p> Game Log </p>
        {log.map((message, index) => (
          <li key={index}>{message}</li>
        ))}
      </ul>
    </Paper>
  );
}

export default GameLog;
