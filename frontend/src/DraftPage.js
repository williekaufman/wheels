import React from 'react';
import { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Slot from './Slot.js';
import { URL } from './settings';
import Button from '@mui/material/Button';
import Toast from './Toast.js';
import { fetchWrapper } from './GamePage.js';
import Box from '@mui/material/Box';
import { useLocation, useNavigate } from 'react-router-dom';
import HeroSelector from './HeroSelector.js';

function submit(deck, heroesArg, username, deckname, showErrorToast) {
    fetchWrapper(`${URL}/decks`, { deck, 'heroes': heroesArg, username, deckname }, 'POST')
        .then((response) => {
            if (response['error']) {
                showErrorToast(response['error']);
            }
            showErrorToast('Deck saved!', 'success');
            return response.json();
        }
        )
}

function newGame(navigate, username, deckname) {
    return fetchWrapper(`${URL}/join_game`, { 'username': username, 'deckname': deckname }, 'POST')
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

function useQuery() {
    return new URLSearchParams(useLocation().search);
}


export default function DraftPage() {
    let query = useQuery();
    let [cards, setCards] = useState();
    let [deck, setDeck] = useState([]);
    let [drafting, setDrafting] = useState([]);
    let [loading, setLoading] = useState(true);
    let [error, setError] = useState(null);
    let [toastType, setToastType] = useState('error');
    let [username, setUsername] = useState(localStorage.getItem('spellbooks-username') || '');
    let [deckname, setDeckname] = useState('draft deck');
    let [heroes, setHeroes] = useState();
    let [airHero, setAirHero] = useState();
    let [waterHero, setWaterHero] = useState();
    let [earthHero, setEarthHero] = useState();
    let [fireHero, setFireHero] = useState();
    let navigate = useNavigate();

    const numChoices = query.get("numChoices") || 5;
    const deckSize = query.get("decksize") || 20;

    const showErrorToast = (message, type) => {
        setError(message);

        setToastType(type || 'error')

        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    useEffect(() => {
        fetchWrapper(`${URL}/heroes`, {}, 'GET')
            .then((response) => {
                if (response['error']) {
                    showErrorToast(response['error']);
                }
                return response.json();
            })
            .then((data) => {
                setAirHero(data['defaultHeroes']['air']['name']);
                setWaterHero(data['defaultHeroes']['water']['name']);
                setEarthHero(data['defaultHeroes']['earth']['name']);
                setFireHero(data['defaultHeroes']['fire']['name']);
                setHeroes(data['heroes']);
            })
    }, []);

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
                drawRandomCards(data['cards']);
                setLoading(false);
            })
            .catch((error) => {
                showErrorToast(error.message);
                setLoading(false);
            });
    }, []);

    function drawRandomCards(x) {
        const randomCards = [];
        const copy = (x || cards).slice();

        for (let i = 0; i < numChoices; i++) {
            const index = Math.floor(Math.random() * copy.length);
            randomCards.push(copy[index]);
            copy.splice(index, 1);
        }

        setDrafting(randomCards);
    }

    function addToDeck(card) {
        setDeck(prevDeck => [...prevDeck, card]);
    }

    useEffect(() => {
        if (deck.length >= deckSize) {
            setDrafting([]);
            return;
        }

        cards && cards.length !== 0 && drawRandomCards();
    }, [deck]);

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

    if (loading) {
        return <div>Loading...</div>;
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

    let heroesArg = {
        'air': airHero,
        'water': waterHero,
        'earth': earthHero,
        'fire': fireHero,
    }

    return (
        <div>
            {error && <Toast
                style={
                    toastType === 'success' ? { backgroundColor: 'green' } : { backgroundColor: 'red' }
                }
                message={error} onClose={() => setError(null)} />}
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
                            <Button variant="contained" onClick={() => submit(deck, heroesArg, username, deckname, showErrorToast)}>Save Deck</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => { submit(deck, heroesArg, username, deckname, showErrorToast); newGame(navigate, username, deckname) }}>New Game With Deck</Button>
                        </Grid>
                        <Grid item>
                            <Button variant="contained" onClick={() => navigate('/')}>Back to Home</Button>
                        </Grid>
                    </Grid>
                </Grid>
                <Grid item>
                    <Grid container direction="row" spacing={2}>
                        {heroes && Object.values(heroes).length !== 0 && <Grid item> <HeroSelector element='air' heroes={heroes} hero={airHero} setHero={setAirHero} /> </Grid>}
                        {heroes && Object.values(heroes).length !== 0 && <Grid item> <HeroSelector element='earth' heroes={heroes} hero={earthHero} setHero={setEarthHero} /> </Grid>}
                        {heroes && Object.values(heroes).length !== 0 && <Grid item> <HeroSelector element='fire' heroes={heroes} hero={fireHero} setHero={setFireHero} /> </Grid>}
                        {heroes && Object.values(heroes).length !== 0 && <Grid item> <HeroSelector element='water' heroes={heroes} hero={waterHero} setHero={setWaterHero} /> </Grid>}
                    </Grid>
                </Grid>
                {drafting.length !== 0 && <Grid item>
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
                {deck.length !== 0 && <Grid item>
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