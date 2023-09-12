import { URL } from './settings';
import { useEffect, useState } from 'react';
import Slot from './Slot';
import { Grid, Button } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import GameInfo from './GameInfo';
import GameLog from './GameLog';
import './GamePage.css';

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

function newGame(setSpins, setGameId, setPlayerState, setActiveCardIndex, setOpponentState, appendToLog) {
    fetchWrapper(`${URL}/new_game`, {}, 'POST')
        .then((res) => res.json())
        .then((data) => {
            setActiveCardIndex(null);
            setGameId(data['gameId']);
            setPlayerState(data['player']);
            setOpponentState(data['opponent']);
            setSpins(3);
            appendToLog('New game started with id ' + data['gameId'])
        }
        );
}

function NewGameButton({ setSpins, setGameId, setPlayerState , setActiveCardIndex , setOpponentState , appendToLog }) {
    function handleClick(e) {
        e.preventDefault();
        newGame(setSpins, setGameId, setPlayerState, setActiveCardIndex, setOpponentState, appendToLog);
    }

    return (
        <div>
            <Button onClick={handleClick}>New Game</Button>
        </div>
    )
}

function spin(spins, setSpins, gameId, locks, playerNum, setPlayerState) {
    if (spins < 1) {
        return;
    }
    
    let locksArg = elements.filter((element) => {
        return locks[element];
    });

    fetchWrapper(`${URL}/spin`, { 'gameId': gameId, 'player': playerNum, 'locks': locksArg }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            setPlayerState(data['player']);
            setSpins(spins - 1);
        }
        );
}


function SpinButton({ spins, setSpins, gameId, locks, playerNum, setPlayerState }) {
    function handleClick(e) {
        e.preventDefault();
        spin(spins, setSpins, gameId, locks, playerNum, setPlayerState)
    }

    return (
        <Button variant="contained" color="primary" disabled={spins <= 0} onClick={handleClick}>
            {`Spin (${spins})`}
        </Button>
    )
}

function submitTurn(gameId, appendToLog, setPlayerState, setLocks, setOpponentState, setSpins) {
    fetchWrapper(`${URL}/submit`, { 'gameId': gameId, 'player': 1 }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            setPlayerState(data['player']);
            setOpponentState(data['opponent']);
            elements.forEach((element) => {
                setLocks[element](false);
            })
            setSpins(3);
            appendToLog(data['log'])
        }
        );
}

function SubmitButton({ gameId, appendToLog, setPlayerState, setLocks, setOpponentState, setSpins }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        setOpen(false);
        submitTurn(gameId, appendToLog, setPlayerState, setLocks, setOpponentState, setSpins);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && open) {
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
            <Button variant="contained" color="primary" onClick={handleClickOpen} style={{ marginLeft: '10px' }}>
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
    gameId,
    playerState,
    setPlayerState,
    element,
    lock,
    setLock,
    activeCardIndex,
    setActiveCardIndex
}) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }

    function onClick() {
        if (activeCardIndex != null) {
            fetchWrapper(`${URL}/play`, { 'gameId': gameId, 'player': 1, 'wheel': element, 'cardIndex': activeCardIndex }, 'POST')
                .then((res) => res.json())
                .then((data) => {
                    setPlayerState(data['player']);
                    setActiveCardIndex(null);
                }
            );
        }
    }

    const wheel = playerState['wheels'][element];

    return (
        <div>
            <Button variant={lock ? "contained" : ""} style={{width: '100%'}} onClick={() => setLock(!lock)}>{lock ? 'unlock' : 'lock'}</Button>
            {wheel['cards'].map((card, index) => (
                <Slot card={card} key={index} lock={lock} basic={index < 5} highlight={index === wheel['active']} onClick={() => onClick()} />
            ))}
        </div>
    )
}

