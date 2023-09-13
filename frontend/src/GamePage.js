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
import { useSocket } from './SocketContext';
import Toast from './Toast';
import { useLocation, useParams , useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';

const elements = ['air', 'earth', 'fire', 'water'];

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

function newGame(navigate) {
    return fetchWrapper(`${URL}/new_game`, {}, 'POST')
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

function spin(gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState) {
    if (spins < 1) {
        return;
    }

    let locksArg = elements.filter((element) => {
        return locks[element];
    });

    fetchWrapper(`${URL}/spin`, { 'gameId': gameId, 'player': playerNum, 'locks': locksArg }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            if (data['error']) {
                showErrorToast(data['error']);
                return;
            }
            setPlayerState(data['player']);
            setSpins(spins - 1);
        }
        );
}

function SpinButton({ gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState, submitted }) {
    function handleClick(e) {
        e.preventDefault();
        spin(gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState);
    }

    return (
        <Button variant="contained" color="primary" disabled={spins <= 0 || submitted} onClick={handleClick}>
            {`Spin (${spins})`}
        </Button>
    )
}

function updateState(gameId, playerNum, showErrorToast, setResult, setLog, setPlayerState, setOpponentState, setSpins, setSubmitted) {
    fetchWrapper(`${URL}/state`, { 'gameId': gameId, 'player': playerNum }, 'GET')
        .then((res) => res.json())
        .then((data) => {
            if (data['error']) {
                showErrorToast(data['error']);
                return;
            }
            setPlayerState(data['player']);
            setOpponentState(data['opponent']); 
            setSpins(data['player']['spins']);
            setSubmitted(data['submitted']);
            setLog(data['log']);
            data['result'] && setResult(data['result']);
        }
        );
}

function submitTurn(gameId, playerNum, showErrorToast, setLocks, setSubmitted) {
    fetchWrapper(`${URL}/submit`, { 'gameId': gameId, 'player': playerNum }, 'POST')
        .then((res) => res.json())
        .then((data) => {
            if (data['error']) {
                showErrorToast(data['error']);
                return;
            }
            elements.forEach((element) => {
                setLocks[element](false);
            })
            setSubmitted(true);
        }
        );
}

function SubmitButton({ gameId, playerNum, showErrorToast, setLog, setLocks, submitted , setSubmitted }) {
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleConfirm = () => {
        setOpen(false);
        submitTurn(gameId, playerNum, showErrorToast, setLocks, setSubmitted);
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
            <Button variant="contained" color="primary" disabled={submitted} onClick={handleClickOpen} style={{ marginLeft: '10px' }}>
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
    showErrorToast,
    playerState,
    setPlayerState,
    element,
    lock,
    setLock,
    activeCardIndex,
    setActiveCardIndex,
    playerNum
}) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }

    function onClick() {
        if (activeCardIndex != null) {
            fetchWrapper(`${URL}/play`, { 'gameId': gameId, 'player': playerNum, 'wheel': element, 'cardIndex': activeCardIndex }, 'POST')
                .then((res) => res.json())
                .then((data) => {
                    if (data['error']) {
                        showErrorToast(data['error']);
                        return;
                    }
                    setPlayerState(data['player']);
                    setActiveCardIndex(null);
                }
                );
        }
    }

    const wheel = playerState['wheels'][element];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Button variant={lock ? "contained" : ""} style={{ width: '100%' }} onClick={() => setLock(!lock)}>{lock ? 'unlock' : 'lock'} {element}</Button>
            {wheel['cards'].map((card, index) => (
                <Slot card={card} key={index} lock={lock} basic={index < 5} highlight={index === wheel['active']} onClick={() => onClick()} />
            ))}
        </div>
    )
}

function Hand({ playerState, activeCardIndex, setActiveCardIndex }) {
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
        <Grid container spacing={2} style={{ width: '864px' }}>
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
    showErrorToast,
    locks,
    setLocks,
    playerState,
    setPlayerState,
    activeCardIndex,
    setActiveCardIndex,
    playerNum
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
                        showErrorToast={showErrorToast}
                        playerState={playerState}
                        element={element}
                        lock={locks[element]}
                        setLock={setLocks[element]}
                        setPlayerState={setPlayerState}
                        activeCardIndex={activeCardIndex}
                        setActiveCardIndex={setActiveCardIndex}
                        playerNum={playerNum}
                    />
                </Grid>
            ))}
        </Grid>
    )
}

