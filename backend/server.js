const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const { calculatePlanetaryPositions } = require('./astroService');
const authRoutes = require('./routes/auth');
const chartRoutes = require('./routes/charts');
const muhuratRoutes = require('./routes/muhurat');
const tithiRoutes = require('./routes/tithi');
const familyVisionRoutes = require('./routes/familyVision');

// Connect to Database
// Connect to Database
// connectDB(); // Moved to async start function

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', // Allow all origins for now to rule out CORS issues
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    console.log('Headers:', JSON.stringify(req.headers));
    next();
});

// Auth routes
app.use('/api/auth', authRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/muhurat', muhuratRoutes);
app.use('/api/tithi', tithiRoutes);
app.use('/api/family-values', familyVisionRoutes);

const ZODIAC_SIGNS = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces'
];

const mod = (n, m) => ((n % m) + m) % m;

const getSignIndex = (longitude) => {
    const lon = typeof longitude === 'number' ? longitude : 0;
    return mod(Math.floor(lon / 30), 12);
};

const angularSeparationDeg = (a, b) => {
    const da = typeof a === 'number' ? a : 0;
    const db = typeof b === 'number' ? b : 0;
    const diff = mod(da - db, 360);
    return diff > 180 ? 360 - diff : diff;
};

const addDaysUTC = (dateStr, days) => {
    const d = new Date(`${dateStr}T00:00:00.000Z`);
    d.setUTCDate(d.getUTCDate() + days);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const daysBetweenUTC = (startDate, endDate) => {
    const s = new Date(`${startDate}T00:00:00.000Z`);
    const e = new Date(`${endDate}T00:00:00.000Z`);
    const ms = e.getTime() - s.getTime();
    return Math.floor(ms / 86400000);
};

const getEventMeta = (eventType) => {
    if (eventType === 'sign_ingress') {
        return {
            description: 'Planet enters a new sign',
            impact: 'Theme shifts for the planet',
            auspiciousness: 'Neutral'
        };
    }
    if (eventType === 'retrograde') {
        return {
            description: 'Planet appears to move backward',
            impact: 'Revisions, delays, rework',
            auspiciousness: 'Neutral'
        };
    }
    if (eventType === 'direct') {
        return {
            description: 'Planet resumes forward motion',
            impact: 'Momentum returns, clarity improves',
            auspiciousness: 'Neutral'
        };
    }
    if (eventType === 'conjunction') {
        return {
            description: 'Two planets come into close alignment',
            impact: 'Combined planetary themes become prominent',
            auspiciousness: 'Neutral'
        };
    }
    return {
        description: '',
        impact: '',
        auspiciousness: 'Neutral'
    };
};

app.post('/api/planetary-events', (req, res) => {
    try {
        const { startDate, endDate } = req.body || {};

        if (!startDate || !endDate) {
            return res.status(400).json({ error: 'startDate and endDate are required' });
        }
        if (endDate < startDate) {
            return res.status(400).json({ error: 'endDate must be on or after startDate' });
        }

        const maxDays = 366;
        const span = daysBetweenUTC(startDate, endDate);
        if (span > maxDays) {
            return res.status(400).json({ error: `Date range too large. Please use <= ${maxDays} days.` });
        }

        const planetsMandatory = ['Mars', 'Jupiter', 'Saturn', 'Rahu', 'Ketu'];
        const planetsOptional = ['Sun', 'Moon', 'Venus', 'Mercury'];
        const planets = [...planetsMandatory, ...planetsOptional];
        const orbDeg = 1;

        const events = [];

        let prev = null;
        let prevConjWithin = new Set();

        for (let i = 0; i <= span; i += 1) {
            const date = addDaysUTC(startDate, i);
            const positions = calculatePlanetaryPositions(date, '00:00', 0, 0, 0);

            const snapshot = {};
            for (const p of planets) {
                if (!positions[p]) continue;
                snapshot[p] = {
                    longitude: positions[p].longitude,
                    speed: positions[p].speed
                };
            }

            if (prev) {
                for (const p of planets) {
                    const cur = snapshot[p];
                    const prv = prev[p];
                    if (!cur || !prv) continue;

                    const prevSign = getSignIndex(prv.longitude);
                    const curSign = getSignIndex(cur.longitude);
                    if (prevSign !== curSign) {
                        const meta = getEventMeta('sign_ingress');
                        events.push({
                            date,
                            planet: p,
                            eventType: 'sign_ingress',
                            planetaryEvent: `${p} enters ${ZODIAC_SIGNS[curSign]}`,
                            description: meta.description,
                            impact: meta.impact,
                            auspiciousness: meta.auspiciousness
                        });
                    }

                    const prevSpeed = typeof prv.speed === 'number' ? prv.speed : 0;
                    const curSpeed = typeof cur.speed === 'number' ? cur.speed : 0;
                    if (prevSpeed >= 0 && curSpeed < 0) {
                        const meta = getEventMeta('retrograde');
                        events.push({
                            date,
                            planet: p,
                            eventType: 'retrograde',
                            planetaryEvent: `${p} becomes Retrograde`,
                            description: meta.description,
                            impact: meta.impact,
                            auspiciousness: meta.auspiciousness
                        });
                    } else if (prevSpeed < 0 && curSpeed >= 0) {
                        const meta = getEventMeta('direct');
                        events.push({
                            date,
                            planet: p,
                            eventType: 'direct',
                            planetaryEvent: `${p} becomes Direct`,
                            description: meta.description,
                            impact: meta.impact,
                            auspiciousness: meta.auspiciousness
                        });
                    }
                }

                const currentWithin = new Set();
                for (let a = 0; a < planets.length; a += 1) {
                    for (let b = a + 1; b < planets.length; b += 1) {
                        const pa = planets[a];
                        const pb = planets[b];
                        const ca = snapshot[pa];
                        const cb = snapshot[pb];
                        if (!ca || !cb) continue;

                        const sep = angularSeparationDeg(ca.longitude, cb.longitude);
                        const key = `${pa}__${pb}`;
                        if (sep <= orbDeg) {
                            currentWithin.add(key);
                            if (!prevConjWithin.has(key)) {
                                const meta = getEventMeta('conjunction');
                                events.push({
                                    date,
                                    planet: `${pa} + ${pb}`,
                                    eventType: 'conjunction',
                                    planetaryEvent: `${pa} conjunct ${pb}`,
                                    description: meta.description,
                                    impact: meta.impact,
                                    auspiciousness: meta.auspiciousness
                                });
                            }
                        }
                    }
                }
                prevConjWithin = currentWithin;
            }

            prev = snapshot;
        }

        events.sort((a, b) => String(a.date).localeCompare(String(b.date)));
        res.json({ events });
    } catch (error) {
        console.error('Planetary events error:', error);
        res.status(500).json({ error: 'Failed to calculate planetary events', details: error.message });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ ok: true });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
});

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
    try {
        await connectDB();
    } catch (e) {
        console.error('DB connection failed. Continuing without DB:', e?.message || e);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
