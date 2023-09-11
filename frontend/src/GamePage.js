import { URL } from './settings';
import { useEffect, useState } from 'react';
import Slot from './Slot';
import { Grid, Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

const elements = ['fire', 'water', 'earth', 'air'];

function makeRequestOptions(body, method = 'POST') {
    if (method === 'GET') {
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
    if (method === 'GET') {
        if (body) {
            url = `${url}?`;
        }
        for (var key in body) {
            url = `${url}${key}=${body[key]}&`;
        }
    }
    return fetch(url, makeRequestOptions(body, method)).catch((error) => {  
        console.log(error);
    });
}

function newGame(setSpins, setGameId, setPlayerState) {
    fetchWrapper(`${URL}/new_game`, {}, 'POST')
        .then((res) => res.json())
        .then((data) => {
            setGameId(data['gameId']);
            setPlayerState(data['player']);
            setSpins(3);
        }
        );
}

function NewGameButton({ setSpins, setGameId, setPlayerState }) {
    function handleClick(e) {
        e.preventDefault();
        fetchWrapper(`${URL}/new_game`, {}, 'POST')
            .then((res) => res.json())
            .then((data) => {
                setGameId(data['gameId']);
                setPlayerState(data['player']);
                setSpins(3);
            }
            );
    }

    return (
        <div>
            <Button onClick={handleClick}>New Game</Button>
        </div>
    )
}

function SpinButton({ spins, setSpins, gameId, locks, playerNum, setPlayerState }) {
    let locksArg = elements.filter((element) => {
        return locks[element];
    });

    function handleClick(e) {
        fetchWrapper(`${URL}/spin`, { 'gameId': gameId, 'player': playerNum, 'locks': locksArg }, 'POST')
            .then((res) => res.json())
            .then((data) => {
                setPlayerState(data['player']);
                setSpins(spins - 1);
            }
            );
    }

    return (
        <Button variant="contained" color="primary" disabled={spins <= 0} onClick={handleClick}>
            {`Spin (${spins})`}
        </Button>
    )
}

function SubmitButton({ gameId , setPlayerState , setSpins }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        setOpen(false);
        fetchWrapper(`${URL}/submit`, { 'gameId': gameId, 'player': 1 }, 'POST')
            .then((res) => res.json())
            .then((data) => {
                setPlayerState(data['player']);
                setSpins(3);
            }
            );
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleConfirm();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    });

    return (
        <div>
            <Button variant="contained" color="primary" onClick={handleClickOpen} style={{marginLeft: '10px'}}>
                Submit
            </Button>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Confirmation</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to submit?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        color="primary"
                    >
                        Confirm
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

function Wheel({
    playerState,
    element,
    lock,
    setLock
}) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }


    const wheel = playerState['wheels'][element];

    return (
        <div>
            <Button onClick={() => setLock(!lock)}>{lock ? 'unlock' : 'lock'}</Button>
            {wheel['cards'].map((card, index) => (
                <Slot card={card} key={index} lock={lock} highlight={index === wheel['active']} />
            ))}
        </div>
    )
}

function Wheels({ locks, setLocks, playerState }) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }

    return (
        <Grid container spacing={2}>
            {elements.map((element, index) => (
                <Grid item xs={2} key={index}>
                    <Wheel
                        playerState={playerState}
                        element={element}
                        lock={locks[element]}
                        setLock={setLocks[element]}
                    />
                </Grid>
            ))}
        </Grid>
    )

}

export default function GamePage() {
    const [airLock, setAirLock] = useState(false);
    const [earthLock, setEarthLock] = useState(false);
    const [fireLock, setFireLock] = useState(false);
    const [waterLock, setWaterLock] = useState(false);

    const [currentAction, setCurrentAction] = useState('playing');
    const [spins, setSpins] = useState(3);

    const [playerNum, setPlayerNum] = useState(
        1
    )
    const [playerState, setPlayerState] = useState();
    const [gameId, setGameId] = useState();

    let locks = {
        'air': airLock,
        'earth': earthLock,
        'fire': fireLock,
        'water': waterLock
    }

    let setLocks = {
        'air': setAirLock,
        'earth': setEarthLock,
        'fire': setFireLock,
        'water': setWaterLock,
    }

    useEffect(() => {
        newGame(setSpins, setGameId, setPlayerState);
    }, []);

    return (
        <div>
            <NewGameButton setSpins={setSpins} setGameId={setGameId} setPlayerState={setPlayerState} />
            <Grid container direction="row">
                <Grid item>
                    <SpinButton spins={spins} setSpins={setSpins} locks={locks} gameId={gameId} playerNum={playerNum} setPlayerState={setPlayerState} />
                </Grid>
                <Grid item>
                    <SubmitButton gameId={gameId} setPlayerState={setPlayerState} setSpins={setSpins} />
                </Grid>
            </Grid >
            <Wheels locks={locks} setLocks={setLocks} playerState={playerState}/>
        </div >
    )
}