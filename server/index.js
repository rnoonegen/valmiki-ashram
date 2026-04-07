const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectMongoDB = require('./utils/db');

const app = express();
dotenv.config();

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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Error:', err);
    res.status(err?.status || 500).json({ message: err?.message || 'Internal server error.' });
});

app.listen(process.env.PORT, () => {
    console.log(`✅ Server is running on port ${process.env.PORT}.`);
    connectMongoDB();
});