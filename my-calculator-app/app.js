const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/database');
const logRoutes = require('./routes/logRoutes');
const cors = require('cors');
const logger = require('./utils/logger');

const app = express();
const server = http.createServer(app);
const io = socketIo(server,{cors: {
    origin: 'http://localhost:3000', 
    methods: ['GET', 'POST']
}});

app.use(express.json());
app.use(cors());
app.use('/api', logRoutes);

// here in this client is litening 
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
    });
});


app.set('io', io);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

module.exports = io;


