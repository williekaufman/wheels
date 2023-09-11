import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GamePage from './GamePage';

function App() {
  return (
    <Router>
    <Routes>
      <Route path="/" element={<GamePage />} />
    </Routes>
    </Router>
    )
}

export default App;
