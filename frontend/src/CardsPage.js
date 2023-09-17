import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Slot from './Slot.js';
import { URL } from './settings';
import Button from '@mui/material/Button';
import Toast from './Toast.js';
import { useNavigate } from 'react-router-dom';
import Paper from '@mui/material/Paper';
import { fetchWrapper } from './GamePage.js';
import { useRef } from 'react';

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
                showErrorToast(response['error']);
            }
            getDecks(username, setDecks, showErrorToast);
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
            getDecks(username, setDecks, showErrorToast);
            setDeck([]);
            setDeckname('');
            return response.json();
        }
        )
}

function getDecks(username, setDecks, showErrorToast) {
    fetchWrapper(`${URL}/decks`, { 'username': username }, 'GET')
        .then((response) => {
            if (response['error']) {
                showErrorToast(response['error']);
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

function joinGame(navigate, gameId, username, deckname, showErrorToast) {
    if (!gameId) {
        return;
    }
    return fetchWrapper(`${URL}/join_game`, { 'username': username, 'deckname': deckname, 'gameId': gameId }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            if (data['error']) {
                showErrorToast(data['error']);
                return;
            }
            navigate(`/game/${data['gameId']}?playerNum=2`);
            window.location.reload();
        }
        );
}

function draft(navigate, numChoices, decksize) {
    let url = '/draft?' + new URLSearchParams({ numChoices: numChoices, decksize: decksize });
    navigate(url);
}

function draftButtonDisabled(numChoices, decksize) {
    return isNaN(numChoices) || isNaN(decksize) || numChoices < 1 || decksize < 1;
}



function DraftingModal({ navigate, setDraftingModalOpen, numChoices, setNumChoices, decksize, setDecksize }) {
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                setDraftingModalOpen(false);
            } if (event.key === 'Enter') {
                draft(navigate, numChoices, decksize);
            }
        };

        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setDraftingModalOpen(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [setDraftingModalOpen, decksize, navigate, numChoices]);

    const modalRef = useRef(null);

    return (
        <div style={styles.overlay}>
            <div ref={modalRef} style={styles.modal}>
                <div style={styles.inputGroup}>
                    <label>
                        Number of Choices:
                        <input
                            value={numChoices}
                            onChange={(e) => setNumChoices(e.target.value)}
                            style={styles.input}
                        />
                    </label>
                </div>
                <div style={styles.inputGroup}>
                    <label>
                        Deck Size:
                        <input
                            value={decksize}
                            onChange={(e) => setDecksize(e.target.value)}
                            style={styles.input}
                        />
                    </label>
                </div>
                <div>
                    <Grid container direction="row" justifyContent="space-between">
                        <Grid item>
                            <Button
                                variant="contained"
                                onClick={() => setDraftingModalOpen(false)}
                            >
                                Close
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                disabled={draftButtonDisabled(numChoices, decksize)}
                                onClick={() => draft(navigate, numChoices, decksize)}
                                variant="contained"
                            >
                                Submit
                            </Button>
                        </Grid>
                    </Grid>
                </div>
            </div>
        </div>
    );
}

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        padding: '20px',
        maxWidth: '400px',
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        zIndex: 10,
    },
    inputGroup: {
        marginBottom: '10px',
        zIndex: 10
    },
    input: {
        marginLeft: '10px',
        padding: '5px',
        borderRadius: '4px',
        border: '1px solid #ccc'
    },
};


