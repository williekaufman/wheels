import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GamePage from './GamePage';
import CardsPage from './CardsPage';
import { SocketProvider } from './SocketContext';

function App() {
  return (
    <SocketProvider>
    <Router>
      <Routes>
        <Route path="/cards" element={<CardsPage />} />
        <Route path="/decks" element={<CardsPage />} />
        <Route path="/game/:game" element={<GamePage />} />
        <Route path="/" element={<GamePage />} />
      </Routes>
    </Router>
    </SocketProvider>
  )
}

export default App;