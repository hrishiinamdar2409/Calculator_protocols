const CalculatorLog = require('../models/calculatorLog');
const logger = require('../utils/logger');
const  io  = require('../app');
const { Readable } = require('stream');


exports.addLog = async (req, res) => {
    const { expression, is_valid, output } = req.body;
    const io = req.app.get('io');

    if (!expression) {
        logger.info('Empty expression provided');
        return res.status(400).send({ error: 'Expression is empty' });
    }

    try {
        const log = await CalculatorLog.create({
            expression,
            is_valid,
            output,
            created_on: new Date()
        });
        logger.info(`Expression logged: ${expression}`);

        // Emit the new log to all connected WebSocket clients
        io.emit('newLog', log);

        res.status(201).send(log);
    } catch (error) {
        logger.error(`Error logging expression: ${error}`);
        res.status(500).send({ error: 'Failed to log expression' });
    }
};

exports.getLogs = async (req, res) => {
    try {
        const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);
        logger.info('Fetched last 10 logs');
        res.send(logs);
    } catch (error) {
        logger.error(`Error fetching logs: ${error.message}`);
        res.status(500).send({ error: 'Failed to fetch logs' });
    }
};

exports.shortPolling = async (req, res) => {
    const { lastLogTime } = req.query;

    try {
        console.log(lastLogTime);
        
        const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);

        res.send(logs);
    } catch (error) {
        logger.error(`Error fetching logs: ${error.message}`);
        res.status(500).send({ error: 'Failed to fetch logs' });
    }
};

exports.longPolling = async (req, res) => {
    const { lastLogTime } = req.query;

    // Set headers for streaming
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Fetch and stream logs
    const fetchLogs = async () => {
        try {
            let query = {};
            if (lastLogTime) {
                query = { _id: { $gt: lastLogTime } }; 
            }

            
            const logs = await CalculatorLog.find(query)
                .sort({ _id: -1 }) // Sort in descending order to get the latest logs
                .limit(5); // Fetch only the 5 latest records

            
            res.json(logs.reverse()); 
        } catch (error) {
            console.error('Error fetching logs:', error);
            res.status(500).send({ error: 'Failed to fetch logs' });
        }
    };

    fetchLogs();
};