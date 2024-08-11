import React, { useState, useEffect, useCallback } from 'react';
import io from 'socket.io-client';
import './Calculator.css';

// Initialize socket connection
const socket = io('http://localhost:5000');

const CalculatorWebSocket = () => {
    const [result, setResult] = useState('');
    const [logs, setLogs] = useState([]);

    // Handle initial logs (when component mounts)
    const handleInitialLogs = useCallback((initialLogs) => {
        setLogs(initialLogs);
    }, []);

    // Handle new logs broadcasted by the server
    const handleNewLog = useCallback((newLog) => {
        setLogs(prevLogs => [newLog, ...prevLogs]);
    }, []);

    useEffect(() => {
        // Listen for the initial logs event
        socket.on('initialLogs', handleInitialLogs);
        // Listen for new log events from the server
        socket.on('newLog', handleNewLog);

        // Request the initial logs when component mounts
        socket.emit('requestLogs');

        return () => {
            socket.off('initialLogs', handleInitialLogs);
            socket.off('newLog', handleNewLog);
        };
    }, [handleInitialLogs, handleNewLog]);

    const insertValue = (value) => setResult(result + value);
    const clearResult = () => setResult('');
    const deleteResult = () => setResult(result.slice(0, -1));

    const calculate = async () => {
        if (!result) return alert('Expression is empty');
        let isValid = true;
        let output;
        try {
            output = eval(result);
            setResult(output.toString());
        } catch (e) {
            isValid = false;
            output = 'error';
            setResult('error');
        }
        try {
            await fetch('http://localhost:5000/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression: result, is_valid: isValid, output })
            });
        } catch (error) {
            console.error('Error logging expression:', error);
        }
    };

    return (
        <div className="container">
            <div className="calculator">
                <div className="display">
                    <input type="text" value={result} disabled />
                </div>
                <div className="button">
                    <button onClick={clearResult}>AC</button>
                    <button onClick={deleteResult}>DEL</button>
                    <button onClick={() => insertValue('%')}>%</button>
                    <button onClick={() => insertValue('/')}>/</button>
                    <button onClick={() => insertValue('7')}>7</button>
                    <button onClick={() => insertValue('8')}>8</button>
                    <button onClick={() => insertValue('9')}>9</button>
                    <button onClick={() => insertValue('*')}>*</button>
                    <button onClick={() => insertValue('4')}>4</button>
                    <button onClick={() => insertValue('5')}>5</button>
                    <button onClick={() => insertValue('6')}>6</button>
                    <button onClick={() => insertValue('-')}>-</button>
                    <button onClick={() => insertValue('1')}>1</button>
                    <button onClick={() => insertValue('2')}>2</button>
                    <button onClick={() => insertValue('3')}>3</button>
                    <button onClick={() => insertValue('+')}>+</button>
                    <button onClick={() => insertValue('00')}>00</button>
                    <button onClick={() => insertValue('0')}>0</button>
                    <button onClick={() => insertValue('.')}>.</button>
                    <button className="eg" onClick={calculate}>=</button>
                </div>
            </div>
            <div className="logs">
                <h2>Logs</h2>
                <ul>
                    {logs.map((log, index) => (
                        <li key={index}>
                            {log.expression} = {log.output} ({log.is_valid ? 'Valid' : 'Invalid'})<br />
                            <small>Created on: {new Date(log.created_on).toLocaleString()}</small>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default CalculatorWebSocket;
