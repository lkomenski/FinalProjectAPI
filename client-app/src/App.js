import logo from './logo.svg';
import './App.css';
import Home from './components/Home';
import Login from './components/Login';
import About from './components/About';

import { BrowserRouter, Link, Route, Routes } from 'react-router';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Home</Link> | <Link to="/about">About</Link> |{' '}
        <Link to="/login">Login</Link> | <Link to="/weather">Weather</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;