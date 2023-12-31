import React from 'react';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

function GameInfo({ playerState, opponentState }) {
    if (!playerState) {
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
            <p style={paragraphStyle}>Cards in hand: {playerState['hand'].length}</p>
            <p style={paragraphStyle}>Mana: {playerState['permanentState']['mana']}</p>
            <p style={paragraphStyle}>Focus: {playerState['permanentState']['focus']}</p>
            <p style={paragraphStyle}>Health: {playerState['permanentState']['life']}</p>
            <p style={paragraphStyle}>Block: {playerState['state']['block']}</p>
            <p style={paragraphStyle}>Experience: {playerState['permanentState']['experience']}</p>
          </div>
          {opponentState ? <div style={{width: '33%', textAlign: 'center'}}>
            <p style={paragraphStyle}>Opponent</p>
            <p style={paragraphStyle}>Cards in hand: {opponentState['hand'].length}</p>
            <p style={paragraphStyle}>Mana: {opponentState['permanentState']['mana']}</p>
            <p style={paragraphStyle}>Focus: {opponentState['permanentState']['focus']}</p>
            <p style={paragraphStyle}>Health: {opponentState['permanentState']['life']}</p>
            <p style={paragraphStyle}>Block: {opponentState['state']['block']}</p>
            <p style={paragraphStyle}>Experience: {opponentState['permanentState']['experience']}</p>
          </div> : <div style={{width: '33%', textAlign: 'center'}}> Waiting for opponent... </div>}
      </Stack>
    </Paper>
  );
}

export default GameInfo;
