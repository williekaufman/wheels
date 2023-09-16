import React from 'react';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Slot from './Slot.js';
import { URL } from './settings';
import Button from '@mui/material/Button';
import Toast from './Toast.js';
import { fetchWrapper } from './GamePage.js';
import Box from '@mui/material/Box';
import { useNavigate } from 'react-router-dom';

function submit(deck, username, deckname, showErrorToast) {
    fetchWrapper(`${URL}/decks`, { 'deck': deck, 'username': username, 'deckname': deckname }, 'POST')
        .then((response) => {
            if (response['error']) {
                showErrorToast(response['error']);
            }
            return response.json();
        }
        )
}

function newGame(navigate, username, deckname) {
    return fetchWrapper(`${URL}/new_game`, { 'username': username, 'deckname': deckname }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            if (data['error']) {
                console.log(data['error']);
                return;
            }
            navigate(`/game/${data['gameId']}?playerNum=1`);
            window.location.reload();
        }
        );
}

function Histogram({ data, initial }) {
    if (!data || data.length === 0) {
        return null;
    }

    const histogram = initial || {};

    for (let value of data) {
        if (histogram[value]) {
            histogram[value]++;
        } else {
            histogram[value] = 1;
        }
    }

    let max = Object.values(histogram).reduce((a, b) => Math.max(a, b));

    let height_per = Math.min(100 / max);


    
    return (
        <Box display="flex" alignItems="flex-end" height={height_per * max + 30}>
            {Object.entries(histogram).map(([number, frequency]) => (
                <Box m={1} flexDirection="column">
                    <Box
                        key={number}
                        width={40}
                        height={frequency * height_per}
                        bgcolor="primary.main"
                    >
                    </Box>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>{number}</div>
                </Box>
            ))
            }
        </Box>
    )
}

export default function DraftPage() {
    let [cards, setCards] = useState();
    let [deck, setDeck] = useState([]);
    let [drafting, setDrafting] = useState([]);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState(null);
    let [username, setUsername] = useState(localStorage.getItem('spellbooks-username') || '');
    let [deckname, setDeckname] = useState('draft deck');
    let navigate = useNavigate();

    const showErrorToast = (message) => {
        setError(message);

        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    useEffect(() => {
        fetchWrapper(`${URL}/cards`, {}, 'GET')
            .then((response) => {
                if (response['error']) {
                    showErrorToast(response['error']);
                }
                return response.json();
            })
            .then((data) => {
                setCards(data['cards']);
                console.log(data['cards'])
                drawRandomCards(data['cards']);
                setLoading(false);
            })
            .catch((error) => {
                showErrorToast(error.message);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    function drawRandomCards(x) {
        console.log(x || cards);
        const randomCards = [];
        const copy = (x || cards).slice();

        for (let i = 0; i < 6; i++) {
            const index = Math.floor(Math.random() * copy.length);
            randomCards.push(copy[index]);
            copy.splice(index, 1);
        }

        setDrafting(randomCards);
    }

    function addToDeck(card) {
        setDeck(prevDeck => [...prevDeck, card]);

        if (deck.length < 19) {
            drawRandomCards();
        } else {
            setDrafting([]);
        }
    }

    function initialCurve() {
        const curve = {};

        for (let i = 0; i <= 10; i++) {
            curve[i] = 0;
        }

        return curve;
    }

    function initialElements() {
        return {
            'air': 0,
            'earth': 0,
            'fire': 0,
            'water': 0,
        }
    }

    function elementsData() {
        let ret = []

        for (let card of deck) {
            if (card['elements'].length === 4) {
                continue
            } else {
                for (let element of card['elements']) {
                    ret.push(element)
                }
            }
        }

        return ret
    }

    return (
        <div>
            {error && <Toast message={error} onClose={() => setError(null)} />}
            <Grid container direction="column" spacing={2} padding="20px">
                <Grid item>
                    <Grid container direction="row" spacing={2}>
                        <Grid item>
                            <label> Username: </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    localStorage.setItem('spellbooks-username', e.target.value);
                                    setUsername(e.target.value)
                                }}
                            />
                        </Grid>
                        <Grid item>
                            <label style={{ marginLeft: '10px' }}> Deck name: </label>
                            <input
                                type="text"
                                value={deckname}
                                onChange={(e) => setDeckname(e.target.value)}
                            />
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => submit(deck, username, deckname, showErrorToast)}>Save Deck</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => { submit(deck, username, deckname, showErrorToast); newGame(navigate, username, deckname) }}>New Game With Deck</Button>
                        </Grid>
                    </Grid>
                </Grid>
                {drafting.length != 0 && <Grid item>
                    <Grid container direction="row" spacing={2}>
                        {drafting.map((card, i) => (
                            <Grid item key={i}>
                                <Slot
                                    card={card}
                                    highlight={false}
                                    elements={card['elements']}
                                    lock={false}
                                    basic={false}
                                    onClick={() => addToDeck(card)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>}
                {deck.length != 0 && <Grid item>
                    <Grid container direction="row">
                        <Grid item>
                            <Histogram data={deck.map(card => card['mana_cost'])} initial={initialCurve()} />
                        </Grid>
                        <Grid item style={{ marginLeft: '70px' }}>
                            <Histogram data={elementsData()} initial={initialElements()} />
                        </Grid>
                    </Grid>
                </Grid>}
                <Grid item>
                    <Grid container direction="row" spacing={2}>
                        {deck.map((card, i) => (
                            <Grid item>
                                <Slot
                                    key={i}
                                    card={card}
                                    highlight={false}
                                    elements={card['elements']}
                                    lock={false}
                                    basic={false}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>

            </Grid>
        </div>
    );
}