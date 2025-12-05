const express = require('express');
const router = express.Router();
const Chart = require('../models/Chart');
const { protect } = require('../middleware/auth');

// @desc    Get user charts
// @route   GET /api/charts
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const charts = await Chart.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.json(charts);
    } catch (error) {
        console.error('Error fetching charts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Save a chart
// @route   POST /api/charts
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        console.log('Saving chart request received');
        const { name, dateOfBirth, timeOfBirth, placeOfBirth, chartData } = req.body;
        console.log('Payload size:', JSON.stringify(req.body).length);

        if (!name || !dateOfBirth || !timeOfBirth || !chartData) {
            return res.status(400).json({ error: 'Please provide all required fields' });
        }

        const chart = await Chart.create({
            user: req.user.id,
            name,
            dateOfBirth,
            timeOfBirth,
            placeOfBirth,
            chartData
        });

        res.status(201).json(chart);
    } catch (error) {
        console.error('Error saving chart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Get chart by ID
// @route   GET /api/charts/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const chart = await Chart.findById(req.params.id);

        if (!chart) {
            return res.status(404).json({ error: 'Chart not found' });
        }

        // Check user
        if (chart.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'User not authorized' });
        }

        res.json(chart);
    } catch (error) {
        console.error('Error fetching chart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Delete chart
// @route   DELETE /api/charts/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const chart = await Chart.findById(req.params.id);

        if (!chart) {
            return res.status(404).json({ error: 'Chart not found' });
        }

        // Check user
        if (chart.user.toString() !== req.user.id) {
            return res.status(401).json({ error: 'User not authorized' });
        }

        await chart.deleteOne();

        res.json({ id: req.params.id, message: 'Chart removed' });
    } catch (error) {
        console.error('Error deleting chart:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// @desc    Bulk delete charts
// @route   POST /api/charts/bulk-delete
// @access  Private
router.post('/bulk-delete', protect, async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ error: 'Please provide an array of chart IDs' });
        }

        // Delete charts where _id is in ids AND user is the authenticated user
        const result = await Chart.deleteMany({
            _id: { $in: ids },
            user: req.user.id
        });

        res.json({ message: 'Charts deleted', count: result.deletedCount });
    } catch (error) {
        console.error('Error bulk deleting charts:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
