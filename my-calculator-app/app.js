const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const logRoutes = require('./routes/logRoutes');
const cors = require('cors');
const CalculatorLog = require('./models/calculatorLog');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{cors: {
    origin: 'https://rishikeshcalculator.netlify.app/', // Update this to your frontend's URL
    methods: ['GET', 'POST']
}});

app.use(express.json());
app.use(cors());

app.use('/api', logRoutes);

io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('requestLogs', async () => {
        const logs = await CalculatorLog.find().sort({ created_on: -1 }).limit(10);
        socket.emit('initialLogs', logs);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

module.exports =  io ;