function Hand({ playerState , activeCardIndex, setActiveCardIndex }) {
    if (!playerState) {
        return (
            null
        )
    }

    const hand = playerState['hand'];

    function onClick(index) {
        if (index === activeCardIndex) {
            setActiveCardIndex(null);
            return;
        }
        setActiveCardIndex(index);
    }

    function highlight(index) {
        return index === activeCardIndex;
    }

    return (
        <Grid container spacing={2} style={{ width: '864px'}}>
            {hand.map((card, index) => (
                <Grid item key={index}>
                    <Slot 
                    card={card}
                    key={index}
                    lock={false}
                    basic={false}
                    highlight={highlight(index)}
                    onClick={() => onClick(index)}
                    />
                </Grid>
            ))}
        </Grid>
    )

    return (<div> </div>)
}

function Wheels({ 
    gameId,
    locks, 
    setLocks, 
    playerState,
    setPlayerState,
    activeCardIndex,
    setActiveCardIndex
}) {
    if (!playerState) {
        return null
    }

    return (
        <Grid container spacing={2}>
            {elements.map((element, index) => (
                <Grid item key={index}>
                    <Wheel
                        gameId={gameId}
                        playerState={playerState}
                        element={element}
                        lock={locks[element]}
                        setLock={setLocks[element]}
                        setPlayerState={setPlayerState}
                        activeCardIndex={activeCardIndex}
                        setActiveCardIndex={setActiveCardIndex}
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

    const [spins, setSpins] = useState(3);

    const [playerNum, setPlayerNum] = useState(
        1
    )
    const [playerState, setPlayerState] = useState();
    const [opponentState, setOpponentState] = useState();

    const [gameId, setGameId] = useState();
    const [activeCardIndex, setActiveCardIndex] = useState();

    const [log, setLog] = useState([]);

    const appendToLog = (message) => {
        setLog(log.concat(message));
    }

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
        newGame(setSpins, setGameId, setPlayerState, setActiveCardIndex, setOpponentState, appendToLog);
    }, []);

    useEffect(() => {
        const f = (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                submitTurn(gameId, appendToLog, setPlayerState, setLocks, setOpponentState, setSpins);
            } if (e.shiftKey) {
                if (e.key === 'S') {
                    spin(spins, setSpins, gameId, locks, playerNum, setPlayerState)
                } else if (e.key === 'N') {
                    newGame(setSpins, setGameId, setPlayerState, setActiveCardIndex, setOpponentState, appendToLog);
                }
            } 
        }

        document.addEventListener('keydown', f);

        return () => {
            document.removeEventListener('keydown', f);
        };
    }, [gameId, setPlayerState, setLocks, setOpponentState, setSpins]);

    return (
        <div>
            {/* <NewGameButton setSpins={setSpins} setGameId={setGameId} setPlayerState={setPlayerState} setOpponentState={setOpponentState} setActiveCardIndex={setActiveCardIndex} appendToLog={appendToLog}/> */}
            <Grid container direction="row" style={{marginTop: '10px'}}>
                <Grid item>
                    <SpinButton 
                    spins={spins} 
                    setSpins={setSpins} 
                    locks={locks} 
                    gameId={gameId} 
                    playerNum={playerNum} 
                    setPlayerState={setPlayerState} />
                </Grid>
                <Grid item>
                    <SubmitButton 
                    gameId={gameId}
                    log={log}
                    appendToLog={appendToLog}
                    setLocks={setLocks}
                    setPlayerState={setPlayerState}
                    setOpponentState={setOpponentState}
                    setSpins={setSpins} 
                    />
                </Grid>
            </Grid >
            <GameInfo playerState={playerState} opponentState={opponentState}/>
            <Grid container direction="column" className="cards-container" spacing={2}>
                <Grid item>
                    <Wheels 
                    gameId={gameId}
                    locks={locks} 
                    setLocks={setLocks} 
                    playerState={playerState} 
                    setPlayerState={setPlayerState}
                    activeCardIndex={activeCardIndex} 
                    setActiveCardIndex={setActiveCardIndex}/>
                </Grid>
                <Grid item style={{marginBottom: '30px'}}>
                    <Hand 
                    playerState={playerState} 
                    activeCardIndex={activeCardIndex} 
                    setActiveCardIndex={setActiveCardIndex}/>
                </Grid>
            </Grid>
            <GameLog log={log} />
        </div >
    )
}