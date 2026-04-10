const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectMongoDB = require('./utils/db');
const adminRoutes = require('./routes/admin');
const contentRoutes = require('./routes/content');
const curriculumRoutes = require('./routes/curriculum');
const registrationRoutes = require('./routes/registrations');
const contestsRoutes = require('./routes/contests');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

app.set('io', io);

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running successfully.' });
});

app.use('/api/admin', adminRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/curriculum', curriculumRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/contests', contestsRoutes);

io.on('connection', (socket) => {
  socket.emit('socket:connected', { id: socket.id, ts: Date.now() });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error.' });
});

server.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on port ${process.env.PORT}.`);
    connectMongoDB();
});