const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const logRoutes = require('./routes/logRoutes');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', // Allow requests from all origins
        methods: ['GET', 'POST']
    }
});

app.use(express.json());
app.use(cors());
app.use('/api', logRoutes);

// Listen for client connections
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    // Handle client disconnect
    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});

// Make `io` accessible from other modules
app.set('io', io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

module.exports = io;


