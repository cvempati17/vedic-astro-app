const express = require('express');
const router = express.Router();
const Family = require('../models/Family');

// GET /api/families - List all saved families
router.get('/', async (req, res) => {
    try {
        const families = await Family.find().select('name members').sort({ updatedAt: -1 });
        res.json({ success: true, families });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: 'Failed to fetch families' });
    }
});

// POST /api/families - Save or Update a Family
router.post('/', async (req, res) => {
    try {
        const { name, members } = req.body;

        if (!name || !members || members.length < 2) {
            return res.status(400).json({ success: false, error: 'Family Name and at least 2 members are required.' });
        }

        // Upsert (Update if exists, Create if not) based on Name
        const family = await Family.findOneAndUpdate(
            { name },
            { members, updatedAt: Date.now() },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        res.json({ success: true, family });
    } catch (err) {
        console.error(err);
        // Check for duplicate name error (though upsert handles it, race conditions might not?)
        // Actually upsert on unique field is safe.
        res.status(500).json({ success: false, error: err.message });
    }
});

// GET /api/families/:id - Get specific family details (optional, but good to have)
router.get('/:id', async (req, res) => {
    try {
        const family = await Family.findById(req.params.id);
        if (!family) return res.status(404).json({ success: false, error: 'Family not found' });
        res.json({ success: true, family });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// DELETE /api/families/:id - Delete a family
router.delete('/:id', async (req, res) => {
    try {
        const result = await Family.findByIdAndDelete(req.params.id);
        if (!result) return res.status(404).json({ success: false, error: 'Family not found' });
        res.json({ success: true, message: 'Family deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
});

module.exports = router;
