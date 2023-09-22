import React from 'react';
import Slot from './Slot.js';
import Grid from '@mui/material/Grid';
import { useState } from 'react';
import Button from '@mui/material/Button';

function paragraphStyle(n) {
    return {
        margin: '0px 0',
        padding: '0px 0',
        fontWeight: n === 0 ? 'normal' : 'bold',
    };
}

function Paragraph({ text, n }) {
    return (
        <p style={paragraphStyle(n)}> {text}: {n} </p>
    )
}

function Diff({ diff, header }) {
    return (
        <div>
            <div style={{ color: header == 'You' ? 'green' : 'red' }}> {header} </div>
            <Paragraph text="Life" n={diff['life']} />
            <Paragraph text="Mana" n={diff['mana']} />
            <Paragraph text="Focus" n={diff['focus']} />
            <Paragraph text="Experience" n={diff['experience']} />
        </div>
    )
}

export default function Turn({ turn, playerNum }) {
    let [showAllDiffs, setShowAllDiffs] = useState(false);

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
                            <Grid container spacing={2} direction="column">
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
                                {showAllDiffs && <Grid item>
                                    {element[player + 'Diff'] && <Diff diff={element[player + 'Diff']} header="You" />}
                                    {element[opponent + 'Diff'] && <Diff diff={element[opponent + 'Diff']} header="Opponent" />}
                                </Grid>}
                            </Grid>
                        </Grid>))}
                    <Grid item>
                        <Button variant="contained" onClick={() => setShowAllDiffs(!showAllDiffs)}> {showAllDiffs ? 'Hide' : 'Show'} all diffs </Button>
                    </Grid>
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