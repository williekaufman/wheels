import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Slot from './Slot.js';
import { URL } from './settings';
import Button from '@mui/material/Button';
import Toast from './Toast.js';

import { fetchWrapper } from './GamePage.js';

function addToDeck(card, deck, setDeck) {
    setDeck([...deck, card]);
}

function removeFromDeck(index, deck, setDeck) {
    setDeck(deck.filter((card, i) => i !== index));
}

function submit(deck, username, deckname, showErrorToast) {
    fetchWrapper(`${URL}/decks`, { 'deck': deck, 'username': username, 'deckname': deckname }, 'POST')
        .then((response) => {
            if (response['error']) {
                console.log(response['error']);
                showErrorToast(response['error']);
            }
            return response.json();
        }
        )
}

function deleteDeck(deckname, username, showErrorToast) {
    fetchWrapper(`${URL}/decks/delete/${deckname}`, { 'username': username }, 'POST')
        .then((response) => {
            if (response['error']) {
                showErrorToast(response['error']);
            }
            return response.json();
        }
        )
}

export default function CardsPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deck, setDeck] = useState([]);
    const [decks, setDecks] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('spellbooks-username') || '');
    const [deckname, setDeckname] = useState('');

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
        const f = async () => {
            const response = await fetchWrapper(`${URL}/decks`, { 'username': username }, 'GET');
            if (response['error']) {
                showErrorToast(response['error']);
            }
            const data = await response.json();
            setDecks(data['decks']);
        }

        f();

        const interval = setInterval(() => {
            f();
        }
            , 5000);

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
                    <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => submit(deck, username, deckname, showErrorToast)}>Submit</Button>
                    <Button variant="contained" style={{ marginLeft: '20px' }} onClick={() => deleteDeck(deckname, username, showErrorToast)}>Delete</Button>
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