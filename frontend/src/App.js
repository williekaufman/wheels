import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GamePage from './GamePage';
import { SocketProvider } from './SocketContext';

function App() {
  return (
    <SocketProvider>
    <Router>
      <Routes>
        <Route path="/game/:game" element={<GamePage />} />
        <Route path="/" element={<GamePage />} />
      </Routes>
    </Router>
    </SocketProvider>
  )
}

export default App;
