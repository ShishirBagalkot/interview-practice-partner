const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config();

// Import routes
const interviewRoutes = require('./routes/interview');
const sessionRoutes = require('./routes/session');
const historyRoutes = require('./routes/history');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

// Import database
const { initializeDatabase } = require('./database/connection');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for audio
app.use('/audio', express.static(path.join(__dirname, '../data/audio')));

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/interview', interviewRoutes);
app.use('/api/session', sessionRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use(errorHandler);

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    console.log(`Socket ${socket.id} joined session ${sessionId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize database and start server
const PORT = process.env.PORT || 5000;

initializeDatabase()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  });

module.exports = { app, io };