function ResultBanner({ result , playerNum }) {
  if (!result) {
    return null;
  }

  let desired = (playerNum === 1) ? 'Player One Wins': 'Player Two Wins';
  
  let color = (result === desired) ? 'green' : 'red';

  console.log(desired, result);

  return (
    <div className="result-banner" style={{ backgroundColor: color }}>
      <p>{result}</p>
    </div>
  );
}


export default function GamePage() {
    const [airLock, setAirLock] = useState(false);
    const [earthLock, setEarthLock] = useState(false);
    const [fireLock, setFireLock] = useState(false);
    const [waterLock, setWaterLock] = useState(false);

    const [spins, setSpins] = useState(3);

    const location = useLocation();

    const { game } = useParams();
    const navigate = useNavigate();
   
    const queryParams = new URLSearchParams(location.search);
    const playerNum = queryParams.get('playerNum') === "2" ? 2 : 1;

    
    const [playerState, setPlayerState] = useState();
    const [opponentState, setOpponentState] = useState();
    const [result, setResult] = useState();
    
    const [gameId, setGameId] = useState(game);
    const [activeCardIndex, setActiveCardIndex] = useState();

    const socket = useSocket();

    const [log, setLog] = useState([]);
    const [showLog, setShowLog] = useState(true);
    const [error, setError] = useState(null);

    const [submitted, setSubmitted] = useState(false);

    const showErrorToast = (message) => {
        setError(message);

        setTimeout(() => {
            setError(null);
        }, 5000);
    };

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

    function onClose() {
        gameId && socket.emit('leave', { room: gameId })
    }

    useEffect(() => {
        if (!socket) return;

        socket.on('connect', () => {
            gameId && socket.emit('join', { room: gameId })
        });

        socket.on('update', () => {
            console.log(gameId, 'updating');
            updateState(gameId, playerNum, showErrorToast, setResult, setLog, setPlayerState, setOpponentState, setSpins, setSubmitted);
        })

        return onClose
    }, [socket]);

    useEffect(() => { 
        if (gameId) {
            updateState(gameId, playerNum, showErrorToast, setResult, setLog, setPlayerState, setOpponentState, setSpins, setSubmitted); 
        } else {
            newGame(navigate)
        }
    }, [gameId]);

    useEffect(() => {
        const f = (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                submitTurn(gameId, playerNum, showErrorToast, setLocks, setSubmitted);
            } if (e.shiftKey) {
                if (e.key === 'S') {
                    spin(gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState);
                } if (e.key === 'L') {
                    setShowLog(!showLog);
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
            <ResultBanner result={result} playerNum={playerNum}/>
            <Grid container direction="row" style={{ marginTop: '10px' }}>
                <Grid item>
                    <SpinButton
                        gameId={gameId}
                        playerNum={playerNum}
                        showErrorToast={showErrorToast}
                        spins={spins}
                        setSpins={setSpins}
                        locks={locks}
                        setPlayerState={setPlayerState} 
                        submitted={submitted}
                        />
                </Grid>
                <Grid item>
                    <SubmitButton
                        gameId={gameId}
                        playerNum={playerNum}
                        showErrorToast={showErrorToast}
                        setLog={setLog}
                        setLocks={setLocks}
                        setPlayerState={setPlayerState}
                        setOpponentState={setOpponentState}
                        setSpins={setSpins}
                        submitted={submitted}
                        setSubmitted={setSubmitted}
                    />
                </Grid>
            </Grid >
            <GameInfo playerState={playerState} opponentState={opponentState} />
            <Grid container direction="column" className="cards-container" spacing={2}>
                <Grid item>
                    <Wheels
                        gameId={gameId}
                        showErrorToast={showErrorToast}
                        locks={locks}
                        setLocks={setLocks}
                        playerState={playerState}
                        setPlayerState={setPlayerState}
                        activeCardIndex={activeCardIndex}
                        setActiveCardIndex={setActiveCardIndex} 
                        playerNum={playerNum}
                        />
                </Grid>
                <Grid item style={{ marginBottom: '30px' }}>
                    <Hand
                        playerState={playerState}
                        activeCardIndex={activeCardIndex}
                        setActiveCardIndex={setActiveCardIndex} />
                </Grid>
            </Grid>
            {showLog && <GameLog log={log} />}
            {error && <Toast message={error} onClose={() => setError(null)} />}
        </div >
    )
}