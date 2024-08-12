import React, { useState, useEffect } from 'react';
import './Calculator.css';

const CalculatorLongPolling = () => {
    const [result, setResult] = useState('');
    const [logs, setLogs] = useState([]);
    const [lastLogTime, setLastLogTime] = useState('');
    const [counter, setCounter] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchLogs = async () => {
            setLoading(true);
            try {
                const timestamp = new Date().getTime();
                const response = await fetch(`https://calculator-protocols.onrender.com/api/long-polling?lastLogTime=${lastLogTime}&_=${timestamp}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                const data = await response.json();
                if (data.length > 0) {
                    setLogs(data); // Set logs to the latest 5 logs
                    setLastLogTime(data[data.length - 1]._id); // Update lastLogTime with the most recent log ID
                    console.log('Fetched latest logs:', data);
                }
            } catch (error) {
                console.error('Error fetching logs:', error);
            } finally {
                setLoading(false);
            }
        };

        // Fetch logs after every 5 successful evaluations
        if (counter > 0 && counter % 5 === 0) {
            console.log('Fetching logs after 5 successful evaluations');
            fetchLogs();
        }
    }, [counter, lastLogTime]);

    const insertValue = (value) => setResult(result + value);
    const clearResult = () => setResult('');
    const deleteResult = () => setResult(result.slice(0, -1));

    const calculate = async () => {
        if (!result) return alert('Expression is empty');
        let isValid = true;
        let output;
        try {
            output = new Function(`return ${result}`)();
            setResult(output.toString());
        } catch (e) {
            isValid = false;
            output = 'error';
            setResult('error');
        }
        try {
            const response = await fetch('https://calculator-protocols.onrender.com/api/logs', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ expression: result, is_valid: isValid, output })
            });

            if (!response.ok) {
                throw new Error('Error logging expression');
            }

            setCounter((prevCounter) => prevCounter + 1); // Increment counter

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
                {loading && <p>Loading logs...</p>}
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

export default CalculatorLongPolling;

