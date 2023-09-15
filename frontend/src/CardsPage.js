import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Slot from './Slot.js';
import { URL } from './settings';
import Button from '@mui/material/Button';
import Toast from './Toast.js';
import { useNavigate } from 'react-router-dom';

import { fetchWrapper } from './GamePage.js';

function addToDeck(card, deck, setDeck) {
    setDeck([...deck, card]);
}

function removeFromDeck(index, deck, setDeck) {
    setDeck(deck.filter((card, i) => i !== index));
}

function submit(deck, username, deckname, setDecks, showErrorToast) {
    fetchWrapper(`${URL}/decks`, { 'deck': deck, 'username': username, 'deckname': deckname }, 'POST')
        .then((response) => {
            if (response['error']) {
                console.log(response['error']);
                showErrorToast(response['error']);
            }
            getDecks(username, setDecks);
            return response.json();
        }
        )
}

function deleteDeck(deckname, setDeckname, username, setDeck, setDecks, showErrorToast) {
    fetchWrapper(`${URL}/decks/delete/${deckname}`, { 'username': username }, 'POST')
        .then((response) => {
            if (response['error']) {
                showErrorToast(response['error']);
            }
            getDecks(username, setDecks);
            setDeck([]);
            setDeckname('');
            return response.json();
        }
        )
}

function getDecks(username, setDecks) {
    fetchWrapper(`${URL}/decks`, { 'username': username }, 'GET')
        .then((response) => {
            if (response['error']) {
                console.log(response['error']);
                return;
            }
            return response.json();
        }
        )
        .then((data) => {
            setDecks(data['decks']);
        }
    );
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

function joinGame(navigate, gameId, username, deckname) {
    return fetchWrapper(`${URL}/join_game`, { 'username': username, 'deckname': deckname, 'gameId': gameId }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            if (data['error']) {
                console.log(data['error']);
                return;
            }
            navigate(`/game/${data['gameId']}?playerNum=2`);
            window.location.reload();
        }
        );
}

export default function CardsPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deck, setDeck] = useState([]);
    const [decks, setDecks] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('spellbooks-username') || '');
    const [deckname, setDeckname] = useState('');
    const navigate = useNavigate();

    const setDeckFromName = (deckname) => {
        fetchWrapper(`${URL}/decks/${deckname}`, { 'username': username }, 'GET')
            .then((response) => {
                if (response['error']) {
                    showErrorToast(response['error']);
                }
                return response.json();
            })
            .then((data) => {
                setDeck(data['deck']);
                setDeckname(deckname);
            })
            .catch((error) => {
                setError(error);
            });
    }

    const showErrorToast = (message) => {
        setError(message);

        setTimeout(() => {
            setError(null);
        }, 5000);
    };

    useEffect(() => {
        getDecks(username, setDecks);

        const interval = setInterval(() => {
            getDecks(username, setDecks);
        }
        , 5000);

        return () => clearInterval(interval);
    }, [username]);


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
                setLoading(false);
            })
            .catch((error) => {
                setError(error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return null
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            {error && <Toast message={error} onClose={() => setError(null)} />}
            <Grid container direction="column" spacing={2} padding="20px">
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
                    <label style={{ marginLeft: '10px' }}> Deck name: </label>
                    <input
                        type="text"
                        value={deckname}
                        onChange={(e) => setDeckname(e.target.value)}
                    />
                    <Grid container direction="row" spacing={2} style={{ marginTop: '0px' }}>
                        <Grid item>
                            <Button variant="contained" onClick={() => setDeck([])}>Clear Deck</Button>
                        </Grid>
                        <Grid item>
                            <Button disabled={!deckname} variant="contained" onClick={() => submit(deck, username, deckname, setDecks, showErrorToast)}>Submit</Button>
                        </Grid> <Grid item>
                            <Button disabled={!deckname} variant="contained" onClick={() => deleteDeck(deckname, setDeckname, username, setDeck, setDecks, showErrorToast)}>Delete</Button>
                        </Grid> <Grid item>
                            <Button disabled={!deckname || !deck.length} variant="contained" onClick={() => { submit(deck, username, deckname, showErrorToast); newGame(navigate, username, deckname) }}>{deckname ? `New Game with ${deckname}` : 'Name deck to use'}</Button>
                        </Grid> <Grid item>
                            <Button disabled={!deckname || !deck.length} variant="contained" onClick={() => { submit(deck, username, deckname, showErrorToast); joinGame(navigate, prompt('Enter game ID'), username, deckname) }}>{deckname ? `Join Game With ${deckname}` : 'Name deck to use'}</Button>
                        </Grid>
                    </Grid>
                </Grid>
                {decks && <Grid item>
                    <Grid container spacing={2}>
                        {decks.map((deck, i) => (
                            <Grid item key={i}>
                                <Button variant="contained" onClick={() => setDeckFromName(deck)}>{deck}</Button>
                            </Grid>
                        ))}
                    </Grid>
                </Grid>}
                <Grid item>
                    <Grid container direction="row" spacing={2}>
                        {cards.map((card, i) => (
                            <Grid item key={i}>
                                <Slot
                                    card={card}
                                    highlight={false}
                                    elements={card['elements']}
                                    lock={false}
                                    basic={false}
                                    onClick={() => addToDeck(card, deck, setDeck)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
                <Grid item>
                    <h2>Deck</h2>
                </Grid>
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
                                    onClick={() => removeFromDeck(deck.indexOf(card), deck, setDeck)}
                                />
                            </Grid>
                        ))}
                    </Grid>
                </Grid>
            </Grid>
        </div>
    )
}