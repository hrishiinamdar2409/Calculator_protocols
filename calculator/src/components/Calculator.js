import React from 'react';
import { Link } from 'react-router-dom';
import './Calculator.css'

const Calculator = () => {


  return (
    <div className="container">
        <Link to={'/calculator/short-polling'}> ShortPollingCalculator</Link>
        <Link to={'/calculator/long-polling'}> LongPollingCalculator</Link>
        <Link to={'/calculator/web-socket'}> WebSocketCalculator</Link>
    </div>
  );
};

export default Calculator;