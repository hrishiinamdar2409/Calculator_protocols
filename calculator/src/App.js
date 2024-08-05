// src/App.js
import React from 'react';
import CalculatorShortPolling from './components/CalculatorShortPolling';
import CalculatorLongPolling from './components/CalculatorLongPolling';
import CalculatorWebSocket from './components/CalculatorWebSocket';
import Calculator from './components/Calculator';
import './components/Calculator.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

function App() {
    return (
      <Router>
        <Routes>
        <Route path="/" element={<Calculator/>} />
          <Route path="/calculator/short-polling" element={<CalculatorShortPolling />} />
          <Route path="/calculator/long-polling" element={<CalculatorLongPolling />} />
          <Route path="/calculator/web-socket" element={<CalculatorWebSocket />} />
        </Routes>
      </Router>
    );
  }
export default App;
