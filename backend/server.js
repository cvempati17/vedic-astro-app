const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { calculatePlanetaryPositions } = require('./astroService');
const authRoutes = require('./routes/auth');
const chartRoutes = require('./routes/charts');

// Connect to Database
// Connect to Database
// connectDB(); // Moved to async start function

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: '*', // Allow all origins for now to rule out CORS issues
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/charts', chartRoutes);

app.post('/api/calculate', (req, res) => {
    try {
        console.log('Received request body:', req.body);
        const { date, time, latitude, longitude, timezone } = req.body;

        console.log('Extracted values:', { date, time, latitude, longitude, timezone });

        if (!date || !time) {
            console.log('Validation failed: missing date or time');
            return res.status(400).json({ error: 'Date and Time are required' });
        }

        // Default lat/long if not provided (e.g. 0,0)
        const lat = parseFloat(latitude) || 0;
        const long = parseFloat(longitude) || 0;
        const tz = parseFloat(timezone) || 5.5; // Default to IST

        console.log('Calling calculatePlanetaryPositions with:', { date, time, lat, long, tz });
        const positions = calculatePlanetaryPositions(date, time, lat, long, tz);
        console.log('Calculation successful');
        res.json({ success: true, data: positions });
    } catch (error) {
        console.error('Calculation Error:', error);
        res.status(500).json({ error: 'Failed to calculate positions', details: error.message });
    }
});

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
