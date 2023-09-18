import React from 'react';
import Slot from './Slot.js';
import Grid from '@mui/material/Grid';

function Diff({ diff, header }) {
    let paragraphStyle = {
        margin: '0px 0',
        padding: '0px 0',
    };

    return (
        <div>
            <div style={{ fontWeight: 'bold' }}> {header} </div>
            <p style={paragraphStyle}> Life: {diff['life']} </p>
            <p style={paragraphStyle}> Mana: {diff['mana']} </p>
            <p style={paragraphStyle}> Focus: {diff['focus']} </p>
            <p style={paragraphStyle}> Experience: {diff['experience']} </p>
        </div>
    )
}

export default function Turn({ turn, playerNum }) {
    if (!turn) {
        return null;
    }

    let player = 'player' + playerNum;
    let opponent = 'player' + (3 - playerNum);

    return (
        <Grid container direction="column" spacing={2} style={{ marginLeft: '0px' }}>
            <Grid item>
                <Grid container spacing={2} direction="row">
                    {turn['cards'].map((element) => (
                        <Grid item>
                            <Slot
                                card={element['card']}
                                highlight={false}
                                elements={[]}
                                player={element['player']}
                                title={element['log']}
                                failed={!element['animate']}
                                lock={false}
                                basic={false}
                                onClick={() => { }}
                            />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <Grid item style={{ height: '175px' }}>
                <Grid container direction="row" spacing={2}>
                    <Grid item textAlign="center">
                        <div> Green cards were played by player 1, blue cards were played by player 2. Red name means not enough mana. </div>
                        <div> To the right are the net difference over the turn. </div>
                        <div> You can mouse over the cards to get the log associated with them. </div>
                    </Grid>
                    <Grid item textAlign="center">
                        <Diff diff={turn[player + 'Diff']} header="You" />
                    </Grid>
                    <Grid item textAlign="center">
                        <Diff diff={turn[opponent + 'Diff']} header="Opponent" />
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}