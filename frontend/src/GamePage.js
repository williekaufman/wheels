import { URL } from './settings';
import { useState, useEffect } from 'react';

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
    }
    
    return (
        <div>
            <button onClick={handleClick}>New Game</button>
        </div>
    )
}

export default function GamePage() {
    return (
        <div>
            <h1>Game Page</h1>
            <NewGameButton />
        </div>
    )
}