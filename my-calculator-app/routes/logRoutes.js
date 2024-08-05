const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');

router.post('/logs', logController.addLog);
router.get('/short-polling', logController.shortPolling);
router.get('/long-polling', logController.longPolling);
router.get('/logs', logController.getLogs);

module.exports = router;
