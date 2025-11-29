const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { calculatePlanetaryPositions } = require('./astroService');
const authRoutes = require('./routes/auth');
const chartRoutes = require('./routes/charts');

// Connect to Database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
