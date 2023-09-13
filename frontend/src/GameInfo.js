import React from 'react';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

function GameInfo({ playerState, opponentState }) {
    if (!playerState || !opponentState) {
        return null;
    }

    const paragraphStyle = {
        margin: '0px 0',
        padding: '0px 0',
    };


    const paperStyle = {
        padding: '10px',
        borderRadius: '10px', 
        margin: '10px',
        backgroundColor: 'lightblue',
        fontWeight: 'bold',
    };

    return (
    <Paper elevation={3} style={ paperStyle }>
      <Stack direction="row" spacing={2} justifyContent="center">
          <div style={{width: '33%', textAlign: 'center'}}>
            <p style={paragraphStyle}>You</p>
            <p style={paragraphStyle}>Mana: {playerState['mana']}</p>
            <p style={paragraphStyle}>Health: {playerState['life']}</p>
          </div>
          <div style={{width: '33%', textAlign: 'center'}}>
            <p style={paragraphStyle}>Opponent</p>
            <p style={paragraphStyle}>Cards in hand: {opponentState['hand'].length}</p>
            <p style={paragraphStyle}>Mana: {opponentState['mana']}</p>
            <p style={paragraphStyle}>Health: {opponentState['life']}</p>
          </div>
      </Stack>
    </Paper>
  );
}

export default GameInfo;
