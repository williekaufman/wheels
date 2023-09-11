import { URL } from './settings';
import { useState, useEffect } from 'react';
import Slot from './Slot';
import { Grid } from '@mui/material';

function makeRequestOptions(body, method = 'POST') {
    if (method == 'GET') {
        return {
            method,
            mode: 'cors',
            headers: { 'Content-Type': 'application/json' },
        };
    }
    return {
        method,
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    };
}

function fetchWrapper(url, body, method = 'POST') {
    if (method == 'GET') {
        if (body) {
            url = `${url}?`;
        }
        for (var key in body) {
            url = `${url}${key}=${body[key]}&`;
        }
    }
    return fetch(url, makeRequestOptions(body, method));
}

function NewGameButton() {
    function handleClick(e) {
        e.preventDefault();
        fetchWrapper(`${URL}/new_game`, { 'gameId': 123 }, 'POST')
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            }
            );
    }

    return (
        <div>
            <button onClick={handleClick}>New Game</button>
        </div>
    )
}

function SpinButton({ playerNum, setPlayerState }) {
    function handleClick(e) {
        e.preventDefault();
        fetchWrapper(`${URL}/spin`, { 'gameId': 123, 'player': playerNum, 'locks': [] }, 'POST')
            .then((res) => res.json())
            .then((data) => {
                setPlayerState(data['player']);
            }
            );
    }

    return (
        <div>
            <button onClick={handleClick}>Spin</button>
        </div>
    )
}

function Wheel({
    playerState,
    element
}) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }

    const wheel = playerState['wheels'][element];

    return (
        <div>
            {wheel['cards'].map((card, index) => (
                <Slot card={card} key={index} highlight={index===wheel['active']}/>
            ))}
        </div>
    )
}

function Wheels({ playerState }) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }

    let elements = ['fire', 'water', 'earth', 'air'];

    return (
        <Grid container spacing={2}>
            {elements.map((element, index) => (
                <Grid item xs={2} key={index}>
                    <Wheel playerState={playerState} element={element} />
                </Grid>
            ))}
        </Grid>
    )

}

export default function GamePage({ }) {
    const [playerNum, setPlayerNum] = useState(
        1
    )
    const [playerState, setPlayerState] = useState();

    return (
        <div>
            <NewGameButton />
            <SpinButton playerNum={playerNum} setPlayerState={setPlayerState} />
            <Wheels playerState={playerState} />
        </div>
    )
}