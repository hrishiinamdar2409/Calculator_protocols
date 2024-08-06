const CalculatorLog = require('../models/calculatorLog');
const logger = require('../utils/logger');
const  io  = require('../app');

exports.addLog = async (req, res) => {
    const { expression, is_valid, output } = req.body;

    if (!expression) {
        logger.info('Empty expression provided');
        return res.status(400).send({ error: 'Expression is empty' });
    }
     console.log(expression);
     console.log(is_valid);
     console.log(output);
    try {
        const log = await CalculatorLog.create({
            expression,
            is_valid,
            output,
            created_on: new Date()
        });
        logger.info(`Expression logged: ${expression}`);
        log.save();
        // Emit log event to WebSocket clients
        // console.log(log)
        // io.emit('log', log);
        // console.log("by")

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

//     getLogs();
// };
// exports.longPolling = async (req, res) => {
//     const { lastLogTime } = req.query;

//     const getLogs = async (attempts = 0) => {
//         try {
           
//             const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);

//             if (logs.length > 0) {
//                 res.send(logs);
//             } else {
//                 if (attempts < 10) { // Try 10 times before giving up
//                     setTimeout(() => getLogs(attempts + 1), 5000);
//                 } else {
//                     res.status(204).send(); // No Content
//                 }
//             }
//         } catch (error) {
//             logger.error(`Error fetching logs: ${error.message}`);
//             res.status(500).send({ error: 'Failed to fetch logs' });
//         }
//     };

    getLogs();
};

