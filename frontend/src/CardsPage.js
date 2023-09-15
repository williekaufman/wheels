import React, { useState, useEffect } from 'react';
import Grid from '@mui/material/Grid';
import Slot from './Slot.js';
import { URL } from './settings';

import { fetchWrapper } from './GamePage.js';

export default function CardsPage() {
    const [cards, setCards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchWrapper(`${URL}/cards`, {}, 'GET')
            .then((response) => {
                if (!response.ok) {
                    throw Error('Failed to load cards');
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
        <Grid container direction="row" spacing={2} padding="20px">
            {cards.map((card) => (
                <Grid item>
                    <Slot key={card.id} card={card} highlight={false} elements={card['elements']} lock={false} basic={false} />
                </Grid>
            ))}
        </Grid>
    );
};