export default function CardsPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deck, setDeck] = useState([]);
    const [decks, setDecks] = useState([]);
    const [username, setUsername] = useState(localStorage.getItem('spellbooks-username') || '');
    const [deckname, setDeckname] = useState('');
    const [cardnameFilter, setCardnameFilter] = useState('');
    const [elementFilter, setElementFilter] = useState();
    const [numChoices, setNumChoices] = useState(5);
    const [decksize, setDecksize] = useState(20);
    const [draftingModalOpen, setDraftingModalOpen] = useState(false);
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
            .catch((e) => {
                setError(e);
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
            getDecks(username, setDecks, showErrorToast);
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

    const elements = ['fire', 'water', 'earth', 'air'];

    function filterByNames(card) {
        if (cardnameFilter) {
            let regex;
            try {
                regex = new RegExp(cardnameFilter.toLowerCase());
            } catch (e) {
                return false;
            }
            return regex.test(card.name.toLowerCase());
        } else {
            return true;
        }
    }

    function filterByElements(card) {
        if (elementFilter) {
            let neutral = elements.every((element) => card.elements.includes(element));
            if (elementFilter === 'neutral') {
                return neutral
            }
            return card.elements.includes(elementFilter) && !neutral;
        }
        return true;
    }

    if (loading) {
        return null
    }

    return (
        <div>
            {error && <Toast message={error} onClose={() => setError(null)} />}
            {draftingModalOpen && <DraftingModal
                navigate={navigate}
                setDraftingModalOpen={setDraftingModalOpen}
                numChoices={numChoices}
                setNumChoices={setNumChoices}
                decksize={decksize}
                setDecksize={setDecksize}
            />}
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
                    <label style={{ marginLeft: '10px' }}> Card name filter: </label>
                    <input
                        type="text"
                        value={cardnameFilter}
                        onChange={(e) => setCardnameFilter(e.target.value)}
                    />
                    <label style={{ marginLeft: '10px' }}> Element filter: </label>
                    <select
                        value={elementFilter}
                        onChange={(e) => setElementFilter(e.target.value)}
                    >
                        <option value="">Any</option>
                        <option value="fire">Fire</option>
                        <option value="water">Water</option>
                        <option value="earth">Earth</option>
                        <option value="air">Air</option>
                        <option value="neutral">Neutral</option>
                    </select>
                    <Grid container direction="row" spacing={2} style={{ marginTop: '0px' }}>
                        <Grid item>
                            <Button disabled={draftingModalOpen} variant="contained" onClick={() => setDraftingModalOpen(true)}>Draft</Button>
                        </Grid>
                        <Grid item>
                            <Button disabled={draftingModalOpen || !deck.length} variant="contained" onClick={() => setDeck([])}>Clear Deck</Button>
                        </Grid>
                        <Grid item>
                            <Button disabled={draftingModalOpen || !deckname} variant="contained" onClick={() => submit(deck, username, deckname, setDecks, showErrorToast)}>Submit</Button>
                        </Grid> <Grid item>
                            <Button disabled={draftingModalOpen || !deckname} variant="contained" onClick={() => deleteDeck(deckname, setDeckname, username, setDeck, setDecks, showErrorToast)}>Delete</Button>
                        </Grid> <Grid item>
                            <Button disabled={draftingModalOpen || !deckname || !deck.length} variant="contained" onClick={() => { submit(deck, username, deckname, setDecks, showErrorToast); newGame(navigate, username, deckname) }}>{deckname ? `New Game with ${deckname}` : 'Name deck to use'}</Button>
                        </Grid> <Grid item>
                            <Button disabled={draftingModalOpen || !deckname || !deck.length} variant="contained" onClick={() => { submit(deck, username, deckname, setDecks, showErrorToast); joinGame(navigate, prompt('Enter Game Id'), username, deckname, showErrorToast) }}>{deckname ? `Join Game With ${deckname}` : 'Name deck to use'}</Button>
                        </Grid>
                    </Grid>
                </Grid>
                {decks && <Grid item>
                    <Paper style={{ padding: '10px', backgroundColor: 'lightblue' }}>
                        <Grid container spacing={2}>
                            {decks.map((deck, i) => (
                                <Grid item key={i}>
                                    <Button disabled={draftingModalOpen} variant="contained" style={draftingModalOpen || deck !== deckname ? {} : { backgroundColor: 'red' }} onClick={() => setDeckFromName(deck)}>{deck}</Button>
                                </Grid>
                            ))}
                        </Grid>
                    </Paper>
                </Grid>}
                {deck.length !== 0 && <Grid item>
                    <Paper style={{ padding: '10px', backgroundColor: 'lightyellow' }}>
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
                    </Paper>
                </Grid>}

                <Grid item>
                    <Paper style={{ padding: '10px', backgroundColor: 'lightgreen' }}>
                        <Grid container direction="row" spacing={2}>
                            {cards.map((card, i) => (
                                filterByNames(card) && filterByElements(card) &&
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
                            {cards.filter(filterByNames).filter(filterByElements).length === 0 && <Grid item>
                                <label> No results </label>
                            </Grid>}
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </div>
    )
}