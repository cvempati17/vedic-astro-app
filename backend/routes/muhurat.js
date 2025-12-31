const express = require('express');
const router = express.Router();
const MuhuratEngine = require('../utils/muhuratEngine');
const Chart = require('../models/Chart');
const { protect } = require('../middleware/auth');

/**
 * @desc Calculate Muhurat
 * @route POST /api/muhurat/calculate
 * @access Private
 */
router.post('/calculate', async (req, res) => {
    try {
        const { startDate, endDate, ceremony, members, location, businessType } = req.body;

        if (!startDate || !endDate || !ceremony || !members || members.length === 0) {
            return res.status(400).json({ error: "Missing required fields: startDate, endDate, ceremony, members" });
        }

        // Enrich Members with Chart Data
        const enrichedMembers = [];
        let referenceLocation = location;

        const mongoose = require('mongoose');

        // ...

        for (const m of members) {
            let chart = null;

            // Check if chartId is a valid MongoDB ObjectId
            if (m.chartId && mongoose.Types.ObjectId.isValid(m.chartId)) {
                chart = await Chart.findById(m.chartId);
            } else if (m.chartId && !mongoose.Types.ObjectId.isValid(m.chartId)) {
                // It's likely a local chart ID (timestamp) not in DB.
                // We cannot fetch it. Frontend must pass data.
                // Check if full data was passed in 'm'
                if (m.chartData) chart = m;
            } else if (m.chartData) {
                chart = m; // Assume full object passed
            }

            if (!chart || !chart.chartData || !chart.chartData.Moon) {
                console.warn(`Skipping member ${m.name}: Invalid chart data.`);
                continue;
            }

            // Extract vital points
            const moonLong = chart.chartData.Moon.longitude;
            const moonSignIndex = Math.floor(moonLong / 30) + 1;
            const nakshatraIndex = Math.floor(moonLong / 13.333333) + 1;

            if (!referenceLocation && chart.placeOfBirth) {
                referenceLocation = chart.placeOfBirth;
            }

            enrichedMembers.push({
                name: chart.name,
                role: m.role || 'participant',
                birthDetails: {
                    moonLongitude: moonLong,
                    moonSignIndex: moonSignIndex,
                    nakshatraIndex: nakshatraIndex
                }
            });
        }

        if (enrichedMembers.length === 0) {
            return res.status(400).json({ error: "No valid charts found for participants." });
        }

        // Default location if still missing
        if (!referenceLocation) {
            referenceLocation = { lat: 28.6139, lng: 77.2090, timezone: 5.5 }; // Delhi
        }

        // Run Engine
        const results = MuhuratEngine.calculate(
            startDate,
            endDate,
            ceremony,
            enrichedMembers,
            referenceLocation,
            businessType
        );

        res.json({ success: true, count: results.length, data: results });

    } catch (error) {
        console.error("Muhurat Calculation Error:", error);
        res.status(500).json({ error: "Failed to calculate Muhurat", details: error.message });
    }
});

module.exports = router;
