const CalculatorLog = require('../models/calculatorLog');
const logger = require('../utils/logger');
const { io } = require('../app');

exports.addLog = async (req, res) => {
    const { expression, is_valid, output } = req.body;

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

        // Emit log event to WebSocket clients
        io.emit('newLog', log);

        res.status(201).send(log);
    } catch (error) {
        logger.error(`Error logging expression: ${error.message}`);
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

    const getLogs = async () => {
        try {
            const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);

            if (logs.length > 0) {
                res.send(logs);
            } else {
                setTimeout(getLogs, 5000);
            }
        } catch (error) {
            logger.error(`Error fetching logs: ${error.message}`);
            res.status(500).send({ error: 'Failed to fetch logs' });
        }
    };

    getLogs();
};
