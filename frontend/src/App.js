import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GamePage from './GamePage';
import CardsPage from './CardsPage';
import DraftPage from './DraftPage';
import { SocketProvider } from './SocketContext';

function App() {
  return (
    <SocketProvider>
    <Router>
      <Routes>
        <Route path="/" element={<CardsPage />} />
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/decks" element={<CardsPage />} />
        <Route path='/draft' element={<DraftPage />} />
        <Route path="/game/:game" element={<GamePage />} />
      </Routes>
    </Router>
    </SocketProvider>
  )
}

export default App;