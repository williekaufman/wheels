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
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Typography from '@mui/material/Typography';
import { replaceTextWithImages } from './Icons';
import Turn from './Turn';
import HowToPlay from './HowToPlay';

const elements = ['air', 'earth', 'fire', 'water'];

function admin() {
    return window.location.href.includes('localhost') || localStorage.getItem('spellbooks-admin');
}

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

export function fetchWrapper(url, body, method = 'POST') {
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

function spin(opponentView, gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState) {
    if (spins < 1 || opponentView) {
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

function SpinButton({ opponentView, gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState, submitted, result }) {
    function handleClick(e) {
        e.preventDefault();
        spin(opponentView, gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState);
    }

    return (
        <Button variant="contained" color="primary" disabled={spins <= 0 || submitted || result} onClick={handleClick}>
            {`Spin (${spins})`}
        </Button>
    )
}

function updateState(gameId, playerNum, showErrorToast, setResult, setLog, setLastTurn, setPlayerState, setOpponentState, setSpins, setSubmitted) {
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
            setLastTurn(data['lastTurn']);
            setLog(data['log']);
            data['result'] && setResult(data['result']);
        }
        );
}

function submitTurnForOpponent(gameId, playerNum) {
    fetchWrapper(`${URL}/submit`, { 'gameId': gameId, 'player': (3 - playerNum) }, 'POST')
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

function SubmitButton({ gameId, playerNum, showErrorToast, setLocks, submitted, setSubmitted, result }) {
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
            <Button variant="contained" color="primary" disabled={submitted || result} onClick={handleClickOpen}>
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
    opponentView,
    gameId,
    showErrorToast,
    playerState,
    opponentState,
    setPlayerState,
    element,
    lock,
    setLock,
    activeCardIndex,
    setActiveCardIndex,
    playerNum,
    result
}) {
    if (!playerState) {
        return (
            <div> </div>
        )
    }

    function onClick() {
        if (activeCardIndex != null && !result && !opponentView) {
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

    if (opponentView && !opponentState) {
        return (
            <div> </div>
        )
    }

    const wheel = (opponentView ? opponentState : playerState)['wheels'][element];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h6">{replaceTextWithImages(wheel['description'])}</Typography>
            <Button style={{ width: '100%' }} onClick={() => setLock(!lock)}>{lock ? 'unlock' : 'lock'} {element}</Button>
            {wheel['cards'].map((card, index) => (
                <Slot card={card} key={index} lock={lock} basic={index < 5} elements={[element]} highlight={!opponentView && index === wheel['active']} onClick={() => onClick()} />
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
                        elements={card['elements']}
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
    opponentView,
    gameId,
    showErrorToast,
    locks,
    setLocks,
    playerState,
    opponentState,
    setPlayerState,
    activeCardIndex,
    setActiveCardIndex,
    playerNum,
    result
}) {
    if (!playerState) {
        return null
    }

    return (
        <Grid container spacing={2}>
            {elements.map((element, index) => (
                <Grid item key={index}>
                    <Wheel
                        opponentView={opponentView}
                        gameId={gameId}
                        showErrorToast={showErrorToast}
                        playerState={playerState}
                        opponentState={opponentState}
                        element={element}
                        lock={locks[element]}
                        setLock={setLocks[element]}
                        setPlayerState={setPlayerState}
                        activeCardIndex={activeCardIndex}
                        setActiveCardIndex={setActiveCardIndex}
                        playerNum={playerNum}
                        result={result}
                    />
                </Grid>
            ))}
        </Grid>
    )
}

function ResultBanner({ result, playerNum }) {
    if (!result) {
        return null;
    }

    let desired = (playerNum === 1) ? 'Player One Wins' : 'Player Two Wins';

    let color = (result === desired) ? 'green' : 'red';

    return (
        <div className="result-banner" style={{ backgroundColor: color }}>
            <p>{result}</p>
        </div>
    );
}

function LeftAlignedButtons({
    gameId,
    playerNum,
    showErrorToast,
    spins,
    setSpins,
    locks,
    setLocks,
    setPlayerState,
    opponentState,
    setOpponentState,
    submitted,
    result,
    setSubmitted,
    opponentView,
    setOpponentView
}) {
    return (
        <Grid container direction="row" spacing={2}>
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
                    result={result}
                />
            </Grid>
            <Grid item>
                <SubmitButton
                    gameId={gameId}
                    playerNum={playerNum}
                    showErrorToast={showErrorToast}
                    setLocks={setLocks}
                    setPlayerState={setPlayerState}
                    setOpponentState={setOpponentState}
                    setSpins={setSpins}
                    submitted={submitted}
                    setSubmitted={setSubmitted}
                    result={result}
                />
            </Grid>
            <Grid item>
                <Button disabled={!opponentState} variant="contained" onClick={() => setOpponentView(!opponentView)} >
                    {opponentView ? 'View Your' : 'View Opponent\'s'} Spellbooks
                </Button>
            </Grid>
        </Grid>
    );
}

const copyToClipboard = (str) => {
    const el = document.createElement('textarea');
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
};

function RightAlignedButtons({ navigate, playerNum, showLog, setShowLog, showLastTurn, setShowLastTurn, setHowToPlayOpen , gameId }) {
    return (
        <Grid container direction="row" spacing={2} style={{marginRight: '20px' }}>
            <Grid item> <Button variant="contained" onClick={() => setHowToPlayOpen(true)}>Documentation</Button> </Grid>
            {playerNum === 1 && <Grid item>
                <Button variant="contained" color="primary" onClick={() => copyToClipboard(gameId)}>
                    Copy GameId
                </Button>
            </Grid>}
            <Grid item>
                <Button variant="contained" onClick={() => setShowLog(!showLog)}>
                    {showLog ? 'Hide' : 'Show'} Log
                </Button>
            </Grid>
            <Grid item>
                <Button variant="contained" onClick={() => setShowLastTurn(!showLastTurn)}>
                    {showLastTurn ? 'Hide' : 'Show'} Last Turn
                </Button>
            </Grid>
 
            <Grid item>
            </Grid>
        </Grid>
    );
}

export default function GamePage() {
    const [airLock, setAirLock] = useState(false);
    const [earthLock, setEarthLock] = useState(false);
    const [fireLock, setFireLock] = useState(false);
    const [waterLock, setWaterLock] = useState(false);

    const [spins, setSpins] = useState(3);

    const { game } = useParams();
    const navigate = useNavigate();

    const queryParams = new URLSearchParams(useLocation().search);
    const playerNum = queryParams.get('playerNum') === "2" ? 2 : 1;


    const [playerState, setPlayerState] = useState();
    const [opponentState, setOpponentState] = useState();
    const [result, setResult] = useState();
    
    const [lastTurn, setLastTurn] = useState();
    const [currentAnimation, setCurrentAnimation] = useState();

    const [gameId, setGameId] = useState(game);
    const [activeCardIndex, setActiveCardIndex] = useState();

    const socket = useSocket();

    const [log, setLog] = useState([]);
    const [showLog, setShowLog] = useState(false);
    const [showLastTurn, setShowLastTurn] = useState(false);
    const [error, setError] = useState(null);

    const [howToPlayOpen, setHowToPlayOpen] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [opponentView, setOpponentView] = useState(false);

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
            updateState(gameId, playerNum, showErrorToast, setResult, setLog, setLastTurn, setPlayerState, setOpponentState, setSpins, setSubmitted);
        })

        return onClose
    }, [socket]);

    useEffect(() => {
        updateState(gameId, playerNum, showErrorToast, setResult, setLog, setLastTurn, setPlayerState, setOpponentState, setSpins, setSubmitted);
    }, [gameId]);

    useEffect(() => {
        const f = (e) => {
            if (e.shiftKey) {
                if (e.key === 'Enter') {
                    if (admin() && e.ctrlKey) {
                        submitTurnForOpponent(gameId, playerNum);
                    } else {
                        submitTurn(gameId, playerNum, showErrorToast, setLocks, setSubmitted);
                    }
                }
                if (e.key === 'S') {
                    spin(opponentView, gameId, playerNum, showErrorToast, spins, setSpins, locks, setPlayerState);
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
            <ResultBanner result={result} playerNum={playerNum} />
            {howToPlayOpen && <HowToPlay onClose={() => setHowToPlayOpen(false)} />}
            <Grid container direction="row" style={{ marginTop: '10px', marginLeft: '10px', justifyContent: 'space-between' }}>
                <Grid item>
                    <LeftAlignedButtons
                        gameId={gameId}
                        playerNum={playerNum}
                        showErrorToast={showErrorToast}
                        spins={spins}
                        setSpins={setSpins}
                        locks={locks}
                        setLocks={setLocks}
                        setPlayerState={setPlayerState}
                        opponentState={opponentState}
                        setOpponentState={setOpponentState}
                        submitted={submitted}
                        result={result}
                        setSubmitted={setSubmitted}
                        opponentView={opponentView}
                        setOpponentView={setOpponentView}
                    />
                </Grid>
                <Grid item>
                    <RightAlignedButtons
                        navigate={navigate}
                        playerNum={playerNum}
                        showLog={showLog}
                        setShowLog={setShowLog}
                        showLastTurn={showLastTurn}
                        setShowLastTurn={setShowLastTurn}
                        showErrorToast={showErrorToast}
                        setHowToPlayOpen={setHowToPlayOpen}
                        gameId={gameId} />
                </Grid>
            </Grid >
            <GameInfo playerState={playerState} opponentState={opponentState} />
            {showLastTurn && <Grid item>
                <Turn turn={lastTurn} playerNum={playerNum}/>
            </Grid>}
            <Grid container direction="column" className="cards-container" spacing={2} style={{marginTop: '10px'}}>
                <Grid item>
                    <Wheels
                        opponentView={opponentView}
                        gameId={gameId}
                        showErrorToast={showErrorToast}
                        locks={locks}
                        setLocks={setLocks}
                        playerState={playerState}
                        opponentState={opponentState}
                        setPlayerState={setPlayerState}
                        activeCardIndex={activeCardIndex}
                        setActiveCardIndex={setActiveCardIndex}
                        playerNum={playerNum}
                        result={result}
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